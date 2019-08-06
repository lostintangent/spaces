import { Store } from "redux";
import { commands } from "vscode";
import { LiveShare } from "vsls";
import { endActiveSessionAsync, userAuthenticationChanged } from "./store/actions";
import { onPropertyChanged } from "./utils";

export function intializeSessionManager(api: LiveShare, store: Store) {
    commands.executeCommand("setContext", "communities:inSession", false);

	api.onDidChangeSession((e) => {
		if (e.session.id) {
			commands.executeCommand("setContext", "communities:inSession", true);
		} else {
			commands.executeCommand("setContext", "communities:inSession", false);

			store.dispatch(<any>endActiveSessionAsync(api, store));
		}
	});

	// TODO: Replace the following code as soon as the Live Share API fired the 
	// onDidChangeSession event for login/log out events

	commands.executeCommand("setContext", "communities:signedIn", !!api.session.user);

	// @ts-ignore
	api.session = onPropertyChanged(api.session, "user", () => {
		commands.executeCommand("setContext", "communities:signedIn", !!api.session.user);
		store.dispatch(<any>userAuthenticationChanged(!!api.session.user));
	});
}