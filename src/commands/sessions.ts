import { Store } from "redux";
import { commands, window } from "vscode";
import { Access } from "vsls";
import { ISessionStateChannel } from "../channels/sessionState";
import { EXTENSION_NAME } from "../constants";
import { createSession } from "../store/actions";
import { ISpace, IStore, SessionType } from "../store/model";
import {
  SessionNode,
  SpaceBroadcastsNode,
  SpaceCodeReviewsNode,
  SpaceHelpRequestsNode
} from "../tree/nodes";

export function registerSessionCommands(
  store: Store,
  sessionStateChannel: ISessionStateChannel
) {
  async function createSessionCommand(
    type: SessionType,
    node?: { space: ISpace } | ISpace,
    access: Access = Access.ReadOnly
  ) {
    let space;
    if (node) {
      // @ts-ignore
      space = node.space ? node.space.name : node.name;
    } else {
      const { spaces } = <IStore>store.getState();
      space = await window.showQuickPick(
        spaces.map(n => n.name, {
          placeHolder: "Select the space to make this request within"
        })
      );
    }

    if (space) {
      const description = await window.showInputBox({
        placeHolder: "Enter a description"
      });
      if (description) {
        store.dispatch(<any>createSession(space, type, description, access));
      }
    }
  }

  commands.registerCommand(
    `${EXTENSION_NAME}.createHelpRequest`,
    async (node?: SpaceHelpRequestsNode | ISpace) => {
      createSessionCommand(SessionType.HelpRequest, node);
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.startBroadcast`,
    async (node?: SpaceBroadcastsNode | ISpace) => {
      createSessionCommand(SessionType.Broadcast, node);
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.createCodeReview`,
    async (node?: SpaceCodeReviewsNode | ISpace) => {
      createSessionCommand(SessionType.CodeReview, node);
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.joinSpaceSession`,
    async (node: SessionNode) => {
      return commands.executeCommand("liveshare.join", {
        link: node.session.url
      });
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.endSession`,
    async (node: SessionNode) => {
      sessionStateChannel.endActiveSession();
    }
  );
}
