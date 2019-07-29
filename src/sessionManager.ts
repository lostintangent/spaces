import { LiveShare } from "vsls";
import { commands } from "vscode";
import { Store } from "redux";

export function intializeSessionManager(api: LiveShare, store: Store) {
    commands.executeCommand("setContext", "communities:inSession", false);

	api.onDidChangeSession((e) => {
		if (e.session.id) {
			commands.executeCommand("setContext", "communities:inSession", true);
		} else {
			commands.executeCommand("setContext", "communities:inSession", false);
		}
	})
};