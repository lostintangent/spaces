import { ProgressLocation, window } from "vscode";
import { LiveShare } from "vsls";
import { ContactMessageManager, MessageSender } from "./ContactMessageManager";

const JOIN_MESSAGE_TYPE = "liveshace.spaces.join";
const JOIN_ACCEPTED_MESSAGE_TYPE = "liveshace.spaces.join.accepted";
const JOIN_REJECTED_MESSAGE_TYPE = "liveshace.spaces.join.rejected";

export function registerJoinRequest(
  vslsApi: LiveShare,
  messageManager: ContactMessageManager
) {
  let resolveFunction: Function;
  const acceptRequest = messageManager.registerMessageHandler(
    JOIN_ACCEPTED_MESSAGE_TYPE,
    async (sender: MessageSender, body: any) => {
      resolveFunction && resolveFunction();
    }
  );

  const rejectRequest = messageManager.registerMessageHandler(
    JOIN_REJECTED_MESSAGE_TYPE,
    async (sender: MessageSender, body: any) => {
      resolveFunction && resolveFunction();

      const message = `${sender.displayName} declined your collaboration request.`;
      window.showInformationMessage(message);
    }
  );

  const joinRequest = messageManager.registerMessageHandler(
    JOIN_MESSAGE_TYPE,
    async (sender: MessageSender, body: any) => {
      const message = `${sender.displayName} asked to join a collaboration session with you.`;
      const response = await window.showInformationMessage(message, "Share");
      if (response) {
        acceptRequest(sender.emailAddress);

        const { contacts } = await vslsApi.getContacts([sender.emailAddress]);
        await contacts[sender.emailAddress].invite({ useEmail: false });
      } else {
        rejectRequest(sender.emailAddress);
      }
    }
  );

  return async (name: string, email: string) => {
    window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: `Waiting for ${name} to respond...`
      },
      () => {
        return new Promise(async resolve => {
          resolveFunction = resolve;
          await joinRequest(email);
        });
      }
    );
  };
}
