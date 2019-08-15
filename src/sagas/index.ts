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
import { LocalStorage } from "../storage/LocalStorage";
import {
  ACTION_CLEAR_MESSAGES,
  ACTION_COMMUNITY_UPDATED,
  ACTION_CREATE_SESSION,
  ACTION_JOIN_COMMUNITY,
  ACTION_LEAVE_COMMUNITY,
  ACTION_LOAD_COMMUNITIES,
  loadCommunities,
  userAuthenticationChanged
} from "../store/actions";
import {
  clearMessages,
  joinCommunity,
  leaveCommunity,
  loadCommunitiesSaga,
  updateCommunitySaga
} from "./communities";
import { rebuildContacts, REBUILD_CONTACTS_ACTIONS } from "./contacts";
import { createSession, endActiveSession } from "./sessions";

function* childSagas(
  storage: LocalStorage,
  vslsApi: vsls.LiveShare,
  chatApi: ChatApi,
  sessionStateChannel: ISessionStateChannel
) {
  yield all([
    takeEvery(
      ACTION_JOIN_COMMUNITY,
      joinCommunity.bind(null, storage, vslsApi, chatApi)
    ),
    takeEvery(
      ACTION_LEAVE_COMMUNITY,
      leaveCommunity.bind(null, storage, vslsApi)
    ),
    takeEvery(
      ACTION_COMMUNITY_UPDATED,
      updateCommunitySaga.bind(null, vslsApi)
    ),
    takeEvery(ACTION_CLEAR_MESSAGES, clearMessages.bind(null, chatApi)),

    takeEvery(ACTION_CREATE_SESSION, createSession.bind(null, vslsApi)),
    takeEvery(sessionStateChannel, endActiveSession),

    takeLatest(
      ACTION_LOAD_COMMUNITIES,
      loadCommunitiesSaga.bind(null, storage, vslsApi, chatApi)
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

  let task;
  while (true) {
    const isSignedIn = yield take(authChannel);
    yield put(userAuthenticationChanged(isSignedIn));

    if (isSignedIn) {
      task = yield fork(
        childSagas,
        storage,
        vslsApi,
        chatApi,
        sessionStateChannel
      );
      yield put(<any>loadCommunities());
    } else {
      task && task.cancel();
    }
  }
}
