import * as vscode from "vscode";

export type CallingServiceEvent = "onMuteChanged" | "newAudioCallAvailable";

export interface IWindowDescription {
  id: number;
  description: string;
  appName: string;
}

export interface IParticipantInfo {
  displayName: string;
  id: string;
  isServerMuted: boolean;
  voiceLevel: number;
}

export interface ICallingService {
  checkIfCallIsAvailable(): void;
  connectToCall(groupContext: string, enableAudio: boolean): Promise<void>;
  getCurrentDevices(): Promise<any>;
  getCurrentParticipants(): Promise<IParticipantInfo[]>;
  dispose(): Promise<void>;
  getDominantSpeakers(): Promise<IParticipantInfo[]>;
  endAndCleanUpCurrentCall(): Promise<void>;
  enumerateDevices(): Promise<any[]>;
  isMuted(): Promise<boolean>;
  handleLiveShareSessionEnded(): void;
  mute(participantId?: IParticipantInfo): Promise<void>;
  selectDevice(deviceId: string, deviceType: any): Promise<void>;
  unmute(participantId?: IParticipantInfo): Promise<void>;
  getWindowsForSharing(): Promise<IWindowDescription[]>;
  shareWindow(windowId: number): Promise<void>;

  readonly onNewAudioCallAvailable: vscode.Event<{}>;
  readonly onMuteChanged: vscode.Event<IParticipantInfo>;
  readonly onParticipantsChanged: vscode.Event<{}>;
  readonly onParticipantChanged: vscode.Event<{}>;
  readonly onCallEnded: vscode.Event<{}>;
}
