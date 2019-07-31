import * as path from "path";
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { Status, ICommunity, ISession, IMember, IStore } from "../store/model";
import { LiveShare } from "vsls";

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

        this.contextValue = "helpRequests";

        this.iconPath = {
            dark: path.join(extensionPath, `images/dark/help.svg`),
            light: path.join(extensionPath, `images/light/help.svg`)
        };
    }
}


export class CommunityCodeReviewsNode extends TreeNode {
    constructor(public community: ICommunity, extensionPath: string) {
        super(`Code Reviews (${community.codeReviews.length})`, TreeItemCollapsibleState.Collapsed);

        this.contextValue = "codeReviews";

        this.iconPath = {
            dark: path.join(extensionPath, `images/dark/review.svg`),
            light: path.join(extensionPath, `images/light/review.svg`)
        };
    }
}

export class CommunityBroadcastsNode extends TreeNode {
    constructor(public community: ICommunity, extensionPath: string) {
        super(`Broadcasts (${community.broadcasts.length})`, TreeItemCollapsibleState.Collapsed);

        this.contextValue = "broadcasts";

        this.iconPath = {
            dark: path.join(extensionPath, `images/dark/broadcast.svg`),
            light: path.join(extensionPath, `images/light/broadcast.svg`)
        };
    }
}

export class CreateSessionNode extends TreeNode {
    constructor(label: string, command: string) {
        super(label);

        this.command = {
            command,
            title: label
        };
    }
}

function statusToIconPath(status: Status, extensionPath: string) {
    return path.join(extensionPath, `images/${status.toString()}.svg`);
}

export class MemberNode extends TreeNode {
    email: string; 

    constructor(public member: IMember, private extensionPath: string) {
        super(member.name);

        this.email = member.email;
        this.iconPath = statusToIconPath(this.member.status || Status.offline, this.extensionPath);

        if (this.member.status === Status.offline) {
            this.contextValue = "member";
        } else {
            this.contextValue = "member.online"
        }
    }

    
}

function hostName(session: ISession, api: LiveShare) {
    if (session.host === api.session!.user!.emailAddress) {
        return "You";
    } else {
        return api.session!.user!.emailAddress;
    }
}

export class SessionNode extends TreeNode {
    constructor(public session: ISession, private community: ICommunity, private extensionPath: string, private api: LiveShare) {
        super(`${hostName(session, api)} (${session.description})`);

        const host = community.members.find(m => m.email === session.host);
        this.iconPath = statusToIconPath(host!.status || Status.offline, this.extensionPath);

        this.contextValue = "session";
    }
}

export class LoadingNode extends TreeNode {
    constructor() {
        super("Loading communities...");
    }
 }