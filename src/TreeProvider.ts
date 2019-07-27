import { window, Event, EventEmitter, Disposable, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from "vscode";
import * as redux from "redux";
import { IStore, Status } from "./store/model";
import { LiveShare } from "vsls";
import * as path from "path";
import * as R from "ramda";

abstract class TreeNode extends TreeItem {
    constructor(label: string, collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None) {
        super(label, collapsibleState);
    }
}

class NoCommunitiesNode extends TreeNode {
    constructor() {
        super("Join a community...");

        this.command = {
            command: "liveshare.joinCommunity",
            title: "Join Community"
        };
    }
}

export class CommunityNode extends TreeNode {
    constructor(name: string) {
        super(name, TreeItemCollapsibleState.Expanded);

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

class LoadingNode extends TreeNode {
    constructor() {
        super("Loading communities...", )
    }
 }

class CommunitiesTreeProvider implements TreeDataProvider<TreeNode>, Disposable {
    private _disposables: Disposable[] = [];

    private _onDidChangeTreeData = new EventEmitter<TreeNode>();
    public readonly onDidChangeTreeData: Event<TreeNode> = this._onDidChangeTreeData.event;

    constructor(private store: redux.Store, private extensionPath: string) {    
        this.store.subscribe(() => {
            this._onDidChangeTreeData.fire();
        });
    }
    
    getTreeItem = <(node: TreeNode) => TreeItem>R.identity;

    getChildren(element?: TreeNode): ProviderResult<TreeNode[]> {
        const state: IStore = this.store.getState()

        if (!element) {
            if (state.isLoading) {
                return [new LoadingNode()]
            } else if (state.communities.length === 0) {
                return [new NoCommunitiesNode()];
            } else {
                return state.communities.map(community => (new CommunityNode(community.name)));
            }
        } else {
            const community = state.communities.find(community => community.name === element.label)

            if (community) {
                return community.members.map(({ name, email, status }) =>
                    new MemberNode(name, email, status, this.extensionPath));
            }
        }
    }

    dispose() {
        this._disposables.forEach(disposable => disposable.dispose())
    }
}

export function registerTreeProvider(api: LiveShare, store: redux.Store, extensionPath: string) {
    const treeProvider = new CommunitiesTreeProvider(store, extensionPath);
    window.registerTreeDataProvider("liveshare.communities", treeProvider);
}
