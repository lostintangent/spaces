import { eventChannel } from "redux-saga";
import { ContactsCollection } from "vsls";
import { toStatus } from "../utils";

export function createContactChannel(contacts: ContactsCollection) {
  return eventChannel((emit: Function) => {
    Object.entries(contacts.contacts).forEach(([_, contact]) => {
      contact.onDidChange(() => {
        emit({
          email: contact.email,
          status: toStatus(contact.status!)
        });
      });
    });

    return () => {
      contacts.dispose();
    };
  });
}
