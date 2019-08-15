import * as path from "path";
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { LiveShare } from "vsls";
import {
  ICommunity,
  IMember,
  ISession,
  MemberTitles,
  Status
} from "../store/model";

export abstract class TreeNode extends TreeItem {
  constructor(
    label: string,
    collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None
  ) {
    super(label, collapsibleState);
  }
}

export class SignInNode extends TreeNode {
  constructor() {
    super("Sign in with Live Share...");

    this.command = {
      command: "liveshare.signin.browser",
      title: "Sign in with Live Share..."
    };
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

  constructor(public community: ICommunity, vslsApi: LiveShare) {
    super(
      `${community.name} (${community.members.length})`,
      TreeItemCollapsibleState.Expanded
    );

    this.name = community.name;

    const founder = community.members.find(
      m => m.title === MemberTitles.Founder
    );
    let isFounder = false;

    if (founder && founder.email === vslsApi.session.user!.emailAddress!) {
      isFounder = true;
    }

    if (isFounder) {
      this.contextValue = "community.founder";
    } else {
      this.contextValue = "community";
    }
  }
}

export class CommunityMembersNode extends TreeNode {
  constructor(public community: ICommunity, extensionPath: string) {
    super(
      `Members (${community.members.length})`,
      community.isExpanded
        ? TreeItemCollapsibleState.Expanded
        : TreeItemCollapsibleState.Collapsed
    );

    this.iconPath = {
      dark: path.join(extensionPath, `images/dark/member.svg`),
      light: path.join(extensionPath, `images/light/member.svg`)
    };
  }
}

export class CommunityHelpRequestsNode extends TreeNode {
  constructor(public community: ICommunity, extensionPath: string) {
    super(
      `Help Requests (${community.helpRequests.length})`,
      community.isHelpRequestsExpanded
        ? TreeItemCollapsibleState.Expanded
        : TreeItemCollapsibleState.Collapsed
    );

    this.contextValue = "helpRequests";

    this.iconPath = {
      dark: path.join(extensionPath, `images/dark/help.svg`),
      light: path.join(extensionPath, `images/light/help.svg`)
    };
  }
}

export class CommunityCodeReviewsNode extends TreeNode {
  constructor(public community: ICommunity, extensionPath: string) {
    super(
      `Code Reviews (${community.codeReviews.length})`,
      TreeItemCollapsibleState.Collapsed
    );

    this.contextValue = "codeReviews";

    this.iconPath = {
      dark: path.join(extensionPath, `images/dark/review.svg`),
      light: path.join(extensionPath, `images/light/review.svg`)
    };
  }
}

export class CommunityBroadcastsNode extends TreeNode {
  constructor(public community: ICommunity, extensionPath: string) {
    super(
      `Broadcasts (${community.broadcasts.length})`,
      TreeItemCollapsibleState.Collapsed
    );

    this.contextValue = "broadcasts";

    this.iconPath = {
      dark: path.join(extensionPath, `images/dark/broadcast.svg`),
      light: path.join(extensionPath, `images/light/broadcast.svg`)
    };
  }
}

export class CreateSessionNode extends TreeNode {
  constructor(label: string, command: string, community: ICommunity) {
    super(label);

    this.command = {
      command,
      title: label,
      arguments: [community]
    };
  }
}

function statusToIconPath(status: Status, extensionPath: string) {
  return path.join(extensionPath, `images/${status.toString()}.svg`);
}

function displayName(api: LiveShare, email: string, community: ICommunity) {
  if (email === api.session!.user!.emailAddress) {
    return `${api.session.user!.displayName} (You)`;
  } else {
    const member = community.members.find(m => m.email === email);
    return member!.name;
  }
}

export class MemberNode extends TreeNode {
  email: string;

  constructor(
    public member: IMember,
    public community: ICommunity,
    public api: LiveShare,
    private extensionPath: string
  ) {
    super(member.name);

    this.email = member.email;
    this.iconPath = statusToIconPath(
      this.member.status || Status.offline,
      this.extensionPath
    );
    const isCurrentUser = member.email === api.session.user!.emailAddress;
    let titles: string[] = member.title ? [member.title] : [];

    if (isCurrentUser) {
      titles.push("You");
    }

    this.description = titles.join(", ");

    if (!isCurrentUser) {
      if (this.member.status === Status.offline) {
        this.contextValue = "member";
      } else {
        this.contextValue = "member.online";
      }
    }
  }
}

export class SessionNode extends TreeNode {
  constructor(
    public session: ISession,
    public community: ICommunity,
    private extensionPath: string,
    api: LiveShare
  ) {
    super(
      `${displayName(api, session.host, community)} - ${session.description}`
    );

    const host = community.members.find(m => m.email === session.host);
    this.iconPath = statusToIconPath(
      host!.status || Status.offline,
      this.extensionPath
    );

    if (host!.email === api.session.user!.emailAddress!) {
      this.contextValue = "session.own";
    } else {
      this.contextValue = "session";
    }
  }
}

export class LoadingNode extends TreeNode {
  constructor() {
    super("Loading communities...");
  }
}
