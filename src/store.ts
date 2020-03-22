import { applyMiddleware, combineReducers, createStore, Reducer } from "redux";
import createSagaMiddleware from "redux-saga";
import { authenticationReducer } from "./store/reducers/authenticationReducer";
import { branchBroadcastsReducer } from "./store/reducers/branchBroadcastsReducer";
import { spacesReducer } from "./store/reducers/spacesReducer";

export let saga: ReturnType<typeof createSagaMiddleware>;
export let store: ReturnType<typeof createStore>;

export const initializeStore = () => {
  const reducer: Reducer = combineReducers({
    authentication: authenticationReducer,
    spaces: spacesReducer,
    broadcastBranches: branchBroadcastsReducer
  });

  saga = createSagaMiddleware();
  store = createStore(reducer, applyMiddleware(saga));
};
