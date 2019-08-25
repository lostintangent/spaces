import { put, select, take } from "redux-saga/effects";
import {
  createExtensionsChannel,
  ExtensionEventType
} from "../channels/extensions";
import { joinCommunity, leaveCommunity } from "../store/actions";
import { ICommunity } from "../store/model";

export function* extensionsSaga() {
  const extensionsChannel = createExtensionsChannel();

  while (true) {
    const { type, communities } = yield take(extensionsChannel);

    const existingCommunities: ICommunity[] = yield select(
      store => store.communities
    );

    if (type === ExtensionEventType.extensionAdded) {
      for (let community of communities) {
        if (!existingCommunities.find(c => c.name === community)) {
          yield put(joinCommunity(community));
        }
      }
    } else {
      for (let community of communities) {
        if (existingCommunities.find(c => c.name === community)) {
          yield put(leaveCommunity(community));
        }
      }
    }
  }
}
