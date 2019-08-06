import { applyMiddleware, createStore as createReduxStore } from "redux";
import thunk from "redux-thunk";
import { ExtensionContext, window, commands, workspace, ConfigurationTarget } from "vscode";
import { getApi as getVslsApi } from "vsls";
import { registerCommands } from "./commands";
import { config } from "./config";
import { registerContactProvider } from "./contacts/ContactProvider";
import { intializeSessionManager } from "./sessionManager";
import { LocalStorage } from "./storage/LocalStorage";
import { loadCommunitiesAsync, updateCommunityAsync, joinCommunityAsync } from "./store/actions";
import { reducer } from "./store/reducer";
import { registerTreeProvider } from "./tree/TreeProvider";
import { ChatApi } from "./chatApi";
import ws from './ws';
import { registerUriHandler } from "./uriHandler";

export async function activate(context: ExtensionContext) {
	workspace.getConfiguration("liveshare")
		.update("featureSet", "insiders", ConfigurationTarget.Global);

	const api = (await getVslsApi())!;
	const store = createReduxStore(reducer, applyMiddleware(thunk));
	const chatApi = new ChatApi(api, store);

	if (config.showSuggestedContacts) {
		registerContactProvider(api, store);
	}

	registerTreeProvider(api, store, context.extensionPath);

	const storage = new LocalStorage(context.globalState);
	registerCommands(api, store, storage, context.extensionPath, chatApi);

	registerUriHandler(api, store, storage, chatApi);

	intializeSessionManager(api, store, () => {
		const vslsUser = api.session.user;

		store.dispatch(<any>loadCommunitiesAsync(storage, api, store));

		if (vslsUser && vslsUser.emailAddress) {
			ws.init(vslsUser.emailAddress, (data: any) => {
				const { name, members, sessions, messages } = data;
				chatApi.onMessageReceived(name, messages);
				store.dispatch(<any>updateCommunityAsync(name, members, sessions, api, store))
			});
		}
	});

	return chatApi;
}