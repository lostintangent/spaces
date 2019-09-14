import { commands, ConfigurationTarget, window, workspace } from "vscode";
import { LOCAL_SERVICE_URL, PROD_SERVICE_URL } from "./constants";

const liveShareConfig = workspace.getConfiguration("liveshare");

const EXTENSION_CONTRIBUTION_BEHAVIOR = "extensionContributionBehavior";
const FEATURE_SET_SETTING = "featureSet";
const MUTED_SPACES = "mutedSpaces";
const SUGGESTED_CONTACTS_SETTING = "showSuggestedContacts";
const INSIDERS = "insiders";
const SERVICE_URI_SETTING = "serviceUri";

export const config = {
  getConfig() {
    return workspace.getConfiguration("liveshare.spaces");
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
        "Live Share Spaces installed! Reload Visual Studio Code to get started",
        "Reload"
      );

      if (response === "Reload") {
        commands.executeCommand("workbench.action.reloadWindow");
      }
    }

    await commands.executeCommand("liveshare.enable.vscode-account.auth");
  },

  get extensionContributionBehavior() {
    return this.getConfig().get<string>(EXTENSION_CONTRIBUTION_BEHAVIOR)!;
  },

  set extensionContributionBehavior(value: string) {
    this.getConfig().update(
      EXTENSION_CONTRIBUTION_BEHAVIOR,
      value,
      ConfigurationTarget.Global
    );
  },

  get showSuggestedContacts() {
    return this.getConfig().get(SUGGESTED_CONTACTS_SETTING);
  },

  get mutedSpaces() {
    return this.getConfig().get<string[]>(MUTED_SPACES)!;
  },

  set mutedSpaces(value: string[]) {
    this.getConfig().update(MUTED_SPACES, value, ConfigurationTarget.Global);
  },

  get serviceUri() {
    const value = this.getConfig().get<string>(SERVICE_URI_SETTING)!;

    return value === "prod" ? PROD_SERVICE_URL : LOCAL_SERVICE_URL;
  }
};
