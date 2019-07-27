import { workspace } from "vscode";

const configSection = workspace.getConfiguration("liveshare.communities");

export const config = {
    get showSuggestedContacts() {
        return configSection.get("showSuggestedContacts");
    }
}