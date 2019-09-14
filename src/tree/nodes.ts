import * as path from "path";
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { LiveShare } from "vsls";
import {
  IMember,
  ISession,
  ISpace,
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

export class NoSpacesNode extends TreeNode {
  constructor() {
    super("Join a space...");

    this.command = {
      command: "liveshare.joinSpace",
      title: "Join Space"
    };
  }
}

export class SpaceNode extends TreeNode {
  name: string;

  constructor(public space: ISpace, vslsApi: LiveShare, extensionPath: string) {
    super(
      `${space.name} (${space.members.length})`,
      TreeItemCollapsibleState.Expanded
    );

    this.name = space.name;

    const founder = space.members.find(m => m.title === MemberTitles.Founder);
    let isFounder = false;

    if (founder && founder.email === vslsApi.session.user!.emailAddress!) {
      isFounder = true;
    }

    if (isFounder) {
      this.contextValue = "space.founder";
    } else {
      this.contextValue = "space";
    }

    if (space.isPrivate) {
      this.iconPath = {
        dark: path.join(extensionPath, `images/dark/lock.svg`),
        light: path.join(extensionPath, `images/light/lock.svg`)
      };

      this.contextValue += ".private";
    }

    if (space.isMuted) {
      this.contextValue += ".muted";
    }
  }
}

export class SpaceMembersNode extends TreeNode {
  constructor(public space: ISpace, extensionPath: string) {
    super(
      `Members (${space.members.length})`,
      space.isExpanded
        ? TreeItemCollapsibleState.Expanded
        : TreeItemCollapsibleState.Collapsed
    );

    this.iconPath = {
      dark: path.join(extensionPath, `images/dark/member.svg`),
      light: path.join(extensionPath, `images/light/member.svg`)
    };
  }
}

export class SpaceHelpRequestsNode extends TreeNode {
  constructor(public space: ISpace, extensionPath: string) {
    super(
      `Help Requests (${space.helpRequests.length})`,
      space.isHelpRequestsExpanded
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

export class SpaceCodeReviewsNode extends TreeNode {
  constructor(public space: ISpace, extensionPath: string) {
    super(
      `Code Reviews (${space.codeReviews.length})`,
      TreeItemCollapsibleState.Collapsed
    );

    this.contextValue = "codeReviews";

    this.iconPath = {
      dark: path.join(extensionPath, `images/dark/review.svg`),
      light: path.join(extensionPath, `images/light/review.svg`)
    };
  }
}

export class SpaceBroadcastsNode extends TreeNode {
  constructor(public space: ISpace, extensionPath: string) {
    super(
      `Broadcasts (${space.broadcasts.length})`,
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
  constructor(label: string, command: string, space: ISpace) {
    super(label);

    this.command = {
      command,
      title: label,
      arguments: [space]
    };
  }
}

function statusToIconPath(status: Status, extensionPath: string) {
  return path.join(extensionPath, `images/${status.toString()}.svg`);
}

function displayName(api: LiveShare, email: string, space: ISpace) {
  if (email === api.session!.user!.emailAddress) {
    return `${api.session.user!.displayName} (You)`;
  } else {
    const member = space.members.find(m => m.email === email);
    return member!.name;
  }
}

export class MemberNode extends TreeNode {
  email: string;

  constructor(
    public member: IMember,
    public space: ISpace,
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
    let thanks: string = member.thanks > 0 ? `(${member.thanks})` : ``;

    if (isCurrentUser) {
      titles.push("You");
    }

    this.description = `${titles.join(", ")} ${thanks}`;

    if (member.thanks === 1) {
      this.tooltip = `Thanked once`;
    } else {
      this.tooltip = `Thanked ${member.thanks} times`;
    }

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
    public space: ISpace,
    private extensionPath: string,
    api: LiveShare
  ) {
    super(`${displayName(api, session.host, space)} - ${session.description}`);

    const host = space.members.find(m => m.email === session.host);
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
    super("Loading spaces...");
  }
}
