import { call, put, take } from "redux-saga/effects";
import { LiveShare } from "vsls";
import * as api from "../api";
import { createWebSocketChannel } from "../channels/webSocket";
import { ChatApi } from "../chatApi";
import { LocalStorage } from "../storage/LocalStorage";
import {
  joinCommunityCompleted,
  leaveCommunityCompleted,
  loadCommunitiesCompleted,
  updateCommunity
} from "../store/actions";
import { ICommunity } from "../store/model";
import { rebuildContacts } from "./contacts";

export function* loadCommunitiesSaga(
  storage: LocalStorage,
  vslsApi: LiveShare,
  chatApi: ChatApi
) {
  const communityNames: string[] = storage.getCommunities();

  let response: ICommunity[] = [];
  if (communityNames.length > 0) {
    response = yield call(api.loadCommunities, communityNames);
  }

  yield put(loadCommunitiesCompleted(response));

  const channel = createWebSocketChannel(vslsApi, chatApi);

  while (true) {
    const { name, members, sessions } = yield take(channel);
    yield put(<any>updateCommunity(name, members, sessions));
  }
}

export function* joinCommunity(
  storage: LocalStorage,
  vslsApi: LiveShare,
  chatApi: ChatApi,
  { name }: any
) {
  const userInfo = vslsApi.session.user!;

  storage.joinCommunity(name);

  const { members, sessions } = yield call(
    api.joinCommunity,
    name,
    userInfo.displayName,
    userInfo.emailAddress!
  );
  yield put(joinCommunityCompleted(name, members, sessions));

  chatApi.onCommunityJoined(name);
}

export function* leaveCommunity(
  storage: LocalStorage,
  vslsApi: LiveShare,
  { name }: any
) {
  storage.leaveCommunity(name);

  yield call(
    api.leaveCommunity,
    name,
    vslsApi.session.user!.displayName,
    vslsApi.session.user!.emailAddress!
  );
  yield put(leaveCommunityCompleted(name));
}

export function* updateCommunitySaga(
  vslsApi: LiveShare,
  { name, members, sessions }: any
) {
  yield put(joinCommunityCompleted(name, members, sessions));
  yield call(rebuildContacts, vslsApi);
}

export function* clearMessages(chatApi: ChatApi, { community }: any) {
  yield call(api.clearMessages, community);
  yield call(chatApi.onMessagesCleared.bind(chatApi), community);
}
