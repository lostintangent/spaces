import { Store } from "redux";
import { v4 } from "uuid";
import { commands, env, QuickPickItem, WebviewPanel, window } from "vscode";
import { LiveShare } from "vsls";
import { getTopCommunities } from "../api";
import { config } from "../config";
import { EXTENSION_NAME, JOIN_URL_PATTERN } from "../constants";
import { LocalStorage } from "../storage/LocalStorage";
import { clearMessages, joinCommunity, leaveCommunity, loadCommunities, makeCommunityPrivate, makeCommunityPublic, muteAllCommunities, muteCommunity, unmuteAllCommunities, unmuteCommunity } from "../store/actions";
import { IStore } from "../store/model";
import { CommunityNode } from "../tree/nodes";
import { createWebView } from "../webView";

export function registerCommunityCommands(
  api: LiveShare,
  store: Store,
  storage: LocalStorage,
  extensionPath: string
) {
  commands.registerCommand(`${EXTENSION_NAME}.joinCommunity`, async () => {
    if (!api.session.user) {
      await commands.executeCommand("liveshare.signin.browser");
    }

    const joinedCommunities = storage.getCommunities();
    const topCommunities = await getTopCommunities();

    const itemSuffix = (count: number) => "member" + (count > 1 ? "s" : "");
    const communityItems = topCommunities
      .filter(({ name }: any) => {
        return !joinedCommunities.includes(name);
      })
      .map(
        ({ name, member_count }: any) =>
          <QuickPickItem>{
            label: name,
            description: `(${member_count} ${itemSuffix(member_count)})`
          }
      );

    const list = window.createQuickPick();
    list.placeholder = "Specify the community you'd like to join";
    list.items = communityItems;

    list.onDidChangeValue(searchString => {
      if (JOIN_URL_PATTERN.test(searchString)) {
        searchString = (<any>JOIN_URL_PATTERN.exec(searchString)).groups
          .community;
      }

      list.items = searchString
        ? [{ label: searchString }, ...communityItems]
        : communityItems;
    });

    list.onDidAccept(() => {
      const userInfo = api.session.user;
      let community = list.selectedItems[0].label;
      if (community && userInfo && userInfo.emailAddress) {
        let key;
        if (JOIN_URL_PATTERN.test(community)) {
          const { groups }: any = JOIN_URL_PATTERN.exec(community);

          community = groups.community;
          key = groups.key;
        }

        store.dispatch(<any>joinCommunity(community, key));
      }
      list.hide();
    });

    list.show();
  });

  commands.registerCommand(
    `${EXTENSION_NAME}.leaveCommunity`,
    async (node?: CommunityNode) => {
      let community: string | undefined;
      const userInfo = api.session.user;

      if (!node) {
        const { communities } = <IStore>store.getState();
        community = await window.showQuickPick(
          communities.map(n => n.name, {
            placeHolder: "Select the community to leave"
          })
        );
      } else {
        community = node.name;
      }

      if (community && userInfo && userInfo.emailAddress) {
        store.dispatch(<any>leaveCommunity(community));
      }
    }
  );

  commands.registerCommand(`${EXTENSION_NAME}.refreshCommunities`, async () => {
    store.dispatch(<any>loadCommunities());
  });

  let webViewPanel: WebviewPanel | null;
  commands.registerCommand(
    `${EXTENSION_NAME}.viewCommunityDetails`,
    async () => {
      if (!webViewPanel) {
        webViewPanel = createWebView(extensionPath);
        webViewPanel.onDidDispose(() => (webViewPanel = null));
      } else {
        webViewPanel.reveal();
      }
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.clearMessages`,
    (node: CommunityNode) => {
      store.dispatch(clearMessages(node.name));
    }
  );

  async function getOrRequestCommunityName(
    placeHolder: string,
    node?: CommunityNode
  ) {
    let community;
    if (!node) {
      const { communities } = <IStore>store.getState();
      community = await window.showQuickPick(
        communities.map(n => n.name, {
          placeHolder
        })
      );
    } else {
      community = node.name;
    }

    return community!;
  }

  commands.registerCommand(
    `${EXTENSION_NAME}.muteCommunity`,
    async (node?: CommunityNode) => {
      let community = await getOrRequestCommunityName(
        "Select the community to mute",
        node
      );

      store.dispatch(muteCommunity(community));
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.unmuteCommunity`,
    async (node?: CommunityNode) => {
      let community = await getOrRequestCommunityName(
        "Select the community to unmute",
        node
      );

      store.dispatch(unmuteCommunity(community));
    }
  );

  commands.registerCommand(`${EXTENSION_NAME}.muteAllCommunities`, () => {
    store.dispatch(muteAllCommunities());
  });

  commands.registerCommand(`${EXTENSION_NAME}.unmuteAllCommunities`, () => {
    store.dispatch(unmuteAllCommunities());
  });

  commands.registerCommand(
    `${EXTENSION_NAME}.makeCommunityPrivate`,
    (node?: CommunityNode) => {
      const key = v4();
      store.dispatch(
        makeCommunityPrivate({ community: node!.community.name, key })
      );
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.makeCommunityPublic`,
    (node?: CommunityNode) => {
      store.dispatch(makeCommunityPublic(node!.community.name));
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.copyCommunityLink`,
    async (node: CommunityNode) => {
      let url = `${config.serviceUri}/join_redirect/${node.name}`;

      if (node.community.isPrivate) {
        url += `?key=${node.community.key}`;
      }

      env.clipboard.writeText(url);

      const response = await window.showInformationMessage(
        `The join URL for the "${node.name}" community has been copied to your clipboard!`,
        "Copy again"
      );

      if (response === "Copy again") {
        env.clipboard.writeText(url);
      }
    }
  );
}
