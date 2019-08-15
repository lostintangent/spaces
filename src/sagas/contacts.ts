import { call, put, select, take } from "redux-saga/effects";
import { LiveShare } from "vsls";
import { createContactChannel } from "../channels/contacts";
import {
  ACTION_JOIN_COMMUNITY_COMPLETED,
  ACTION_LEAVE_COMMUNITY_COMPLETED,
  ACTION_LOAD_COMMUNITIES_COMPLETED,
  statusesUpdated
} from "../store/actions";
import { toStatus, uniqueMemberEmails } from "../utils";

export const REBUILD_CONTACTS_ACTIONS = [
  ACTION_LOAD_COMMUNITIES_COMPLETED,
  ACTION_JOIN_COMMUNITY_COMPLETED,
  ACTION_LEAVE_COMMUNITY_COMPLETED
];

export function* rebuildContacts(api: LiveShare) {
  let contactChannel;

  try {
    const communities = yield select(s => s.communities);
    const members = uniqueMemberEmails(communities);

    const observedContacts = yield call(api.getContacts.bind(api), members);
    const memberStatuses = members.map((email: string) => ({
      email,
      status: toStatus(observedContacts.contacts[email].status)
    }));

    yield put(statusesUpdated(memberStatuses));

    contactChannel = createContactChannel(observedContacts);

    while (true) {
      const memberStatus = yield take(contactChannel);
      yield put(statusesUpdated([memberStatus]));
    }
  } finally {
    contactChannel && contactChannel.close();
  }
}
