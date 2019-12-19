import { buffers, eventChannel } from "redux-saga";
import { LiveShare, Session } from "vsls";
import { ChatApi } from "../chatApi";
import { onPropertyChanged } from "../utils";

const isSignedIn = (api: LiveShare) => !!api.session.user;

export function createAuthenticationChannel(
  vslsApi: LiveShare,
  chatApi: ChatApi
) {
  let originalSessionObject: Session;

  return eventChannel((emit: Function) => {
    originalSessionObject = vslsApi.session;

    // @ts-ignore (session is a readonly property)
    vslsApi.session = onPropertyChanged(vslsApi.session, "user", () => {
      chatApi.onUserChanged(vslsApi.session.user);
      emit(isSignedIn(vslsApi));
    });

    chatApi.onUserChanged(vslsApi.session.user);
    emit(isSignedIn(vslsApi));

    return () => {
      // @ts-ignore (session is a readonly property)
      vslsApi.session = originalSessionObject;
    };
  }, buffers.sliding(1));
}
