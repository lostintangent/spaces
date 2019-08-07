import * as redux from "redux";
import { commands, window } from "vscode";
import { LiveShare } from "vsls";
import { ChatApi } from "./chatApi";
import { LocalStorage } from "./storage/LocalStorage";
import { joinCommunityAsync } from "./store/actions";

const JOIN_PATH = "/join";

// vscode-insiders://lostintangent.vsls-communities/join?<community>
export function registerUriHandler(api: LiveShare, store: redux.Store, storage: LocalStorage, chatApi: ChatApi) {
    window.registerUriHandler({
        handleUri: (uri) => {
            if (uri.path === JOIN_PATH && uri.query) {
                const community = uri.query;
                const userInfo = api.session.user; 

                if (userInfo && userInfo.emailAddress) {
                    store.dispatch(<any>joinCommunityAsync(community, storage, userInfo, api, store, chatApi));
                }

                commands.executeCommand("workbench.view.extension.liveshare");
            }
        }	
    });
}