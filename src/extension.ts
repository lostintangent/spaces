import { applyMiddleware, createStore as createReduxStore } from "redux";
import thunk from "redux-thunk";
import { ExtensionContext } from "vscode";
import { getApi as getVslsApi } from "vsls";
import { registerCommands } from "./commands";
import { config } from "./config";
import { registerContactProvider } from "./contacts/ContactProvider";
import { intializeSessionManager } from "./sessionManager";
import { LocalStorage } from "./storage/LocalStorage";
import { loadCommunitiesAsync, updateCommunityAsync } from "./store/actions";
import { reducer } from "./store/reducer";
import { registerTreeProvider } from "./tree/TreeProvider";
import { ChatApi } from "./chatApi";
import ws from './ws';

export async function activate(context: ExtensionContext) {
	const api = (await getVslsApi())!;
	const store = createReduxStore(reducer, applyMiddleware(thunk));

	if (config.showSuggestedContacts) {
		registerContactProvider(api, store);
	}

	intializeSessionManager(api, store);
	
	registerTreeProvider(api, store, context.extensionPath);

	const storage = new LocalStorage(context.globalState);
	registerCommands(api, store, storage, context.extensionPath);

	store.dispatch(<any>loadCommunitiesAsync(storage, api, store));

	const chatApi = new ChatApi(api, store);

	// Wait 5 secs for vsls to get activated
	// TODO: If the user is not logged in, we will never initiate the ws
	setTimeout(() => {
		const vslsUser = api.session.user;

		if (vslsUser && vslsUser.emailAddress) {
			ws.init(vslsUser.emailAddress, (data: any) => {
				const { name, members, sessions, messages } = data;
				chatApi.onMessageReceived(name, messages);
				store.dispatch(<any>updateCommunityAsync(name, members, sessions, api, store))
			});
		}
	}, 5000);

	return chatApi;
}