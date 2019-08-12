import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { ExtensionContext } from "vscode";
import { getApi as getVslsApi } from "vsls";
import {
  createSessionStateChannel,
  ISessionStateChannel
} from "./channels/sessionState";
import { ChatApi } from "./chatApi";
import { registerCommands } from "./commands";
import { config } from "./config";
import { registerContactProvider } from "./contacts/ContactProvider";
import { rootSaga } from "./sagas";
import { LocalStorage } from "./storage/LocalStorage";
import { clearZombieSessions } from "./store/actions";
import { reducer } from "./store/reducer";
import { registerTreeProvider } from "./tree/TreeProvider";
import { registerUriHandler } from "./uriHandler";

let sessionStateChannel: ISessionStateChannel;

export async function activate(context: ExtensionContext) {
  config.ensureLiveShareInsiders();

  const storage = new LocalStorage(context.globalState);

  const saga = createSagaMiddleware();
  const store = createStore(reducer, applyMiddleware(saga));

  const api = (await getVslsApi())!;
  const chatApi = new ChatApi(api, store);

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

  console.log(storage.getActiveSession()); // TODO: this is to be removed
  store.dispatch(<any>clearZombieSessions());

  return chatApi;
}

export function deactivate() {
  sessionStateChannel.endActiveSession();
}
