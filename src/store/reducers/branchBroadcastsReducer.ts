import * as redux from "redux";
import { AcceptedBranchBroadcastActions } from "../actions/branchBroadcastsActions";
import { IBranchBroadcastRecord } from "../model";

export interface IBranchBroadcastsState {
  broadcasts: IBranchBroadcastRecord[];
}

export const initialBranchBroadcastsState: IBranchBroadcastsState = {
  broadcasts: []
};

export const defaultBranchBroadcastRecord: IBranchBroadcastRecord = {
  isExplicitlyStopped: false,
  spaceName: "",
  branchName: ""
};

export const branchBroadcastsReducer: redux.Reducer<
  IBranchBroadcastsState,
  AcceptedBranchBroadcastActions
> = (
  state: IBranchBroadcastsState = initialBranchBroadcastsState,
  action: AcceptedBranchBroadcastActions
): IBranchBroadcastsState => {
  switch (action.type) {
    case "BROADCAST_BRANCH_FETCH_DATA": {
      const { payload } = action;
      const { broadcastBranches } = payload;

      return {
        ...state,
        broadcasts: [...broadcastBranches]
      };
    }

    case "BROADCAST_BRANCH_ADD_BRANCH": {
      const { broadcasts } = state;
      const { spaceName, branchName } = action.payload;

      return {
        ...state,
        broadcasts: [
          ...broadcasts,
          {
            ...defaultBranchBroadcastRecord,
            spaceName,
            branchName
          }
        ]
      };
    }

    case "BROADCAST_BRANCH_REMOVE_BRANCH": {
      const { broadcasts } = state;
      const { branchName } = action.payload;

      const newBroadcasts = broadcasts.filter(broadcast => {
        return broadcast.branchName !== branchName;
      });

      return {
        ...state,
        broadcasts: newBroadcasts
      };
    }

    case "BROADCAST_BRANCH_SET_EXPLICITLY_STOPPED": {
      const { broadcasts } = state;
      const { branchName, isExplicitlyStopped } = action.payload;

      const recordIndex = broadcasts.findIndex(broadcast => {
        return broadcast.branchName === branchName;
      });

      const record = broadcasts[recordIndex];

      const newBroadcasts = [
        ...broadcasts.slice(0, recordIndex),
        {
          ...record,
          isExplicitlyStopped
        },
        ...broadcasts.slice(recordIndex)
      ];

      return {
        ...state,
        broadcasts: newBroadcasts
      };
    }

    case "BROADCAST_BRANCH_REMOVE_ALL_BROADCASTS": {
      return {
        ...state,
        broadcasts: []
      };
    }

    default: {
      return state;
    }
  }
};
