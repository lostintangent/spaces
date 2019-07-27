import * as path from "path";
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { Status } from "../store/model";

export abstract class TreeNode extends TreeItem {
    constructor(label: string, collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None) {
        super(label, collapsibleState);
    }
}

export class NoCommunitiesNode extends TreeNode {
    constructor() {
        super("Join a community...");

        this.command = {
            command: "liveshare.joinCommunity",
            title: "Join Community"
        };
    }
}

export class CommunityNode extends TreeNode {
    constructor(public name: string, memberCount: number) {
        super(`${name} (${memberCount})`, TreeItemCollapsibleState.Expanded);

        this.contextValue = "community";
    }
}

export class MemberNode extends TreeNode {
    constructor(name: string, public email: string, private status: Status, private extensionPath: string) {
        super(name);

        this.tooltip = `${this.label} (${this.email})`;
        this.iconPath = this.statusToIconPath(this.status || Status.offline, this.extensionPath);

        if (this.status === Status.offline) {
            this.contextValue = "member";
        } else {
            this.contextValue = "member.online"
        }
    }

    private statusToIconPath(status: Status, extensionPath: string) {
        return path.join(extensionPath, `images/${status.toString()}.svg`);
    }
}

export class LoadingNode extends TreeNode {
    constructor() {
        super("Loading communities...", )
    }
 }