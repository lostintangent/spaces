import { commands, ConfigurationTarget, window, workspace } from "vscode";

const liveShareConfig = workspace.getConfiguration("liveshare");

const FEATURE_SET_SETTING = "featureSet";
const SUGGESTED_CONTACTS_SETTING = "showSuggestedContacts";
const MUTED_COMMUNITIES = "mutedCommunities";
const INSIDERS = "insiders";

export const config = {
  getConfig() {
    return workspace.getConfiguration("liveshare.communities");
  },

  async ensureLiveShareInsiders() {
    const featureSet = liveShareConfig.get(FEATURE_SET_SETTING);

    if (featureSet !== INSIDERS) {
      liveShareConfig.update(
        FEATURE_SET_SETTING,
        INSIDERS,
        ConfigurationTarget.Global
      );

      const response = await window.showInformationMessage(
        "Live Share Communities installed! Reload Visual Studio Code to get started",
        "Reload"
      );

      if (response === "Reload") {
        commands.executeCommand("workbench.action.reloadWindow");
      }
    }

    await commands.executeCommand('liveshare.enable.vscode-account.auth');
  },

  get showSuggestedContacts() {
    return this.getConfig().get(SUGGESTED_CONTACTS_SETTING);
  },

  get mutedCommunities() {
    return this.getConfig().get<string[]>(MUTED_COMMUNITIES)!;
  },

  set mutedCommunities(value: string[]) {
    this.getConfig().update(
      MUTED_COMMUNITIES,
      value,
      ConfigurationTarget.Global
    );
  }
};
