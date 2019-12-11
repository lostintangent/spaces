import { ConfigurationTarget, workspace } from "vscode";
import { LOCAL_SERVICE_URL, PROD_SERVICE_URL } from "./constants";

const liveShareConfig = workspace.getConfiguration("liveshare");

const EXTENSION_SUGGESTION_BEHAVIOR = "extensionSuggestionBehavior";
const WORKSPACE_SUGGESTION_BEHAVIOR = "workspaceSuggestionBehavior";
const FEATURE_SET_SETTING = "featureSet";
const MUTED_SPACES = "mutedSpaces";
const SUGGESTED_CONTACTS_SETTING = "showSuggestedContacts";
const INSIDERS = "insiders";
const SERVICE_URI_SETTING = "serviceUri";

export enum SuggestionBehavior {
  ignore = "ignore",
  join = "join",
  prompt = "prompt"
}

export const config = {
  getConfig() {
    return workspace.getConfiguration("liveshare.spaces");
  },

  get extensionSuggestionBehavior() {
    return this.getConfig().get<string>(EXTENSION_SUGGESTION_BEHAVIOR)!;
  },

  set extensionSuggestionBehavior(value: string) {
    this.getConfig().update(
      EXTENSION_SUGGESTION_BEHAVIOR,
      value,
      ConfigurationTarget.Global
    );
  },

  get workspaceSuggestionBehavior() {
    return this.getConfig().get<string>(WORKSPACE_SUGGESTION_BEHAVIOR)!;
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
