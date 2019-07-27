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
        const communityIndex = communities.indexOf(name);

        const updateCommunities = communities.splice(communityIndex, 1);
        this.saveCommunities(communities);
    }

    private saveCommunities(communities: string[]) {
        this.storage.update(STORAGE_KEY, communities);
    }
}