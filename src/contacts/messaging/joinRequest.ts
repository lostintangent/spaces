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
  const joinRequest = messageManager.registerMessageHandler(
    JOIN_MESSAGE_TYPE,
    async (sender: MessageSender, body: any) => {
      const message = `${sender.displayName} asked to join a collaboration session with you.`;
      const response = await window.showInformationMessage(message, "Share");
      if (response) {
        messageManager.sendMessage(
          sender.emailAddress,
          JOIN_ACCEPTED_MESSAGE_TYPE
        );
        const { contacts } = await vslsApi.getContacts([sender.emailAddress]);
        await contacts[sender.emailAddress].invite({ useEmail: false });
      } else {
        messageManager.sendMessage(
          sender.emailAddress,
          JOIN_REJECTED_MESSAGE_TYPE
        );
      }
    }
  );

  let resolveFunction: Function;

  messageManager.registerMessageHandler(
    JOIN_ACCEPTED_MESSAGE_TYPE,
    (sender: MessageSender, body: any) => {
      resolveFunction && resolveFunction();
    }
  );

  messageManager.registerMessageHandler(
    JOIN_REJECTED_MESSAGE_TYPE,
    (sender: MessageSender, body: any) => {
      resolveFunction && resolveFunction();

      const message = `${sender.displayName} declined your collaboration request.`;
      window.showInformationMessage(message);
    }
  );

  return (name: string, email: string) => {
    joinRequest(email);

    window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: `Waiting for ${name} to respond...`
      },
      () => {
        return new Promise(resolve => {
          resolveFunction = resolve;
        });
      }
    );
  };
}
