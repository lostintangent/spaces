import * as redux from "redux";
import * as vsls from "vsls";
import * as api from "./api";
import { IMember, IStore } from "./store/model";
import ws from "./ws";

// This is the interface for the integration with the Team Chat extension
export class ChatApi {
  callback: any;
  communityCallback: any;
  clearMessageCallback: any;

  constructor(private vslsApi: vsls.LiveShare, private store: redux.Store) {}

  getCommunities(): string[] {
    const state: IStore = this.store.getState();
    return state.communities.map(c => c.name);
  }

  getUserInfo() {
    const userInfo = this.vslsApi.session.user;

    if (userInfo) {
      return {
        name: userInfo.displayName,
        email: userInfo.emailAddress
      };
    }
  }

  getUsers() {
    const state: IStore = this.store.getState();
    let allMembers: IMember[] = [];
    state.communities.forEach(c => {
      allMembers = [...allMembers, ...c.members];
    });
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

  setClearMessageCallback(callback: Function) {
    this.clearMessageCallback = callback;
  }

  setCommunityCallback(callback: any) {
    this.communityCallback = callback;
  }

  onMessageReceived(name: string, messages: any) {
    if (this.callback) {
      this.callback({ name, messages });
    }
  }

  onCommunityJoined(name: string) {
    if (this.communityCallback) {
      this.communityCallback(name);
    }
  }

  onMessagesCleared(communityName: string) {
    if (this.clearMessageCallback) {
      this.clearMessageCallback(communityName);
    }
  }
}
