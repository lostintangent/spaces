import { workspace } from "vscode";

const configSection = workspace.getConfiguration("vsls-can");

export const config = {
    get showSuggestedContacts() {
        return configSection.get("showSuggestedContacts");
    }
}