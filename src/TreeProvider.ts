import * as vscode from "vscode";
import * as redux from "redux";
import { IStore } from "./store/model";

interface TreeNode {
    name: string;
}

interface NetworkNode extends TreeNode { }

interface ContactNode extends TreeNode {
    email: string;
}

interface LoadingNode extends TreeNode { }

class CanTreeProvider implements vscode.TreeDataProvider<TreeNode>, vscode.Disposable {
    private _disposables: vscode.Disposable[] = [];

    private _onDidChangeTreeData = new vscode.EventEmitter<TreeNode>();
    public readonly onDidChangeTreeData: vscode.Event<TreeNode> = this._onDidChangeTreeData.event;

    constructor(private store: redux.Store) {
        vscode.window.registerTreeDataProvider("vsls-can.contacts", this);
        
        this.store.subscribe(() => {
            // TODO: Only fire new contacts
            this._onDidChangeTreeData.fire();
        });
    }
    
    getTreeItem(element: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const collapsibleState = element.email ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded;
        return { label: element.name, collapsibleState };
    }

    getChildren(element?: TreeNode): vscode.ProviderResult<TreeNode[]> {
        const state: IStore = this.store.getState()

        if (!element) {
            return state.networks.map(network => ({
                name: network.name
            }))
        } else {
            const { name } = element;
            const network = state.networks.find(network => network.name === name)

            if (network) {
                // TODO: Sort the contact names
                return network.contacts.map(contact => ({
                    name: contact.name,
                    email: contact.email
                }))
            }
        }
    }

    dispose() {
        this._disposables.forEach(disposable => disposable.dispose())
    }
}

export function registerTreeProvider(store: redux.Store) {
    new CanTreeProvider(store);
}
