import * as redux from "redux";
import { Access } from "vsls";
import { getMemento, setMemento } from "../../memento";
import {
  AcceptedBranchBroadcastActions,
  BROADCAST_BRANCH_ADD_BRANCH,
  BROADCAST_BRANCH_FETCH_DATA,
  BROADCAST_BRANCH_REMOVE_ALL_BROADCASTS,
  BROADCAST_BRANCH_REMOVE_BRANCH,
  BROADCAST_BRANCH_SET_EXPLICITLY_STOPPED
} from "../actions/branchBroadcastsActions";
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
  branchName: "",
  description: "",
  access: Access.Owner
};

const branchBroadcastsReducerInternal: redux.Reducer<
  IBranchBroadcastsState,
  AcceptedBranchBroadcastActions
> = (
  state: IBranchBroadcastsState = initialBranchBroadcastsState,
  action: AcceptedBranchBroadcastActions
): IBranchBroadcastsState => {
  switch (action.type) {
    case BROADCAST_BRANCH_FETCH_DATA: {
      const { payload } = action;
      const { broadcastBranches } = payload;

      return {
        ...state,
        broadcasts: [...broadcastBranches]
      };
    }

    case BROADCAST_BRANCH_ADD_BRANCH: {
      const { broadcasts } = state;

      return {
        ...state,
        broadcasts: [
          ...broadcasts,
          {
            ...defaultBranchBroadcastRecord,
            ...action.payload
          }
        ]
      };
    }

    case BROADCAST_BRANCH_REMOVE_BRANCH: {
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

    case BROADCAST_BRANCH_SET_EXPLICITLY_STOPPED: {
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

    case BROADCAST_BRANCH_REMOVE_ALL_BROADCASTS: {
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

const BRANCH_BROADCASTS_REDUCER_MEMENTO_NAME =
  "SPACES.BRANCH_BROADCASTS_REDUCER_MEMENTO_NAME";

const getDefaultState = (): IBranchBroadcastsState => {
  const value = getMemento(BRANCH_BROADCASTS_REDUCER_MEMENTO_NAME);

  if (!value) {
    return { ...initialBranchBroadcastsState };
  }

  try {
    const result = JSON.parse(value) as IBranchBroadcastsState;

    return result;
  } catch {
    return { ...initialBranchBroadcastsState };
  }
};

export const branchBroadcastsReducer: redux.Reducer<
  IBranchBroadcastsState,
  AcceptedBranchBroadcastActions
> = (
  state: IBranchBroadcastsState = getDefaultState(),
  action: AcceptedBranchBroadcastActions
): IBranchBroadcastsState => {
  const result = branchBroadcastsReducerInternal(state, action);

  setMemento(BRANCH_BROADCASTS_REDUCER_MEMENTO_NAME, JSON.stringify(result));

  return result;
};
