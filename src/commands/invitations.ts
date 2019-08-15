import { commands } from "vscode";
import { LiveShare } from "vsls";
import { EXTENSION_NAME } from "../constants";
import { MemberNode } from "../tree/nodes";

export function registerInvitationCommands(api: LiveShare) {
  commands.registerCommand(
    `${EXTENSION_NAME}.inviteMember`,
    async (node?: MemberNode) => {
      if (node) {
        inviteMember(node.email);
      }
    }
  );

  commands.registerCommand(
    `${EXTENSION_NAME}.inviteMemberByEmail`,
    async (node?: MemberNode) => {
      if (node) {
        inviteMember(node.email, true);
      }
    }
  );

  async function inviteMember(email: string, useEmail: boolean = false) {
    const { contacts } = await api.getContacts([email]);
    contacts[email].invite({ useEmail });
  }
}
