import { call, put, select } from "redux-saga/effects";
import { LiveShare } from "vsls";
import * as api from "../api";
import { activeSessionEnded, sessionCreated } from "../store/actions";
import { ISession } from "../store/model";
import { getCurrentSessionUrl } from "../utils";

export function* createSession(
  vslsApi: LiveShare,
  { description, sessionType, community, access }: any
) {
  let sessionUrl: string;

  if (!vslsApi.session.id) {
    sessionUrl = yield call(vslsApi.share.bind(vslsApi), { access });
  } else {
    sessionUrl = getCurrentSessionUrl(vslsApi);
  }

  const session: ISession = {
    id: vslsApi.session.id!,
    host: vslsApi.session.user!.emailAddress!,
    startTime: new Date(),
    description,
    type: sessionType,
    url: sessionUrl.toString()
  };

  yield put(sessionCreated({ community, session }));

  yield call(api.createSession, community, session);
}

export function* endActiveSession() {
  const activeSession = yield select(s => s.activeSession);

  if (activeSession) {
    yield call(
      api.deleteSession,
      activeSession.community,
      activeSession.session.id
    );
    yield put(activeSessionEnded());
  }
}
