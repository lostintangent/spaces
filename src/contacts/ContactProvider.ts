import { Store } from "redux";
import { CancellationToken, Event, EventEmitter } from "vscode";
import { LiveShare } from "vsls";
import {
  Contact,
  ContactServiceProvider,
  ContactsNotification,
  Methods,
  NotifyContactServiceEventArgs
} from "vsls/vsls-contactprotocol.js";
import { IStore } from "../store/model";
import { uniqueMemberContacts } from "../utils";

const PROVIDER_NAME = "Spaces";

class ContactProvider implements ContactServiceProvider {
  private readonly onNotifiedEventEmitter = new EventEmitter<
    NotifyContactServiceEventArgs
  >();

  constructor(private store: Store) {
    this.store.subscribe(() => {
      const { spaces } = <IStore>this.store.getState();
      const contacts = <Contact[]>uniqueMemberContacts(spaces);
      this.notifySuggestedContacts(contacts);
    });
  }

  public get onNotified(): Event<NotifyContactServiceEventArgs> {
    return this.onNotifiedEventEmitter.event;
  }

  public async requestAsync(
    type: string,
    parameters: Object,
    cancellationToken?: CancellationToken | undefined
  ): Promise<Object> {
    switch (type) {
      case Methods.RequestInitializeName:
        return {
          description: "Live Share Spaces",
          capabilities: {
            supportsDispose: false,
            supportsInviteLink: false,
            supportsPresence: false,
            supportsContactPresenceRequest: false,
            supportsPublishPresence: false
          }
        };
      default:
        throw new Error("Method not implemented");
    }
  }

  private async notifySuggestedContacts(contacts: Contact[]) {
    this.onNotifiedEventEmitter.fire({
      type: Methods.NotifySuggestedUsersName,
      body: <ContactsNotification>{ contacts: contacts }
    });
  }
}

export function registerContactProvider(api: LiveShare, store: Store) {
  api.registerContactServiceProvider(PROVIDER_NAME, new ContactProvider(store));
}
