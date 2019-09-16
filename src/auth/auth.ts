import * as vscode from "vscode";

export class Authentication {
  // private authAPI?: vscodeAccountAPI.VSCodeAccount;

  public async init(context: vscode.ExtensionContext, strategies: any = []) {
    // this.authAPI = await (vscodeAccountAPI as any).activateInternal(
    //     context,
    //     [ ...strategies ],
    //     getKeytar(),
    // );
  }

  public get API() {
    // if (!this.authAPI) {
    //     throw new Error('The auth API wasn\'t yet initialized. Please call the `init` function first');
    // }

    // return this.authAPI;
    return null;
  }
}

export const auth = new Authentication();
