import { Store } from "redux";
import { commands, window } from "vscode";
import { LiveShare } from "vsls";
import { LocalStorage } from "./storage/LocalStorage";
import { joinCommunityAsync, leaveCommunityAsync, loadCommunitiesAsync } from "./store/actions";
import { IStore } from "./store/model";
import { CommunityNode, MemberNode } from "./tree/nodes";

const EXTENSION_NAME = "liveshare";

export function registerCommands(api: LiveShare, store: Store, storage: LocalStorage) {
    commands.registerCommand(`${EXTENSION_NAME}.joinCommunity`, async () => {
        const community = await window.showInputBox({ placeHolder: "Specify the community you'd like to join" });
        const userInfo = api.session.user; // TODO: Show login in tree when the user is not logged in

        if (community && userInfo && userInfo.emailAddress) {
            store.dispatch(<any>joinCommunityAsync(community, storage, userInfo, api, store));
        }
    });

    commands.registerCommand(`${EXTENSION_NAME}.leaveCommunity`, async (node?: CommunityNode) => {	
        let community: string | undefined;
        const userInfo = api.session.user; // TODO: Show login in tree when the user is not logged in

        if (!node) {
            const { communities } = <IStore>store.getState();
            community = await window.showQuickPick(communities.map((n) => n.name, { placeHolder: "Select the community to leave"}));
        } else {
            community = node.name;
        }

        if (community && userInfo && userInfo.emailAddress) {
            store.dispatch(<any>leaveCommunityAsync(community, storage, api, store));
        }
    });

    commands.registerCommand(`${EXTENSION_NAME}.inviteMember`, async (node?: MemberNode) => {
        if (node) {
            inviteMember(node.email);
        }
    });

    commands.registerCommand(`${EXTENSION_NAME}.inviteMemberByEmail`, async (node?: MemberNode) => {
        if (node) {
            inviteMember(node.email, true);
        }
    });

    async function inviteMember(email: string, useEmail: boolean = false) {
        const { contacts } = await api.getContacts([email]);
        contacts[email].invite({ useEmail });
    }

    commands.registerCommand(`${EXTENSION_NAME}.refreshCommunities`, async () => {	
        store.dispatch(<any>loadCommunitiesAsync(storage, api, store));	
    });
}