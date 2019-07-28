import * as path from "path";
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { Status, ICommunity, ISession, IMember } from "../store/model";

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
    name: string;

    constructor(public community: ICommunity) {
        super(`${community.name} (${community.members.length})`, TreeItemCollapsibleState.Expanded);

        this.name = community.name;
        this.contextValue = "community";
    }
}

export class CommunityMembersNode extends TreeNode {
    constructor(public community: ICommunity, extensionPath: string) {
        super(`Members (${community.members.length})`, TreeItemCollapsibleState.Collapsed);

        this.iconPath = {
            dark: path.join(extensionPath, `images/dark/member.svg`),
            light: path.join(extensionPath, `images/light/member.svg`)
        };
    }
}

export class CommunityHelpRequestsNode extends TreeNode {
    constructor(public community: ICommunity, extensionPath: string) {
        super(`Help Requests (${community.helpRequests.length})`, TreeItemCollapsibleState.Collapsed);

        this.iconPath = {
            dark: path.join(extensionPath, `images/dark/help.svg`),
            light: path.join(extensionPath, `images/light/help.svg`)
        };
    }
}

export class CommunityBroadcastsNode extends TreeNode {
    constructor(public community: ICommunity, extensionPath: string) {
        super(`Broadcasts (${community.broadcasts.length})`, TreeItemCollapsibleState.Collapsed);

        this.iconPath = {
            dark: path.join(extensionPath, `images/dark/broadcast.svg`),
            light: path.join(extensionPath, `images/light/broadcast.svg`)
        };
    }
}

export class MemberNode extends TreeNode {
    email: string; 

    constructor(public member: IMember, private extensionPath: string) {
        super(member.name);

        this.email = member.email;
        this.tooltip = `${this.label} (${this.member.email})`;
        this.iconPath = this.statusToIconPath(this.member.status || Status.offline, this.extensionPath);

        if (this.member.status === Status.offline) {
            this.contextValue = "member";
        } else {
            this.contextValue = "member.online"
        }
    }

    private statusToIconPath(status: Status, extensionPath: string) {
        return path.join(extensionPath, `images/${status.toString()}.svg`);
    }
}

export class SessionNode extends TreeNode {
    constructor(public session: ISession) {
        super(session.description);
    }
}

export class LoadingNode extends TreeNode {
    constructor() {
        super("Loading communities...");
    }
 }