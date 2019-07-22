import { CancellationToken, Event, EventEmitter } from "vscode";
import { LiveShare } from "vsls";
import { Contact, ContactsNotification, ContactServiceProvider, Methods, NotifyContactServiceEventArgs } from "vsls/vsls-contactprotocol";

const PROVIDER_NAME = "CAN";

class CanSuggestionProvider implements ContactServiceProvider {
	private readonly onNotifiedEventEmitter = new EventEmitter<NotifyContactServiceEventArgs>();

	public async requestAsync(type: string, parameters: Object, cancellationToken?: CancellationToken | undefined): Promise<Object> {
		switch (type) {
			case Methods.RequestInitializeName:
				return this.requestInitialize();
			default: 
				throw new Error("");
		}
	}
	
	private async requestInitialize() {
		this.notifySuggestedContacts([
			{
				id: "jc@trl.mx",
				email: "jc@trl.mx",
				displayName: "Jonathan Carter"
			}
		]);
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
	}

	public get onNotified(): Event<NotifyContactServiceEventArgs> {
		return this.onNotifiedEventEmitter.event;
	}

	public notify(type: string, body:any) {
		this.onNotifiedEventEmitter.fire({ type, body });
	}

	public async notifySuggestedContacts(contacts: Contact[]) {
		this.notify(Methods.NotifySuggestedUsersName, <ContactsNotification>{ contacts });
	}
}

export function registerContactProvider(api: LiveShare) {
    api.registerContactServiceProvider(PROVIDER_NAME, new CanSuggestionProvider());
}