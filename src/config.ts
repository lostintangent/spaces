import * as vscode from "vscode";
import { ConfigurationTarget, workspace } from "vscode";

const liveShareConfig = workspace.getConfiguration("liveshare");
const communitiesConfig = workspace.getConfiguration("liveshare.communities");

const FEATURE_SET_SETTING = "featureSet";
const SUGGESTED_CONTACTS_SETTING = "showSuggestedContacts";
const INSIDERS = "insiders";

export const config = {
  async ensureLiveShareInsiders() {
    const featureSet = liveShareConfig.get(FEATURE_SET_SETTING);

    if (featureSet !== INSIDERS) {
      liveShareConfig.update(
        FEATURE_SET_SETTING,
        INSIDERS,
        ConfigurationTarget.Global
      );
    }

    await vscode.commands.executeCommand('liveshare.enable.vscode-account.auth');
  },

  get showSuggestedContacts() {
    return communitiesConfig.get(SUGGESTED_CONTACTS_SETTING);
  }
};
