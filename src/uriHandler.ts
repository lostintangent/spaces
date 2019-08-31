import * as redux from "redux";
import { commands, window } from "vscode";
import { LiveShare } from "vsls";
import { joinCommunity } from "./store/actions";

const JOIN_PATH = "/join";

// vscode-insiders://lostintangent.vsls-communities/join?<community>
export function registerUriHandler(api: LiveShare, store: redux.Store) {
    window.registerUriHandler({
        handleUri: (uri) => {
            if (uri.path === JOIN_PATH && uri.query) {
                const community = uri.query;
                const userInfo = api.session.user;

                if (userInfo && userInfo.emailAddress) {
                    store.dispatch(<any>joinCommunity(community, uri.fragment));
                }

                commands.executeCommand("workbench.view.extension.liveshare");
            }
        }
    });
}