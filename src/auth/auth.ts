import * as vscode from 'vscode';
import * as vscodeAccountAPI from '@vs/vscode-account';
import { getKeytar } from './getKeytar';

export class Authentication {
    private authAPI?: vscodeAccountAPI.VSCodeAccount;

    public async init(context: vscode.ExtensionContext, strategies: vscodeAccountAPI.IAuthStrategy[] = []) {
        this.authAPI = await (vscodeAccountAPI as any).activateInternal(
            context,
            [ ...strategies ],
            getKeytar(),
        );
    }

    public get API(): vscodeAccountAPI.VSCodeAccount {
        if (!this.authAPI) {
            throw new Error('The auth API wasn\'t yet initialized. Please call the `init` function first');
        }

        return this.authAPI;
    }
}

export const auth = new Authentication();
