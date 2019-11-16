import { LiveShare } from "vsls";
import { Methods } from "vsls/vsls-contactprotocol.js";

const LIVESHARE_PRESENCE_PROVIDER_ID = "LivesharePresence";
function isLiveshareProvider(provider: any) {
  return provider.serviceId === LIVESHARE_PRESENCE_PROVIDER_ID;
}

export interface MessageSender {
  displayName: string;
  emailAddress: string;
}

export class ContactMessageManager {
  private presenceProvider: any;
  private messageHandlers: Map<string, Function> = new Map();

  constructor(private vsls: LiveShare) {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    (<any>this.vsls).onPresenceProviderRegistered((e: any) => {
      if (isLiveshareProvider(e.added)) {
        this.initializeProvider(e.added);
      }
    });

    const providers = (<any>this.vsls).presenceProviders;
    const index = providers.findIndex((p: any) => isLiveshareProvider(p));
    if (index !== -1) {
      this.initializeProvider(providers[index]);
    }
  }

  private initializeProvider(presenceProvider: any) {
    this.presenceProvider = presenceProvider.provider;

    this.presenceProvider.onNotified(async (e: any) => {
      if (e.type === Methods.NotifyMessageReceivedName) {
        const { body, type } = e.body;
        if (this.messageHandlers.has(type)) {
          const sender = body.sender;
          delete body.sender;

          await this.messageHandlers.get(type)!(sender, body);
        }
      }
    });
  }

  public registerMessageHandler(type: string, callback: Function) {
    this.messageHandlers.set(type, callback);

    return async (email: string, body: any = {}) => {
      await this.sendMessage(email, type, body);
    };
  }

  public async sendMessage(email: string, type: string, body: any = {}) {
    Object.defineProperty(body, "sender", {
      value: {
        displayName: this.vsls.session.user!.displayName,
        email: this.vsls.session.user!.emailAddress
      }
    });

    const { contacts } = await this.vsls.getContacts([email]);
    const targetContactId = contacts[email].id;

    const message = {
      type,
      body,
      targetContactId
    };

    await this.presenceProvider.requestAsync(
      Methods.RequestSendMessageName,
      message
    );
  }
}
