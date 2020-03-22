import * as R from "ramda";
import * as redux from "redux";
import {
  Disposable,
  Event,
  EventEmitter,
  ProviderResult,
  TreeDataProvider,
  TreeItem,
  window
} from "vscode";
import { LiveShare } from "vsls";
import { spaceNodeExpanded } from "../store/actions";
import { IStore } from "../store/model";
import {
  CreateSessionNode,
  LoadingNode,
  MemberNode,
  NoSpacesNode,
  SessionNode,
  SignInNode,
  SpaceBroadcastsNode,
  SpaceCodeReviewsNode,
  SpaceHelpRequestsNode,
  SpaceMembersNode,
  SpaceNode,
  TreeNode
} from "./nodes";

class SpacesTreeProvider implements TreeDataProvider<TreeNode>, Disposable {
  private _disposables: Disposable[] = [];

  private _onDidChangeTreeData = new EventEmitter<TreeNode>();
  public readonly onDidChangeTreeData: Event<TreeNode> = this
    ._onDidChangeTreeData.event;

  constructor(
    private store: redux.Store,
    private extensionPath: string,
    private api: LiveShare
  ) {
    this.store.subscribe(() => {
      this._onDidChangeTreeData.fire();
    });
  }

  getTreeItem = <(node: TreeNode) => TreeItem>R.identity;

  getChildren(element?: TreeNode): ProviderResult<TreeNode[]> {
    const state: IStore = this.store.getState();

    const { authentication, spaces: SpacesState } = state;
    const { isSignedIn } = authentication;
    const { isLoading, spaces } = SpacesState;

    if (!element) {
      if (!isSignedIn) {
        return [new SignInNode()];
      } else if (isLoading) {
        return [new LoadingNode()];
      } else if (spaces.length === 0) {
        return [new NoSpacesNode()];
      } else {
        return spaces.map(
          space => new SpaceNode(space, this.api, this.extensionPath)
        );
      }
    } else {
      if (element instanceof SpaceNode) {
        return [
          new SpaceMembersNode(element.space, this.api, this.extensionPath),
          new SpaceHelpRequestsNode(element.space, this.extensionPath),
          new SpaceBroadcastsNode(element.space, this.extensionPath),
          new SpaceCodeReviewsNode(element.space, this.extensionPath)
        ];
      } else if (element instanceof SpaceMembersNode) {
        return element.space.members.map(
          member =>
            new MemberNode(member, element.space, this.api, this.extensionPath)
        );
      } else if (element instanceof SpaceHelpRequestsNode) {
        if (element.space.helpRequests.length > 0) {
          return element.space.helpRequests.map(
            request =>
              new SessionNode(
                request,
                element.space,
                this.extensionPath,
                this.api
              )
          );
        } else {
          return [
            new CreateSessionNode(
              "Create help request...",
              "liveshare.createHelpRequest",
              element.space
            )
          ];
        }
      } else if (element instanceof SpaceBroadcastsNode) {
        if (element.space.broadcasts.length > 0) {
          return element.space.broadcasts.map(
            request =>
              new SessionNode(
                request,
                element.space,
                this.extensionPath,
                this.api
              )
          );
        } else {
          return [
            new CreateSessionNode(
              "Start broadcast...",
              "liveshare.startBroadcast",
              element.space
            )
          ];
        }
      } else if (element instanceof SpaceCodeReviewsNode) {
        if (element.space.codeReviews.length > 0) {
          return element.space.codeReviews.map(
            request =>
              new SessionNode(
                request,
                element.space,
                this.extensionPath,
                this.api
              )
          );
        } else {
          return [
            new CreateSessionNode(
              "Create code review request...",
              "liveshare.createCodeReview",
              element.space
            )
          ];
        }
      }
    }
  }

  dispose() {
    this._disposables.forEach(disposable => disposable.dispose());
  }
}

export function registerTreeProvider(
  api: LiveShare,
  store: redux.Store,
  extensionPath: string
) {
  const treeDataProvider = new SpacesTreeProvider(store, extensionPath, api);

  const treeView = window.createTreeView("liveshare.spaces", {
    showCollapseAll: true,
    treeDataProvider
  });

  treeView.onDidExpandElement(e => {
    if (e.element instanceof SpaceMembersNode) {
      store.dispatch(spaceNodeExpanded(e.element.space, "members"));
    } else if (e.element instanceof SpaceHelpRequestsNode) {
      store.dispatch(spaceNodeExpanded(e.element.space, "help"));
    }
  });
}
