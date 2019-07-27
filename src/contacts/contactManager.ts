import { Store } from "redux";
import { ContactsCollection, LiveShare } from "vsls";
import { statusesUpdated } from "../store/actions";
import { toStatus, uniqueMemberEmails } from "../utils";

let observedContacts: ContactsCollection;
export async function rebuildContacts(api: LiveShare, store: Store) {
    observedContacts && observedContacts.dispose();

    const { communities } = store.getState();  
    const members = uniqueMemberEmails(communities);

    observedContacts = await api.getContacts(members);
    const memberStatuses = members.map((email: string) => ({
        email,
        status: toStatus(observedContacts.contacts[email].status)
    }));

    store.dispatch(statusesUpdated(memberStatuses));
    
    Object.entries(observedContacts.contacts).forEach(([email, contact]) => {
        contact.onDidChange(() => {
            store.dispatch(statusesUpdated([{
                email: contact.email,
                status: toStatus(contact.status!)
            }]));
        });
    });
}