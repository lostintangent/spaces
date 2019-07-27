import { ExtensionContext, commands, window, DocumentHighlight } from "vscode";
import * as redux from "redux";
import thunk from "redux-thunk";
import * as vsls from "vsls";
import { registerContactProvider } from "./ContactProvider";
import { registerTreeProvider } from "./TreeProvider";
import { IStore, ICommunity } from "./store/model";
import reducer from "./store/reducer";
import { joinCommunityAsync, leaveNetworkAsync, loadCommunitiesAsync } from "./store/actions";
import { LocalStorage } from "./LocalStorage";
import { CommunityNode, MemberNode } from "./TreeProvider";

const EXTENSION_NAME = "liveshare";

export async function activate(context: ExtensionContext) {
	const storage = new LocalStorage(context.globalState);

	const store = redux.createStore(
		reducer,
		redux.applyMiddleware(thunk)
	);

	const api = (await vsls.getApi())!;

	//registerContactProvider(api!, store);
	registerTreeProvider(api!, store, context.extensionPath);

	commands.registerCommand(`${EXTENSION_NAME}.joinCommunity`, async () => {
		const community = await window.showInputBox({ placeHolder: "Specify the community you'd like to join" });
		const userInfo = api.session.user; // TODO: Show login in tree when the user is not logged in

		if (community && userInfo && userInfo.emailAddress) {
			store.dispatch(<any>joinCommunityAsync(community, storage, userInfo));
		}
	});

	commands.registerCommand(`${EXTENSION_NAME}.leaveCommunity`, async (node?: CommunityNode) => {	
		let community: string | undefined;
		const userInfo = api.session.user; // TODO: Show login in tree when the user is not logged in

		if (!node) {
			const { communities } = <IStore>store.getState();
			community = await window.showQuickPick(communities.map((n) => n.name, { placeHolder: "Select the community to leave"}));
		} else {
			community = node.label;
		}

		if (community && userInfo && userInfo.emailAddress) {
			store.dispatch(<any>leaveNetworkAsync(community, storage, userInfo));
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

	store.dispatch(<any>loadCommunitiesAsync(storage, api, store));
}