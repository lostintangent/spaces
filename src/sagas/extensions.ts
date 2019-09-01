import { call, put, select, take } from "redux-saga/effects";
import { window } from "vscode";
import {
  createExtensionsChannel,
  ExtensionEventType
} from "../channels/extensions";
import { config } from "../config";
import { joinCommunity, leaveCommunity } from "../store/actions";
import { ICommunity } from "../store/model";

enum ContributionBehavior {
  ignore = "ignore",
  join = "join",
  prompt = "prompt"
}

enum PromptResponse {
  dontAskAgain = "Don't Ask Again",
  join = "Join",
  leave = "Leave"
}

export function* extensionsSaga() {
  const extensionsChannel = createExtensionsChannel();

  while (true) {
    const { id, type, communities } = yield take(extensionsChannel);

    const isAddedEvent = type === ExtensionEventType.extensionAdded;
    const existingCommunities: ICommunity[] = yield select(
      store => store.communities
    );

    for (let community of communities) {
      const communityExists = existingCommunities.find(
        c => c.name === community
      );

      if (isAddedEvent && !communityExists) {
        const contributionBehavior = config.extensionContributionBehavior;
        if (contributionBehavior === ContributionBehavior.ignore) {
          continue;
        } else if (contributionBehavior === ContributionBehavior.prompt) {
          const response = yield call(
            // @ts-ignore
            window.showInformationMessage,
            `The "${id}" extension recommends you join the "${community}" Live Share community.`,
            PromptResponse.dontAskAgain,
            PromptResponse.join
          );

          if (!response) {
            continue;
          } else if (response === PromptResponse.dontAskAgain) {
            config.extensionContributionBehavior = ContributionBehavior.ignore;
            continue;
          }
        }

        yield put(joinCommunity(community));

        if (contributionBehavior === ContributionBehavior.join) {
          const response = yield call(
            // @ts-ignore
            window.showInformationMessage,
            `You've joined the "${community}" Live Share community based on the recommendation from "${id}".`,
            PromptResponse.leave
          );

          if (response === PromptResponse.leave) {
            yield put(leaveCommunity(community));
          }
        }
      } else if (!isAddedEvent && communityExists) {
        yield put(leaveCommunity(community));
      }
    }
  }
}
