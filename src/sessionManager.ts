import { Store } from "redux";
import { commands } from "vscode";
import { LiveShare } from "vsls";
import { endActiveSessionAsync } from "./store/actions";

export function intializeSessionManager(api: LiveShare, store: Store) {
    commands.executeCommand("setContext", "communities:inSession", false);

	api.onDidChangeSession((e) => {
		if (e.session.id) {
			commands.executeCommand("setContext", "communities:inSession", true);
		} else {
			commands.executeCommand("setContext", "communities:inSession", false);

			store.dispatch(<any>endActiveSessionAsync(api, store));
		}
	})
};