import { Memento } from "vscode";

const SPACES_STORAGE_KEY = "liveshare.spaces";
const SESSION_STORAGE_KEY = "liveshare.session";

export class LocalStorage {
  constructor(private storage: Memento) {}

  public getSpaces() {
    return this.storage.get<string[]>(SPACES_STORAGE_KEY, []);
  }

  public joinSpace(name: string) {
    const spaces = this.getSpaces();
    spaces.push(name);
    this.saveSpaces(spaces);
  }

  public leaveSpace(name: string) {
    const spaces = this.getSpaces();
    this.saveSpaces(spaces.filter(c => c !== name));
  }

  public saveActiveSession(sessionId: string, spaceName: string) {
    this.storage.update(SESSION_STORAGE_KEY, {
      id: sessionId,
      name: spaceName
    });
  }

  public clearActiveSession() {
    this.storage.update(SESSION_STORAGE_KEY, undefined);
  }

  public getActiveSession() {
    return this.storage.get(SESSION_STORAGE_KEY);
  }

  private saveSpaces(spaces: string[]) {
    this.storage.update(SPACES_STORAGE_KEY, spaces);
  }
}
