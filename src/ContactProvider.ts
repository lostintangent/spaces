import * as R from "ramda";
import { Store } from "redux";
import { CancellationToken, Event, EventEmitter } from "vscode";
import { LiveShare } from "vsls";
import { Contact, ContactsNotification, ContactServiceProvider, Methods, NotifyContactServiceEventArgs } from "vsls/vsls-contactprotocol";
import { config } from "./config";
import { IStore } from "./store/model";

const PROVIDER_NAME = "Communities";

function toContact(member: any): Contact {
	return {
		id: member.email,
		displayName: member.name,
		email: member.email,
	};
}

const flatMap = R.pipe(
	R.pluck("members"),
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
				const { communities } = <IStore>this.store.getState();
				const contacts = <Contact[]>R.pipe(flatMap, dedupe)(communities);
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
					description: "Live Share Communities",
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