import * as vsls from "vsls";
import * as redux from "redux";
import ws from "./ws";
import * as api from "./api";
import { IStore, IMember } from "./store/model";

// This is the interface for the integration with the Team Chat extension
export class ChatApi {
    callback: any;

    constructor(private vslsApi: vsls.LiveShare, private store: redux.Store) {}

    getCommunities(): string[] {
        const state: IStore = this.store.getState();
        return state.communities.map(c => c.name);
    }

    getUserInfo() {
        const userInfo = this.vslsApi.session.user

        if (userInfo) {
            return {
                name: userInfo.displayName,
                email: userInfo.emailAddress
            }
        }
    }

    getUsers() {
        const state: IStore = this.store.getState();
        let allMembers: IMember[] = [];
        state.communities.forEach(c => {
            allMembers = [...allMembers, ...c.members]
        })
        return allMembers;
    }

    async getChannelHistory(communityName: string) {
        return await api.getMessages(communityName);
    }

    sendMessage(communityName: string, content: string) {
        ws.sendMessage(communityName, content);
    }

    setMessageCallback(callback: any) {
        this.callback = callback;
    }

    onMessageReceived(name: string, messages: any) {
        if (this.callback) {
            this.callback({ name, messages })
        }
    }
}