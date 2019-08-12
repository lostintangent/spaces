import { Store } from "redux";
import { commands, window } from "vscode";
import { Access } from "vsls";
import { ISessionStateChannel } from "../channels/sessionState";
import { EXTENSION_NAME } from "../constants";
import { createSession } from "../store/actions";
import { ICommunity, IStore, SessionType } from "../store/model";
import {
  CommunityBroadcastsNode,
  CommunityCodeReviewsNode,
  CommunityHelpRequestsNode,
  SessionNode
} from "../tree/nodes";

export function registerSessionCommands(
  store: Store,
  sessionStateChannel: ISessionStateChannel
) {
  async function createSessionCommand(
    type: SessionType,
    node?: { community: ICommunity } | ICommunity,
    access: Access = Access.ReadOnly
  ) {
    let community;
    if (node) {
      // @ts-ignore
      community = node.community ? node.community.name : node.name;
    } else {
      const { communities } = <IStore>store.getState();
      community = await window.showQuickPick(
        communities.map(n => n.name, {
          placeHolder: "Select the community to make this request within"
        })
      );
    }

    if (community) {
      const description = await window.showInputBox({
        placeHolder: "Enter a description"
      });
      if (description) {
        store.dispatch(<any>(
          createSession(community, type, description, access)
        ));
      }
    }
  }

  commands.registerCommand(
    `${EXTENSION_NAME}.createHelpRequest`,
    async (node?: CommunityHelpRequestsNode | ICommunity) => {
      createSessionCommand(SessionType.HelpRequest, node);
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.startBroadcast`,
    async (node?: CommunityBroadcastsNode | ICommunity) => {
      createSessionCommand(SessionType.Broadcast, node);
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.createCodeReview`,
    async (node?: CommunityCodeReviewsNode | ICommunity) => {
      createSessionCommand(SessionType.CodeReview, node);
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.joinCommunitySession`,
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
