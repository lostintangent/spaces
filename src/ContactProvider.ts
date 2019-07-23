import * as R from "ramda";
import { Store } from "redux";
import { CancellationToken, Event, EventEmitter } from "vscode";
import { LiveShare } from "vsls";
import { Contact, ContactsNotification, ContactServiceProvider, Methods, NotifyContactServiceEventArgs } from "vsls/vsls-contactprotocol";
import { config } from "./config";
import { IStore, IContact } from "./store/model";

const PROVIDER_NAME = "CAN";

function toContact(contact: any): Contact {
	return {
		id: contact.email,
		displayName: contact.name,
		email: contact.email,
	};
}

const flatMap = R.pipe(
	R.pluck("contacts"),
	R.flatten,
	R.map(toContact)
);

const dedupe = R.pipe(
	R.sortBy(R.prop("email")),
	R.dropRepeats
);

class ContactProvider implements ContactServiceProvider {
	private readonly onNotifiedEventEmitter = new EventEmitter<NotifyContactServiceEventArgs>();

	constructor(private store: Store) {
		this.store.subscribe(() => {
			if (config.showSuggestedContacts) {
				const { networks } = <IStore>this.store.getState();
				const contacts = <Contact[]>R.pipe(flatMap, dedupe)(networks);
				this.notifySuggestedContacts(contacts);
			}
		});
	}

	public get onNotified(): Event<NotifyContactServiceEventArgs> {
		return this.onNotifiedEventEmitter.event;
	}

	public async requestAsync(type: string, parameters: Object, cancellationToken?: CancellationToken | undefined): Promise<Object> {
		switch (type) {
			case Methods.RequestInitializeName:
				return {
					description: "Collaboration Area Network",
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