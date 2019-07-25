import { ExtensionContext, commands, window, DocumentHighlight } from "vscode";
import * as redux from "redux";
import thunk from "redux-thunk";
import * as vsls from "vsls";
import { registerContactProvider } from "./ContactProvider";
import { registerTreeProvider } from "./TreeProvider";
import { IStore } from "./store/model";
import reducer from "./store/reducer";
import { joinCommunityAsync, leaveNetworkAsync, loadCommunitiesAsync } from "./store/actions";

const EXTENSION_NAME = "vsls-communities";

export async function activate(context: ExtensionContext) {
	const store = redux.createStore(
		reducer,
		redux.applyMiddleware(thunk)
	);

	const api = await vsls.getApi();

	registerContactProvider(api!, store);
	registerTreeProvider(api!, store, context.extensionPath);

	commands.registerCommand(`${EXTENSION_NAME}.joinCommunity`, async () => {
		const community = await window.showInputBox({ placeHolder: "Specify the community you'd like to join" });
		community && store.dispatch(<any>joinCommunityAsync(community));
	});

	commands.registerCommand(`${EXTENSION_NAME}.leaveCommunity`, async () => {	
		const { communities } = <IStore>store.getState();
		const community = await window.showQuickPick(communities.map((n) => n.name, { placeHolder: "Select the community to leave"}));
		community && store.dispatch(<any>leaveNetworkAsync(community));
	});

	commands.registerCommand(`${EXTENSION_NAME}.refreshCommunities`, async () => {	
		store.dispatch(<any>loadCommunitiesAsync());	
	});

	store.dispatch(<any>loadCommunitiesAsync());
}