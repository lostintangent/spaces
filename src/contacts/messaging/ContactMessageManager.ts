import { LiveShare } from "vsls";
import { Methods } from "vsls/vsls-contactprotocol.js";

const LIVESHARE_PRESENCE_PROVIDER_ID = "LivesharePresence";
function isLiveshareProvider(provider: any) {
  return provider.serviceId === LIVESHARE_PRESENCE_PROVIDER_ID;
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

    this.presenceProvider.onNotified((e: any) => {
      if (e.type === Methods.NotifyMessageReceivedName) {
        const message = e.body;
        if (this.messageHandlers.has(message.type)) {
          this.messageHandlers.get(message.type)!(message.body);
        }
      }
    });
  }

  public registerMessageHandler(type: string, callback: Function) {
    this.messageHandlers.set(type, callback);
  }

  public async sendMessage(targetContactId: string, type: string, body: any) {
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
