import { eventChannel } from "redux-saga";
import { LiveShare, Session } from "vsls";
import { onPropertyChanged } from "../utils";

const isSignedIn = (api: LiveShare) => !!api.session.user;

export function createAuthenticationChannel(api: LiveShare) {
  let originalSessionObject: Session;
  return eventChannel((emit: Function) => {
    originalSessionObject = api.session;

    // @ts-ignore (session is a readonly property)
    api.session = onPropertyChanged(api.session, "user", () => {
      emit(isSignedIn(api));
    });

    emit(isSignedIn(api));

    return () => {
      // @ts-ignore (session is a readonly property)
      api.session = originalSessionObject;
    };
  });
}
