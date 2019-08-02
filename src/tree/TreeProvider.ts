import * as R from "ramda";
import * as redux from "redux";
import { Disposable, Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, window } from "vscode";
import { LiveShare } from "vsls";
import { IStore } from "../store/model";
import { CommunityNode, LoadingNode, MemberNode, NoCommunitiesNode, TreeNode, CommunityMembersNode, CommunityHelpRequestsNode, CommunityBroadcastsNode, SessionNode, CommunityCodeReviewsNode, CreateSessionNode } from "./nodes";
import { communityNodeExpanded } from "../store/actions";

class CommunitiesTreeProvider implements TreeDataProvider<TreeNode>, Disposable {
    private _disposables: Disposable[] = [];

    private _onDidChangeTreeData = new EventEmitter<TreeNode>();
    public readonly onDidChangeTreeData: Event<TreeNode> = this._onDidChangeTreeData.event;

    constructor(private store: redux.Store, private extensionPath: string, private api: LiveShare) {    
        this.store.subscribe(() => { this._onDidChangeTreeData.fire(); });
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
                    new CommunityNode(community));
            }
        } else {
            if (element instanceof CommunityNode) {
                return [
                    new CommunityMembersNode(element.community, this.extensionPath),
                    new CommunityHelpRequestsNode(element.community, this.extensionPath),
                    new CommunityBroadcastsNode(element.community, this.extensionPath),
                    new CommunityCodeReviewsNode(element.community, this.extensionPath)
                ];
            } else if (element instanceof CommunityMembersNode) {
                return element.community.members.map(member => new MemberNode(member, element.community, this.api, this.extensionPath));
            } else if (element instanceof CommunityHelpRequestsNode) {
                if (element.community.helpRequests.length > 0) {
                    return element.community.helpRequests.map(request => new SessionNode(request, element.community, this.extensionPath, this.api));
                } else {
                    return [new CreateSessionNode("Create help request...", "liveshare.createHelpRequest")];
                }
            } else if (element instanceof CommunityBroadcastsNode) {
                if (element.community.broadcasts.length > 0) {
                    return element.community.broadcasts.map(request => new SessionNode(request, element.community, this.extensionPath, this.api));
                } else {
                    return [new CreateSessionNode("Start broadcast...", "liveshare.startBroadcast")];
                }
            } else if (element instanceof CommunityCodeReviewsNode) {
                if (element.community.codeReviews.length > 0) {
                    return element.community.codeReviews.map(request => new SessionNode(request, element.community, this.extensionPath, this.api));
                } else {
                    return [new CreateSessionNode("Create code review request...", "liveshare.createCodeReview")];
                }
            }
        }
    }

    dispose() {
        this._disposables.forEach(disposable => disposable.dispose())
    }
}

export function registerTreeProvider(api: LiveShare, store: redux.Store, extensionPath: string) {
    const treeDataProvider = new CommunitiesTreeProvider(store, extensionPath, api);

    const treeView = window.createTreeView("liveshare.communities", {
        showCollapseAll: true,
        treeDataProvider
    });

    treeView.onDidExpandElement((e) => {
        if (e.element instanceof CommunityMembersNode) {
            store.dispatch(communityNodeExpanded(e.element.community));
        }
    });
}
