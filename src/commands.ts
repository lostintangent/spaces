import { Store } from "redux";
import { commands, Uri, WebviewPanel, window } from "vscode";
import { LiveShare } from "vsls";
import { getTopCommunities } from "./api";
import { ChatApi } from "./chatApi";
import { LocalStorage } from "./storage/LocalStorage";
import { createSessionAsync, joinCommunityAsync, leaveCommunityAsync, loadCommunitiesAsync, SessionType } from "./store/actions";
import { ICommunity, IStore } from "./store/model";
import { CommunityBroadcastsNode, CommunityCodeReviewsNode, CommunityHelpRequestsNode, CommunityNode, MemberNode, SessionNode } from "./tree/nodes";
import { createWebView } from "./webView";

const EXTENSION_NAME = "liveshare";

export function registerCommands(api: LiveShare, store: Store, storage: LocalStorage, extensionPath: string, chatApi: ChatApi) {
    commands.registerCommand(`${EXTENSION_NAME}.joinCommunity`, async () => {
        const communities = (await getTopCommunities()).map((c: any) => ({
            label: c.name,
            description: `(${c.member_count} members)`
        }));

        const list = window.createQuickPick();
        list.placeholder = "Specify the community you'd like to join";
        list.items = communities;
        list.show();
        list.onDidChangeValue((e) => {
            list.items = [{ label: e }, ...communities];
        });

        list.onDidAccept(() => {
            const userInfo = api.session.user; // TODO: Show login in tree when the user is not logged in
            const community = list.selectedItems[0].label;
            if (community && userInfo && userInfo.emailAddress) {
                store.dispatch(<any>joinCommunityAsync(community, storage, userInfo, api, store, chatApi));
            }
        });        
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

    let webViewPanel: WebviewPanel | null;
    commands.registerCommand(`${EXTENSION_NAME}.viewCommunityDetails`, async () => {
        if (!webViewPanel) {
            webViewPanel = createWebView(extensionPath);
            webViewPanel.onDidDispose(() => webViewPanel = null);
        } else {
            webViewPanel.reveal();
        }
    });

    async function createSession(type: SessionType, node?: { community: ICommunity }) {
        let community;
        if (node) {
            community = node.community.name;
        } else {
            const { communities } = <IStore>store.getState();
            community = await window.showQuickPick(communities.map((n) => n.name, { placeHolder: "Select the community to make this request within" }));
        }

        if (community) {
            const description = await window.showInputBox({ placeHolder: "Enter a description" });
            if (description) {
                store.dispatch(<any>createSessionAsync(community, type, description, api));
            }
        }
    }

    commands.registerCommand(`${EXTENSION_NAME}.createHelpRequest`, async (node?: CommunityHelpRequestsNode) => {
        createSession(SessionType.HelpRequest, node);
    });

    commands.registerCommand(`${EXTENSION_NAME}.startBroadcast`, async (node?: CommunityBroadcastsNode) => {	
        createSession(SessionType.Broadcast, node);
    });

    commands.registerCommand(`${EXTENSION_NAME}.createCodeReview`, async (node?: CommunityCodeReviewsNode) => {	
        createSession(SessionType.CodeReview, node);
    });

    commands.registerCommand(`${EXTENSION_NAME}.joinCommunitySession`, async (node: SessionNode) => {	
        api.join(Uri.parse(node.session.url));
    });
}