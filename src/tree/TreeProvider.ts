import * as R from "ramda";
import * as redux from "redux";
import { Disposable, Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, window } from "vscode";
import { LiveShare } from "vsls";
import { IStore } from "../store/model";
import { CommunityNode, LoadingNode, MemberNode, NoCommunitiesNode, TreeNode } from "./nodes";

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
                return state.communities.map(community =>
                    new CommunityNode(community.name, community.members.length));
            }
        } else {
            const community = state.communities.find(community => community.name === (<CommunityNode>element).name)

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
