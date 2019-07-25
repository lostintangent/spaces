import { workspace } from "vscode";

const configSection = workspace.getConfiguration("vsls-communities");

export const config = {
    get showSuggestedContacts() {
        return configSection.get("showSuggestedContacts");
    }
}