import { call, put, select, take } from "redux-saga/effects";
import { window } from "vscode";
import {
  createExtensionsChannel,
  ExtensionEventType
} from "../channels/extensions";
import { config } from "../config";
import { joinSpace, leaveSpace } from "../store/actions";
import { ISpace } from "../store/model";

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
    const { id, type, spaces } = yield take(extensionsChannel);

    const isAddedEvent = type === ExtensionEventType.extensionAdded;
    const existingSpaces: ISpace[] = yield select(store => store.spaces);

    for (let space of spaces) {
      const spaceExists = existingSpaces.find(c => c.name === space);

      if (isAddedEvent && !spaceExists) {
        const contributionBehavior = config.extensionContributionBehavior;
        if (contributionBehavior === ContributionBehavior.ignore) {
          continue;
        } else if (contributionBehavior === ContributionBehavior.prompt) {
          const response = yield call(
            // @ts-ignore
            window.showInformationMessage,
            `The "${id}" extension recommends you join the "${space}" Live Share space.`,
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

        yield put(joinSpace(space));

        if (contributionBehavior === ContributionBehavior.join) {
          const response = yield call(
            // @ts-ignore
            window.showInformationMessage,
            `You've joined the "${space}" Live Share space based on the recommendation from "${id}".`,
            PromptResponse.leave
          );

          if (response === PromptResponse.leave) {
            yield put(leaveSpace(space));
          }
        }
      } else if (!isAddedEvent && spaceExists) {
        yield put(leaveSpace(space));
      }
    }
  }
}
