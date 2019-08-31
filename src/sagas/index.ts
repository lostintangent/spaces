import { all, fork, put, take, takeEvery, takeLatest } from "redux-saga/effects";
import * as vsls from "vsls";
import { createAuthenticationChannel } from "../channels/authentication";
import { ISessionStateChannel } from "../channels/sessionState";
import { ChatApi } from "../chatApi";
import { config } from "../config";
import { LocalStorage } from "../storage/LocalStorage";
import { ACTION_COMMUNITY_UPDATED, ACTION_CREATE_SESSION, ACTION_JOIN_COMMUNITY, ACTION_LEAVE_COMMUNITY, ACTION_LOAD_COMMUNITIES, clearMessages, loadCommunities, makeCommunityPrivate, makeCommunityPublic, muteAllCommunities, muteCommunity, unmuteAllCommunities, unmuteCommunity, userAuthenticationChanged } from "../store/actions";
import { clearMessagesSaga, joinCommunitySaga, leaveCommunity, loadCommunitiesSaga, makeCommunityPrivateSaga, makeCommunityPublicSaga, muteAllCommunitiesSaga, muteCommunitySaga, unmuteAllCommunitiesSaga, unmuteCommunitySaga, updateCommunitySaga } from "./communities";
import { rebuildContacts, REBUILD_CONTACTS_ACTIONS } from "./contacts";
import { extensionsSaga } from "./extensions";
import { createSession, endActiveSession } from "./sessions";

function* workerSagas(
  storage: LocalStorage,
  vslsApi: vsls.LiveShare,
  chatApi: ChatApi,
  sessionStateChannel: ISessionStateChannel
) {
  yield all([
    takeEvery(
      ACTION_JOIN_COMMUNITY,
      joinCommunitySaga.bind(null, storage, vslsApi, chatApi)
    ),
    takeEvery(
      ACTION_LEAVE_COMMUNITY,
      leaveCommunity.bind(null, storage, vslsApi)
    ),
    takeEvery(
      ACTION_COMMUNITY_UPDATED,
      updateCommunitySaga.bind(null, vslsApi)
    ),
    takeEvery(clearMessages, clearMessagesSaga.bind(null, chatApi)),

    takeEvery(ACTION_CREATE_SESSION, createSession.bind(null, vslsApi)),
    takeEvery(sessionStateChannel, endActiveSession),

    takeEvery(muteCommunity, muteCommunitySaga),
    takeEvery(unmuteCommunity, unmuteCommunitySaga),

    takeEvery(muteAllCommunities, muteAllCommunitiesSaga),
    takeEvery(unmuteAllCommunities, unmuteAllCommunitiesSaga),

    takeEvery(makeCommunityPrivate, makeCommunityPrivateSaga),
    takeEvery(makeCommunityPublic, makeCommunityPublicSaga),

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

      if (config.mutedCommunities.includes("*")) {
        yield put(muteAllCommunities());
      }

      yield put(<any>loadCommunities());

      extensionsTask = yield fork(extensionsSaga);
    } else {
      workersTask && workersTask.cancel();
      extensionsTask && extensionsTask.cancel();
    }
  }
}
