import { commands } from "vscode";
import { LiveShare } from "vsls";
import { EXTENSION_NAME } from "../constants";
import { Status } from "../store/model";
import { MemberNode, SpaceMembersNode } from "../tree/nodes";

export function registerInvitationCommands(
  api: LiveShare,
  joinRequest: Function
) {
  commands.registerCommand(
    `${EXTENSION_NAME}.inviteMember`,
    (node: MemberNode) => {
      inviteMembers([node.email]);
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.inviteMemberByEmail`,
    (node: MemberNode) => {
      inviteMembers([node.email], true);
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.inviteAllMembers`,
    async (node: SpaceMembersNode) => {
      const members = node.space.members
        .filter(member => member.status !== Status.offline)
        .filter(member => member.email !== api.session.user!.emailAddress)
        .map(member => member.email);

      inviteMembers(members);
    }
  );

  async function inviteMembers(emails: string[], useEmail: boolean = false) {
    const { contacts } = await api.getContacts(emails);
    for (let email in contacts) {
      await contacts[email].invite({ useEmail });
    }
  }

  commands.registerCommand(
    `${EXTENSION_NAME}.joinRequest`,
    (node: MemberNode) => {
      joinRequest(node.label, node.email);
    }
  );
}
