import * as redux from "redux";
import * as vsls from "vsls";
import * as api from "./api";
import { IMember, IStore } from "./store/model";
import ws from "./ws";

// This is the interface for the integration with the Live Share Chat extension
export class ChatApi {
  userChangedCallback: any;
  messageCallback: any;
  infoMessageCallback: any;
  spaceCallback: any;
  clearMessagesCallback: any;

  constructor(private vslsApi: vsls.LiveShare, private store: redux.Store) {}

  getSpaces(): string[] {
    const state: IStore = this.store.getState();
    return state.spaces.map(c => c.name);
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
    state.spaces.forEach(c => {
      allMembers = [...allMembers, ...c.members];
    });
    return allMembers;
  }

  async getChannelHistory(spaceName: string) {
    return await api.getMessages(spaceName);
  }

  sendMessage(spaceName: string, content: string) {
    ws.sendMessage(spaceName, content);
  }

  setUserChangedCallback(callback: any) {
    this.userChangedCallback = callback;
  }

  setMessageCallback(callback: any) {
    this.messageCallback = callback;
  }

  setInfoMessageCallback(callback: any) {
    this.infoMessageCallback = callback;
  }

  setClearMessagesCallback(callback: Function) {
    this.clearMessagesCallback = callback;
  }

  setSpaceCallback(callback: any) {
    this.spaceCallback = callback;
  }

  onUserChanged(userInfo: vsls.UserInfo | null) {
    if (this.userChangedCallback && userInfo) {
      this.userChangedCallback({
        name: userInfo.displayName,
        email: userInfo.emailAddress
      });
    }
  }

  onMessageReceived(name: string, messages: any) {
    if (this.messageCallback) {
      this.messageCallback({ name, messages });
    }
  }

  onInfoMessage(spaceName: string, messageText: string, userEmail: string) {
    if (this.infoMessageCallback) {
      this.infoMessageCallback({
        name: spaceName,
        text: messageText,
        user: userEmail
      });
    }
  }

  onSpaceJoined(name: string) {
    if (this.spaceCallback) {
      this.spaceCallback(name);
    }
  }

  onMessagesCleared(spaceName: string) {
    if (this.clearMessagesCallback) {
      this.clearMessagesCallback(spaceName);
    }
  }
}
