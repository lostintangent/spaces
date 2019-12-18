import { combineReducers, Reducer } from "redux";
import { IStore } from "./model";
import {
  authenticationReducer,
  initialAuthenticationState
} from "./reducers/authenticationReducer";
import {
  branchBroadcastsReducer,
  initialBranchBroadcastsState
} from "./reducers/branchBroadcastsReducer";
import { initialSpacesState, spacesReducer } from "./reducers/spacesReducer";

const initialState: IStore = {
  authentication: initialAuthenticationState,
  spaces: initialSpacesState,
  broadcastBranches: initialBranchBroadcastsState
};

export const reducer: Reducer = combineReducers({
  authentication: authenticationReducer,
  spaces: spacesReducer,
  broadcastBranches: branchBroadcastsReducer
});
