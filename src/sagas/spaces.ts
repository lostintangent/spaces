import { call, put, select, take } from "redux-saga/effects";
import { commands, env, Uri, window } from "vscode";
import { LiveShare } from "vsls";
import * as api from "../api";
import { createWebSocketChannel } from "../channels/webSocket";
import { ChatApi } from "../chatApi";
import { config } from "../config";
import { JOIN_URL_PATTERN } from "../constants";
import { ReadmeFileSystemProvider } from "../readmeFileSystemProvider";
import { LocalStorage } from "../storage/LocalStorage";
import {
  joinSpace,
  joinSpaceCompleted,
  joinSpaceFailed,
  leaveSpaceCompleted,
  loadSpacesCompleted,
  muteAllSpaces,
  muteSpace,
  updateSpace
} from "../store/actions";
import { IMember, ISession, ISpace } from "../store/model";
import { sessionTypeDisplayName } from "../utils";

function isSpaceMuted(name: string) {
  return (
    (config.mutedSpaces.includes("*") &&
      !config.mutedSpaces.includes(`!${name}`)) ||
    (!config.mutedSpaces.includes("*") && config.mutedSpaces.includes(name))
  );
}

export function* loadSpacesSaga(
  storage: LocalStorage,
  vslsApi: LiveShare,
  chatApi: ChatApi
) {
  const spaceNames: string[] = storage.getSpaces();

  let response: ISpace[] = [];
  if (spaceNames.length > 0) {
    response = yield call(api.loadSpaces, spaceNames);
  }

  for (let space of response) {
    space.isMuted = isSpaceMuted(space.name);
  }

  yield put(loadSpacesCompleted(response));

  const channel = createWebSocketChannel(vslsApi, chatApi);

  while (true) {
    const { name, members, sessions, readme, founders, isPrivate } = yield take(
      channel
    );
    yield put(<any>(
      updateSpace(name, members, sessions, readme, founders, isPrivate)
    ));
  }
}

const PRIVATE_SPACE_RESPONSE = "Redeem invitation URL";
function* promptUserForInvitationUrl(name: string, key: string) {
  let response = yield call(
    // @ts-ignore
    window.showErrorMessage,
    "This space is private and requires an invitation URL in order to join.",
    PRIVATE_SPACE_RESPONSE
  );
  if (response === PRIVATE_SPACE_RESPONSE) {
    const clipboardContents = yield call(
      env.clipboard.readText.bind(env.clipboard)
    );
    response = yield call(window.showInputBox, {
      placeHolder:
        "Specify the invitation URL or key in order to join this space.",
      value: clipboardContents
    });
    if (response) {
      key = JOIN_URL_PATTERN.test(response)
        ? (<any>JOIN_URL_PATTERN.exec(response)).groups.key
        : response;
      yield put(joinSpace(name, key));
    }
  }
}

export function* joinSpaceSaga(
  storage: LocalStorage,
  vslsApi: LiveShare,
  chatApi: ChatApi,
  { name, key }: any
): any {
  const userInfo = vslsApi.session.user!;

  const { space, error } = yield call(
    api.joinSpace,
    name,
    userInfo.displayName,
    userInfo.emailAddress!,
    key
  );

  if (error) {
    yield put(joinSpaceFailed(name));

    switch (error) {
      case api.JoinRequestError.MemberBlocked:
        return window.showErrorMessage("You've been blocked from this space.");
      case api.JoinRequestError.SpacePrivate:
        return yield call(promptUserForInvitationUrl, name, key);
    }
  }

  storage.joinSpace(name);

  const { members, sessions, readme, founders, isPrivate } = space;
  const isMuted = isSpaceMuted(name);
  yield put(
    joinSpaceCompleted(
      name,
      members,
      sessions,
      isMuted,
      readme,
      founders,
      isPrivate
    )
  );

  chatApi.onSpaceJoined(name);
}

export function* leaveSpace(
  storage: LocalStorage,
  vslsApi: LiveShare,
  { name }: any
) {
  storage.leaveSpace(name);

  yield call(
    api.leaveSpace,
    name,
    vslsApi.session.user!.displayName,
    vslsApi.session.user!.emailAddress!
  );
  yield put(leaveSpaceCompleted(name));
}

export function* updateSpaceSaga(
  vslsApi: LiveShare,
  fileSystemProvider: ReadmeFileSystemProvider,
  { name, members, sessions: newSessions, readme, founders, isPrivate }: any
) {
  const spaces = yield select(s => s.spaces);
  const {
    helpRequests,
    broadcasts,
    codeReviews,
    isMuted,
    isLoading
  }: ISpace = spaces.find((c: any) => c.name === name);

  yield put(
    joinSpaceCompleted(
      name,
      members,
      newSessions,
      isMuted!,
      readme,
      founders,
      isPrivate
    )
  );

  fileSystemProvider.updateSpaceReadme(name);

  if (isLoading || isSpaceMuted(name)) {
    return;
  }

  const currentSessions = [...helpRequests, ...broadcasts, ...codeReviews];
  const filteredSessions = newSessions.filter(
    (newSession: ISession) =>
      !currentSessions.find(
        (currentSession: ISession) => newSession.id === currentSession.id
      )
  ) as ISession[];

  for (let s of filteredSessions) {
    if (s.host === vslsApi.session.user!.emailAddress!) {
      continue;
    }

    const { name: host } = members.find((m: IMember) => m.email === s.host);
    const message = `${host} started a ${sessionTypeDisplayName(
      s.type
    )} in ${name}: ${s.description}`;

    const muteSpaceLabel = `Mute ${name}`;
    const response = yield call(
      // @ts-ignore
      window.showInformationMessage,
      message,
      muteSpaceLabel,
      "Mute All",
      "Join"
    );

    if (response === "Join") {
      vslsApi.join(Uri.parse(s.url));
    } else if (response === "Mute All") {
      yield put(muteAllSpaces());
    } else if (response === muteSpaceLabel) {
      yield put(muteSpace(name));
    }
  }
}

export function* clearMessagesSaga(chatApi: ChatApi, { payload }: any) {
  yield call(api.clearMessages, payload);
  yield call(chatApi.onMessagesCleared.bind(chatApi), payload);
}

export function muteSpaceSaga({ payload }: any) {
  if (config.mutedSpaces.includes("*")) {
    config.mutedSpaces = config.mutedSpaces.filter(c => c !== `!${payload}`);
  } else {
    config.mutedSpaces = [...config.mutedSpaces, payload];
  }
}

export function unmuteSpaceSaga({ payload }: any) {
  if (config.mutedSpaces.includes("*")) {
    config.mutedSpaces = [...config.mutedSpaces, `!${payload}`];
  } else {
    config.mutedSpaces = config.mutedSpaces.filter(c => c !== payload);
  }
}

export function muteAllSpacesSaga() {
  config.mutedSpaces = ["*"];

  commands.executeCommand("setContext", "spaces:allSpacesMuted", true);
}

export function unmuteAllSpacesSaga() {
  config.mutedSpaces = [];

  commands.executeCommand("setContext", "spaces:allSpacesMuted", false);
}

export function* makeSpacePrivateSaga({ payload }: any) {
  yield call(api.makePrivate, payload.space, payload.key);
}

export function* makeSpacePublicSaga({ payload }: any) {
  yield call(api.makePublic, payload);
}

export function* updateReadmeSaga({ payload }: any) {
  yield call(api.updateReadme, payload.space, payload.readme);
}

export function* promoteToFounderSaga({ payload }: any) {
  yield call(api.promoteMember, payload.space, payload.member);
}

export function* demoteToMemberSaga({ payload }: any) {
  yield call(api.demoteMember, payload.space, payload.member);
}

export function* blockMemberSaga({ payload }: any) {
  yield call(api.blockMember, payload.space, payload.member);
}

export function* unblockMemberSaga({ payload }: any) {
  yield call(api.unblockMember, payload.space, payload.member);
}
