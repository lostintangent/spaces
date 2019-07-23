import { Store } from "redux";
import { CancellationToken, Event, EventEmitter } from "vscode";
import { LiveShare } from "vsls";
import { Contact, ContactsNotification, ContactServiceProvider, Methods, NotifyContactServiceEventArgs } from "vsls/vsls-contactprotocol";
import { config } from "./config";
import { IContact, INetwork } from "./store/model";

const PROVIDER_NAME = "CAN";

class CanSuggestionProvider implements ContactServiceProvider {
	sentEmails: string[] = [];

	constructor(private store: Store) {
		this.store.subscribe(() => {
			const { networks } = this.store.getState();
			const contacts = networks.reduce((accumulation: IContact[], current: INetwork) => {
				const con = current.contacts.map((contact) => ({
					displayName: contact.name,
					email: contact.email,
					id: contact.email
				}))
				return [ ...accumulation, ...con ]
			}, []);
			
			if (config.showSuggestedContacts) {
				this.notifySuggestedContacts(contacts);
			}

			// TODO: De-dupe the list of contacts
		});
	}

	private readonly onNotifiedEventEmitter = new EventEmitter<NotifyContactServiceEventArgs>();

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
		const newContacts = contacts.filter((c) => this.sentEmails.indexOf(c.email!) < 0)

		this.onNotifiedEventEmitter.fire({
			type: Methods.NotifySuggestedUsersName,
			body: <ContactsNotification>{ contacts: newContacts }
		});

		this.sentEmails.concat(newContacts.map(c => c.email!));
	}
}

export function registerContactProvider(api: LiveShare, store: Store) {
	api.registerContactServiceProvider(PROVIDER_NAME, new CanSuggestionProvider(store));
}
