import * as vscode from "vscode";
import * as redux from "redux";
import { IStore, Status } from "./store/model";
import { LiveShare } from "vsls";
import * as path from "path";

interface TreeNode {
    name: string;
}

interface CommunityNode extends TreeNode { }

interface MemberNode extends TreeNode {
    email: string;
    status: Status;
}

interface LoadingNode extends TreeNode { }

function statusToIconPath(status: Status, extensionPath: string) {
    return path.join(extensionPath, `images/${status.toString()}.svg`);
}

class CommunitiesTreeProvider implements vscode.TreeDataProvider<TreeNode>, vscode.Disposable {
    private _disposables: vscode.Disposable[] = [];

    private _onDidChangeTreeData = new vscode.EventEmitter<TreeNode>();
    public readonly onDidChangeTreeData: vscode.Event<TreeNode> = this._onDidChangeTreeData.event;

    constructor(private store: redux.Store, private extensionPath: string) {
        vscode.window.registerTreeDataProvider("vsls-communities.communities", this);
        
        this.store.subscribe(() => {
            this._onDidChangeTreeData.fire();
        });
    }
    
    getTreeItem(element: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const isMember = element.email;
        const collapsibleState = isMember ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded;
        const tooltip = isMember ? `${element.name} (${element.email})` : element.name;
        const iconPath = isMember ? statusToIconPath(element.status || Status.offline, this.extensionPath): undefined;

        return { label: element.name, collapsibleState, iconPath, tooltip };
    }

    getChildren(element?: TreeNode): vscode.ProviderResult<TreeNode[]> {
        const state: IStore = this.store.getState()

        if (!element) {
            return state.communities.map(community => ({
                name: community.name
            }))
        } else {
            const { name } = element;
            const community = state.communities.find(community => community.name === name)

            if (community) {
                return community.members.map(member => ({
                    name: member.name,
                    email: member.email,
                    status: member.status
                }))
            }
        }
    }

    dispose() {
        this._disposables.forEach(disposable => disposable.dispose())
    }
}

export function registerTreeProvider(api: LiveShare, store: redux.Store, extensionPath: string) {
    new CommunitiesTreeProvider(store, extensionPath);
}
