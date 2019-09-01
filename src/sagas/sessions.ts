import { call, put, select } from "redux-saga/effects";
import { LiveShare } from "vsls";
import * as api from "../api";
import { LocalStorage } from "../storage/LocalStorage";
import { activeSessionEnded, sessionCreated } from "../store/actions";
import { ISession } from "../store/model";
import { getCurrentSessionUrl } from "../utils";

export function* createSession(
  storage: LocalStorage,
  vslsApi: LiveShare,
  { description, sessionType, community, access }: any
) {
  let sessionUrl: string;

  if (!vslsApi.session.id) {
    sessionUrl = yield call(vslsApi.share.bind(vslsApi), { access });
  } else {
    sessionUrl = getCurrentSessionUrl(vslsApi);
  }

  const sessionId = vslsApi.session.id!;
  const session: ISession = {
    id: sessionId,
    host: vslsApi.session.user!.emailAddress!,
    startTime: new Date(),
    description,
    type: sessionType,
    url: sessionUrl.toString()
  };

  yield put(sessionCreated({ community, session }));
  storage.saveActiveSession(sessionId, community);
  yield call(api.createSession, community, session);
}

export function* endActiveSession(storage: LocalStorage) {
  const activeSession = yield select(s => s.activeSession);

  if (activeSession) {
    yield call(
      api.deleteSession,
      activeSession.community,
      activeSession.session.id
    );

    storage.clearActiveSession();
    yield put(activeSessionEnded());
  }
}

export function* cleanZombieSession(storage: LocalStorage) {
  const session: any = storage.getActiveSession();

  if (session) {
    yield call(api.deleteSession, session.name, session.id);
    storage.clearActiveSession();
  }
}
