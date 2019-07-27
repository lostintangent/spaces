import { LiveShare, ContactsCollection } from "vsls";
import { Store } from "redux";
import { IStore, Status, ICommunity, IMember } from "./store/model";
import { IMemberStatus, statusesUpdated } from "./store/actions";
import * as R from "ramda";

const uniqueMembers = R.pipe(
    R.chain<ICommunity, IMember>(R.prop("members")),
    // @ts-ignore
    R.pluck("email"),
    R.sort(R.comparator(R.lt)),
    R.dropRepeats
);

let collection: ContactsCollection;
export async function rebuildContacts(api: LiveShare, store: Store) {
    collection && collection.dispose();

    const { communities } = <IStore>store.getState();  
    const members = uniqueMembers(communities);

    collection = await api.getContacts(members);
    const memberStatuses = members.map((email: string) => ({
        email,
        status: collection.contacts[email].status
    }));

    store.dispatch(statusesUpdated(memberStatuses));
    
    Object.entries(collection.contacts).forEach(([email, contact]) => {
        contact.onDidChange(() => {
            store.dispatch(statusesUpdated([{
                email: contact.email,
                status: toStatus(contact.status!)
            }]));
        });
    });
}

function toStatus(status: string): Status {
    switch (status) {
        case "available":
            return Status.available;
        case "dnd":
            return Status.doNotDisturb;
        case "away":
            return Status.away;
        case "offline":
        default:
            return Status.offline;
    }
}
