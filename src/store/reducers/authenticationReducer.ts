import * as redux from "redux";
import { ACTION_USER_AUTHENTICATION_CHANGED } from "../actions";

export interface IAuthenticationState {
  isSignedIn: boolean;
}

export const initialAuthenticationState: IAuthenticationState = {
  isSignedIn: false
};

export type SupportedAuthenticationActionTypes = typeof ACTION_USER_AUTHENTICATION_CHANGED;
export type AuthenticationAction = {
  type: SupportedAuthenticationActionTypes;
  isSignedIn: boolean;
};

export const authenticationReducer: redux.Reducer<
  IAuthenticationState,
  AuthenticationAction
> = (
  state: IAuthenticationState = initialAuthenticationState,
  action: AuthenticationAction
): IAuthenticationState => {
  switch (action.type) {
    case ACTION_USER_AUTHENTICATION_CHANGED: {
      return {
        ...state,
        isSignedIn: action.isSignedIn
      };
    }

    default: {
      return state;
    }
  }
};
