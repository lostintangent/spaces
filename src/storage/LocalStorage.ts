import { Memento } from "vscode";

const STORAGE_KEY = "liveshare.communities";

export class LocalStorage {
    constructor(private storage: Memento) {}

    public getCommunities() {
        return this.storage.get<string[]>(STORAGE_KEY, []);
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

    private saveCommunities(communities: string[]) {
        this.storage.update(STORAGE_KEY, communities);
    }
}