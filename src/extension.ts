import { IAuthStrategy } from "@vs/vscode-account";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { ExtensionContext } from "vscode";
import { getApi as getVslsApi } from "vsls";
import { auth } from "./auth/auth";
import { createSessionStateChannel, ISessionStateChannel } from "./channels/sessionState";
import { ChatApi } from "./chatApi";
import { registerCommands } from "./commands";
import { config } from "./config";
import { registerContactProvider } from "./contacts/ContactProvider";
import { rootSaga } from "./sagas";
import { LocalStorage } from "./storage/LocalStorage";
import { reducer } from "./store/reducer";
import { registerTreeProvider } from "./tree/TreeProvider";
import { registerUriHandler } from "./uriHandler";

let sessionStateChannel: ISessionStateChannel;

export async function activate(context: ExtensionContext) {
  await config.ensureLiveShareInsiders();

  const storage = new LocalStorage(context.globalState);

  const saga = createSagaMiddleware();
  const store = createStore(reducer, applyMiddleware(saga));

  const api = (await getVslsApi())!;
  const chatApi = new ChatApi(api, store);

  // need to cast `api` to `any` until new `vsls` npm package is published
  const lsAuthStrategies = (api as any).authStrategies || [];
  const authStrategies = lsAuthStrategies.filter((strategy: IAuthStrategy) => {
    const strategyName = strategy.name.toLowerCase();
    return (strategyName.indexOf('anonymous') === -1);
  });
  await auth.init(context, authStrategies);

  sessionStateChannel = createSessionStateChannel(api);

  registerTreeProvider(api, store, context.extensionPath);
  registerCommands(
    api,
    store,
    storage,
    context.extensionPath,
    sessionStateChannel
  );
  registerUriHandler(api, store);

  if (config.showSuggestedContacts) {
    registerContactProvider(api, store);
  }

  saga.run(rootSaga, storage, api, chatApi, sessionStateChannel);

  return chatApi;
}

export async function deactivate() {
  return sessionStateChannel.endActiveSession();
}
