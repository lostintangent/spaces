import { Status } from "./store/model";
import * as R from "ramda";
import { IMember, ICommunity } from "./store/model";

const sortedMembers = R.pipe(
    R.chain<ICommunity, IMember>(R.prop("members")),
    R.sortBy(R.prop("email"))
);

export const uniqueMemberContacts = R.pipe(
    sortedMembers,
	R.map(toContact),
	R.dropRepeats
);

export const uniqueMemberEmails = R.pipe(
    sortedMembers,
    R.pluck("email"),
    R.dropRepeats
);

function toContact(member: any) {
	return {
		id: member.email,
		displayName: member.name,
		email: member.email,
	};
}

export function toStatus(status?: string): Status {
    switch (status) {
        case "available":
            return Status.available;
        case "away":
            return Status.away;
        case "doNotDisturb":
            return Status.doNotDisturb;
        case "offline":
        default:
            return Status.offline;
    }
}