import * as redux from "redux";
import { commands, window } from "vscode";
import { LiveShare } from "vsls";
import { ChatApi } from "./chatApi";
import { LocalStorage } from "./storage/LocalStorage";
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
                    store.dispatch(<any>joinCommunity(community));
                }

                commands.executeCommand("workbench.view.extension.liveshare");
            }
        }	
    });
}