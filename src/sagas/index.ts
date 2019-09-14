import {
  all,
  fork,
  put,
  take,
  takeEvery,
  takeLatest
} from "redux-saga/effects";
import * as vsls from "vsls";
import { createAuthenticationChannel } from "../channels/authentication";
import { ISessionStateChannel } from "../channels/sessionState";
import { ChatApi } from "../chatApi";
import { config } from "../config";
import { LocalStorage } from "../storage/LocalStorage";
import {
  ACTION_CLEAR_ZOMBIE_SESSIONS,
  ACTION_CREATE_SESSION,
  ACTION_JOIN_SPACE,
  ACTION_LEAVE_SPACE,
  ACTION_LOAD_SPACES,
  ACTION_LOAD_SPACES_COMPLETED,
  ACTION_SPACE_UPDATED,
  clearMessages,
  clearZombieSessions,
  loadSpaces,
  makeSpacePrivate,
  makeSpacePublic,
  muteAllSpaces,
  muteSpace,
  unmuteAllSpaces,
  unmuteSpace,
  userAuthenticationChanged
} from "../store/actions";
import { rebuildContacts, REBUILD_CONTACTS_ACTIONS } from "./contacts";
import { extensionsSaga } from "./extensions";
import {
  cleanZombieSession,
  createSession,
  endActiveSession
} from "./sessions";
import {
  clearMessagesSaga,
  joinSpaceSaga,
  leaveSpace,
  loadSpacesSaga,
  makeSpacePrivateSaga,
  makeSpacePublicSaga,
  muteAllSpacesSaga,
  muteSpaceSaga,
  unmuteAllSpacesSaga,
  unmuteSpaceSaga,
  updateSpaceSaga
} from "./spaces";

function* workerSagas(
  storage: LocalStorage,
  vslsApi: vsls.LiveShare,
  chatApi: ChatApi,
  sessionStateChannel: ISessionStateChannel
) {
  yield all([
    takeEvery(
      ACTION_JOIN_SPACE,
      joinSpaceSaga.bind(null, storage, vslsApi, chatApi)
    ),
    takeEvery(ACTION_LEAVE_SPACE, leaveSpace.bind(null, storage, vslsApi)),
    takeEvery(ACTION_SPACE_UPDATED, updateSpaceSaga.bind(null, vslsApi)),
    takeEvery(clearMessages, clearMessagesSaga.bind(null, chatApi)),

    takeEvery(
      ACTION_CREATE_SESSION,
      createSession.bind(null, storage, vslsApi)
    ),
    takeEvery(sessionStateChannel, endActiveSession.bind(null, storage)),
    takeEvery(
      ACTION_CLEAR_ZOMBIE_SESSIONS,
      cleanZombieSession.bind(null, storage)
    ),

    takeEvery(muteSpace, muteSpaceSaga),
    takeEvery(unmuteSpace, unmuteSpaceSaga),

    takeEvery(muteAllSpaces, muteAllSpacesSaga),
    takeEvery(unmuteAllSpaces, unmuteAllSpacesSaga),

    takeEvery(makeSpacePrivate, makeSpacePrivateSaga),
    takeEvery(makeSpacePublic, makeSpacePublicSaga),

    takeLatest(
      ACTION_LOAD_SPACES,
      loadSpacesSaga.bind(null, storage, vslsApi, chatApi)
    ),
    takeLatest(REBUILD_CONTACTS_ACTIONS, rebuildContacts.bind(null, vslsApi))
  ]);
}

export function* rootSaga(
  storage: LocalStorage,
  vslsApi: vsls.LiveShare,
  chatApi: ChatApi,
  sessionStateChannel: ISessionStateChannel
) {
  const authChannel = createAuthenticationChannel(vslsApi);
  let workersTask, extensionsTask;

  while (true) {
    const isSignedIn = yield take(authChannel);
    yield put(userAuthenticationChanged(isSignedIn));

    if (isSignedIn) {
      workersTask = yield fork(
        workerSagas,
        storage,
        vslsApi,
        chatApi,
        sessionStateChannel
      );

      if (config.mutedSpaces.includes("*")) {
        yield put(muteAllSpaces());
      }

      yield put(<any>loadSpaces());

      yield put(<any>clearZombieSessions());

      yield take(ACTION_LOAD_SPACES_COMPLETED);

      extensionsTask = yield fork(extensionsSaga);
    } else {
      workersTask && workersTask.cancel();
      extensionsTask && extensionsTask.cancel();
    }
  }
}
