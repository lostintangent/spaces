import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import { ExtensionContext, extensions } from "vscode";
import { getApi as getVslsApi } from "vsls";
import { ICallingService } from "./audio/ICallingService";
import { auth } from "./auth/auth";
import {
  createSessionStateChannel,
  ISessionStateChannel
} from "./channels/sessionState";
import { ChatApi } from "./chatApi";
import { registerCommands } from "./commands";
import { config } from "./config";
import { registerContactProvider } from "./contacts/ContactProvider";
import { ContactMessageManager } from "./contacts/messaging/ContactMessageManager";
import { registerJoinRequest } from "./contacts/messaging/joinRequest";
import { registerFileSystemProvider } from "./readmeFileSystemProvider";
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

  const lsAuthStrategies = (api as any).authStrategies;
  await auth.init(context, lsAuthStrategies || []);

  sessionStateChannel = createSessionStateChannel(api);

  registerTreeProvider(api, store, context.extensionPath);
  const fileSystemProvider = registerFileSystemProvider(store, api);

  const messageManager = new ContactMessageManager(api);
  const joinRequest = registerJoinRequest(api, messageManager);

  const callingService = extensions.getExtension<ICallingService>(
    "ms-vsliveshare.vsliveshare-audio"
  )!.exports;

  registerCommands(
    api,
    store,
    storage,
    context.extensionPath,
    sessionStateChannel,
    joinRequest,
    callingService
  );
  registerUriHandler(api, store);

  if (config.showSuggestedContacts) {
    registerContactProvider(api, store);
  }

  //registerCommentController(api);

  saga.run(
    rootSaga,
    storage,
    api,
    chatApi,
    sessionStateChannel,
    fileSystemProvider
  );

  return chatApi;
}

export async function deactivate() {
  return sessionStateChannel.endActiveSession();
}
