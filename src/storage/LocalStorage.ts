import { Memento } from "vscode";

const COMMUNITIES_STORAGE_KEY = "liveshare.communities";
const SESSION_STORAGE_KEY = "liveshare.session";

export class LocalStorage {
  constructor(private storage: Memento) {}

  public getCommunities() {
    return this.storage.get<string[]>(COMMUNITIES_STORAGE_KEY, []);
  }

  public joinCommunity(name: string) {
    const communities = this.getCommunities();
    communities.push(name);
    this.saveCommunities(communities);
  }

  public leaveCommunity(name: string) {
    const communities = this.getCommunities();
    this.saveCommunities(communities.filter(c => c !== name));
  }

  public saveActiveSession(sessionId: string, communityName: string) {
    this.storage.update(SESSION_STORAGE_KEY, {
      id: sessionId,
      name: communityName
    });
  }

  public clearActiveSession() {
    this.storage.update(SESSION_STORAGE_KEY, undefined);
  }

  public getActiveSession() {
    return this.storage.get(SESSION_STORAGE_KEY);
  }

  private saveCommunities(communities: string[]) {
    this.storage.update(COMMUNITIES_STORAGE_KEY, communities);
  }
}
