import { Store } from "redux";
import { v4 } from "uuid";
import { commands, env, QuickPickItem, window } from "vscode";
import { LiveShare } from "vsls";
import { getTopSpaces } from "../api";
import { config } from "../config";
import { EXTENSION_NAME, JOIN_URL_PATTERN } from "../constants";
import {
  openSpaceReadme,
  previewSpaceReadme
} from "../readmeFileSystemProvider";
import { LocalStorage } from "../storage/LocalStorage";
import {
  blockMember,
  clearMessages,
  demoteToMember,
  joinSpace,
  leaveSpace,
  loadSpaces,
  makeSpacePrivate,
  makeSpacePublic,
  muteAllSpaces,
  muteSpace,
  promoteToFounder,
  unblockMember,
  unmuteAllSpaces,
  unmuteSpace
} from "../store/actions";
import { IStore } from "../store/model";
import { MemberNode, SpaceNode } from "../tree/nodes";

export function registerSpaceCommands(
  api: LiveShare,
  store: Store,
  storage: LocalStorage,
  extensionPath: string
) {
  commands.registerCommand(`${EXTENSION_NAME}.joinSpace`, async () => {
    if (!api.session.user) {
      await commands.executeCommand("liveshare.signin.browser");
    }

    const joinedSpaces = storage.getSpaces();
    const topSpaces = await getTopSpaces();

    const itemSuffix = (count: number) => "member" + (count > 1 ? "s" : "");
    const spaceItems = topSpaces
      .filter(({ name }: any) => {
        return !joinedSpaces.includes(name);
      })
      .map(
        ({ name, member_count }: any) =>
          <QuickPickItem>{
            label: name,
            description: `(${member_count} ${itemSuffix(member_count)})`
          }
      );

    const list = window.createQuickPick();
    list.placeholder = "Specify the space you'd like to join";
    list.items = spaceItems;

    list.onDidChangeValue(searchString => {
      list.items = searchString
        ? [{ label: searchString }, ...spaceItems]
        : spaceItems;
    });

    list.onDidAccept(() => {
      const userInfo = api.session.user;
      let space = list.selectedItems[0].label;
      if (space && userInfo && userInfo.emailAddress) {
        let key;
        if (JOIN_URL_PATTERN.test(space)) {
          const { groups }: any = JOIN_URL_PATTERN.exec(space);

          space = groups.space;
          key = groups.key;
        }

        store.dispatch(<any>joinSpace(space, key));
      }
      list.hide();
    });

    list.show();
  });

  commands.registerCommand(
    `${EXTENSION_NAME}.leaveSpace`,
    async (node?: SpaceNode) => {
      let space: string | undefined;
      const userInfo = api.session.user;

      if (!node) {
        const { spaces: spaces } = <IStore>store.getState();
        space = await window.showQuickPick(
          spaces.map(n => n.name, {
            placeHolder: "Select the space to leave"
          })
        );
      } else {
        space = node.name;
      }

      if (space && userInfo && userInfo.emailAddress) {
        store.dispatch(<any>leaveSpace(space));
      }
    }
  );

  commands.registerCommand(`${EXTENSION_NAME}.refreshSpaces`, async () => {
    store.dispatch(<any>loadSpaces());
  });

  commands.registerCommand(
    `${EXTENSION_NAME}.clearMessages`,
    (node: SpaceNode) => {
      store.dispatch(clearMessages(node.name));
    }
  );

  async function getOrRequestSpaceName(placeHolder: string, node?: SpaceNode) {
    let space;
    if (!node) {
      const { spaces } = <IStore>store.getState();
      space = await window.showQuickPick(
        spaces.map(n => n.name, {
          placeHolder
        })
      );
    } else {
      space = node.name;
    }

    return space!;
  }

  commands.registerCommand(
    `${EXTENSION_NAME}.muteSpace`,
    async (node?: SpaceNode) => {
      let space = await getOrRequestSpaceName("Select the space to mute", node);

      store.dispatch(muteSpace(space));
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.unmuteSpace`,
    async (node?: SpaceNode) => {
      let space = await getOrRequestSpaceName(
        "Select the space to unmute",
        node
      );

      store.dispatch(unmuteSpace(space));
    }
  );

  commands.registerCommand(`${EXTENSION_NAME}.muteAllSpaces`, () => {
    store.dispatch(muteAllSpaces());
  });

  commands.registerCommand(`${EXTENSION_NAME}.unmuteAllSpaces`, () => {
    store.dispatch(unmuteAllSpaces());
  });

  commands.registerCommand(
    `${EXTENSION_NAME}.makeSpacePrivate`,
    (node?: SpaceNode) => {
      const key = v4();
      store.dispatch(makeSpacePrivate({ space: node!.space.name, key }));
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.makeSpacePublic`,
    (node?: SpaceNode) => {
      store.dispatch(makeSpacePublic(node!.space.name));
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.copySpaceLink`,
    async (node: SpaceNode) => {
      let url = `${config.serviceUri}/join_redirect/${node.name}`;

      if (node.space.isPrivate) {
        url += `?key=${node.space.key}`;
      }

      env.clipboard.writeText(url);

      const response = await window.showInformationMessage(
        `The invitation URL for the "${node.name}" space has been copied to your clipboard!`,
        "Copy again"
      );

      if (response === "Copy again") {
        env.clipboard.writeText(url);
      }
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.editReadme`,
    (node?: SpaceNode) => {
      openSpaceReadme(node!.name);
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.openReadme`,
    (node?: SpaceNode) => {
      previewSpaceReadme(node!.name);
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.promoteToFounder`,
    (node?: MemberNode) => {
      promoteToFounder({ space: node!.space.name, member: node!.member.email });
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.demoteToMember`,
    (node?: MemberNode) => {
      demoteToMember({ space: node!.space.name, member: node!.member.email });
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.blockMember`,
    (node?: MemberNode) => {
      blockMember({ space: node!.space.name, member: node!.member.email });
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.unblockMember`,
    (node?: MemberNode) => {
      unblockMember({ space: node!.space.name, member: node!.member.email });
    }
  );
}
