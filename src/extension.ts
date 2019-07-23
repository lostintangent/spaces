import { ExtensionContext, commands, window } from 'vscode';
import * as redux from "redux";
import thunk from "redux-thunk";
import * as vsls from "vsls";
import { registerContactProvider } from "./ContactProvider";
import { registerTreeProvider } from "./TreeProvider";
import { IStore } from "./store/model";
import reducer from "./store/reducer";
import { joinNetworkAsync, leaveNetworkAsync, loadNetworksAsync } from "./store/actions";

export async function activate(context: ExtensionContext) {
	const store = redux.createStore(
		reducer,
		redux.applyMiddleware(thunk)
	);

	const api = await vsls.getApi();

	registerContactProvider(api!, store);
	registerTreeProvider(store);

	commands.registerCommand("vsls-can.joinNetwork", async () => {
		const network = await window.showInputBox({ placeHolder: "Specify the network you'd like to join" });
		network && store.dispatch(<any>joinNetworkAsync(network));
	});

	commands.registerCommand("vsls-can.leaveNetwork", async () => {	
		const { networks } = <IStore>store.getState();
		const network = await window.showQuickPick(networks.map((n) => n.name, { placeHolder: "Select the network to leave"}));
		network && store.dispatch(<any>leaveNetworkAsync(network));
	});

	commands.registerCommand("vsls-can.refresh", async () => {	
		store.dispatch(<any>loadNetworksAsync());	
	});

	store.dispatch(<any>loadNetworksAsync());
}
