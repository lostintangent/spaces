import { call, put, select, take } from "redux-saga/effects";
import { Uri, window } from "vscode";
import { LiveShare } from "vsls";
import * as api from "../api";
import { createWebSocketChannel } from "../channels/webSocket";
import { ChatApi } from "../chatApi";
import { config } from "../config";
import { LocalStorage } from "../storage/LocalStorage";
import {
  joinCommunityCompleted,
  leaveCommunityCompleted,
  loadCommunitiesCompleted,
  updateCommunity
} from "../store/actions";
import { ICommunity, IMember, ISession } from "../store/model";
import { sessionTypeDisplayName } from "../utils";

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
  const communities = yield select(s => s.communities);
  const { sessions: currentSessions } = communities.find(
    (c: any) => c.name === name
  );

  yield put(joinCommunityCompleted(name, members, sessions));

  if (!config.displaySessionNotifications) {
    return;
  }

  const filteredSessions = sessions.filter(
    (s: ISession) => !currentSessions.find((ss: ISession) => ss.id === s.id)
  ) as ISession[];

  for (let s of filteredSessions) {
    const { name: host } = members.find((m: IMember) => m.email === s.host);
    const message = `${host} started a ${sessionTypeDisplayName(
      s.type
    )} in ${name}: ${s.description}`;

    const response = yield call(
      // @ts-ignore
      window.showInformationMessage,
      message,
      "Join",
      "Don't show again"
    );

    if (response === "Join") {
      vslsApi.join(Uri.parse(s.url));
    } else if (response === "Don't show again") {
      config.displaySessionNotifications = false;
    }
  }
}

export function* clearMessagesSaga(chatApi: ChatApi, { payload }: any) {
  yield call(api.clearMessages, payload);
  yield call(chatApi.onMessagesCleared.bind(chatApi), payload);
}
