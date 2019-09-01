import * as querystring from "querystring";
import * as redux from "redux";
import { commands, window } from "vscode";
import { LiveShare } from "vsls";
import { joinCommunity } from "./store/actions";

const JOIN_PATH = "/join";

// vscode-insiders://lostintangent.vsls-communities/join?<community>
export function registerUriHandler(api: LiveShare, store: redux.Store) {
  window.registerUriHandler({
    handleUri: uri => {
      if (uri.path === JOIN_PATH && uri.query) {
        const userInfo = api.session.user;

        const { community, key } = querystring.parse(uri.query);
        if (userInfo && userInfo.emailAddress) {
          store.dispatch(<any>joinCommunity(<string>community, <string>key));
        }

        commands.executeCommand("workbench.view.extension.liveshare");
      }
    }
  });
}
