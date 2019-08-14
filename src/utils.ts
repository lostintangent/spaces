import * as R from "ramda";
import { LiveShare } from "vsls";
import { LIVE_SHARE_SESSION_URL } from "./constants";
import { ICommunity, IMember, Status } from "./store/model";

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
    email: member.email
  };
}

export function getCurrentSessionUrl(api: LiveShare) {
  return `${LIVE_SHARE_SESSION_URL}?${api.session.id}`;
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

export const onPropertyChanged = (
  object: any,
  propertyName: string,
  onChange: any
) => {
  const handler = {
    defineProperty(target: any, property: any, descriptor: any) {
      const result = Reflect.defineProperty(target, property, descriptor);
      if (property === propertyName) {
        onChange();
      }

      return result;
    },
    deleteProperty(target: any, property: any) {
      const result = Reflect.deleteProperty(target, property);
      if (property === propertyName) {
        onChange();
      }
      return result;
    }
  };

  return new Proxy(object, handler);
};
