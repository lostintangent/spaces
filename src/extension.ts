import { applyMiddleware, createStore as createReduxStore } from "redux";
import thunk from "redux-thunk";
import { ExtensionContext } from "vscode";
import { getApi as getVslsApi } from "vsls";
import { registerCommands } from "./commands";
import { config } from "./config";
import { registerContactProvider } from "./contacts/ContactProvider";
import { LocalStorage } from "./storage/LocalStorage";
import { loadCommunitiesAsync } from "./store/actions";
import { reducer } from "./store/reducer";
import { registerTreeProvider } from "./tree/TreeProvider";

export async function activate(context: ExtensionContext) {
	const api = (await getVslsApi())!;
	const store = createReduxStore(reducer, applyMiddleware(thunk));

	if (config.showSuggestedContacts) {
		registerContactProvider(api, store);
	}

	registerTreeProvider(api, store, context.extensionPath);

	const storage = new LocalStorage(context.globalState);
	registerCommands(api, store, storage);

	store.dispatch(<any>loadCommunitiesAsync(storage, api, store));
}