import { commands, ConfigurationTarget, window, workspace } from "vscode";

const liveShareConfig = workspace.getConfiguration("liveshare");

const FEATURE_SET_SETTING = "featureSet";
const SUGGESTED_CONTACTS_SETTING = "showSuggestedContacts";
const DISPLAY_SESSION_NOTIFICATIONS = "displaySessionNotifications";
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
  },

  get showSuggestedContacts() {
    return this.getConfig().get(SUGGESTED_CONTACTS_SETTING);
  },

  get displaySessionNotifications() {
    return this.getConfig().get<boolean>(DISPLAY_SESSION_NOTIFICATIONS)!;
  },

  set displaySessionNotifications(value: boolean) {
    this.getConfig().update(
      DISPLAY_SESSION_NOTIFICATIONS,
      value,
      ConfigurationTarget.Global
    );
  }
};
