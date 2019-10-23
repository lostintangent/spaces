import * as vscode from "vscode";
import { LiveShare } from "vsls";

let commentId = 1;

class SpaceComment implements vscode.Comment {
  id: number;
  label: string | undefined;
  constructor(
    public body: string | vscode.MarkdownString,
    public mode: vscode.CommentMode,
    public author: vscode.CommentAuthorInformation,
    public parent?: vscode.CommentThread
  ) {
    this.id = ++commentId;
  }
}

function replyNote(reply: vscode.CommentReply, author: string) {
  let thread = reply.thread;
  let newComment = new SpaceComment(
    reply.text,
    vscode.CommentMode.Preview,
    { name: author },
    thread
  );
  thread.comments = [...thread.comments, newComment];
}

let controller;
export function registerCommentController(liveShare: LiveShare) {
  controller = vscode.comments.createCommentController(
    "liveshare.spaces",
    "Live Share Spaces"
  );

  controller.commentingRangeProvider = {
    provideCommentingRanges: document => {
      return [new vscode.Range(0, 0, document.lineCount, 20)];
    }
  };

  //controller.createCommentThread()

  vscode.commands.registerCommand(
    "liveshare.addSpaceComment",
    (reply: vscode.CommentReply) => {
      replyNote(reply, liveShare.session.user!.displayName);
    }
  );

  vscode.commands.registerCommand(
    "liveshare.saveSpaceComment",
    (comment: SpaceComment) => {
      if (!comment.parent) {
        return;
      }

      comment.parent.comments = comment.parent.comments.map(cmt => {
        if ((cmt as SpaceComment).id === comment.id) {
          cmt.mode = vscode.CommentMode.Preview;
        }

        return cmt;
      });
    }
  );

  vscode.commands.registerCommand(
    "liveshare.editSpaceComment",
    (comment: SpaceComment) => {
      if (!comment.parent) {
        return;
      }

      comment.parent.comments = comment.parent.comments.map(cmt => {
        if ((cmt as SpaceComment).id === comment.id) {
          cmt.mode = vscode.CommentMode.Editing;
        }

        return cmt;
      });
    }
  );

  vscode.commands.registerCommand(
    "liveshare.replySpaceComment",
    (reply: vscode.CommentReply) => {
      replyNote(reply, liveShare.session.user!.displayName);
    }
  );

  vscode.commands.registerCommand(
    "liveshare.deleteSpaceComment",
    (comment: SpaceComment) => {
      let thread = comment.parent;
      if (!thread) {
        return;
      }

      thread.comments = thread.comments.filter(
        cmt => (cmt as SpaceComment).id !== comment.id
      );

      if (thread.comments.length === 0) {
        thread.dispose();
      }
    }
  );

  vscode.commands.registerCommand(
    "liveshare.deleteSpaceThread",
    (thread: vscode.CommentThread) => {
      thread.dispose();
    }
  );

  vscode.commands.registerCommand(
    "liveshare.cancelSaveNote",
    (comment: SpaceComment) => {
      if (!comment.parent) {
        return;
      }

      comment.parent.comments = comment.parent.comments.map(cmt => {
        if ((cmt as SpaceComment).id === comment.id) {
          cmt.mode = vscode.CommentMode.Preview;
        }

        return cmt;
      });
    }
  );
}
