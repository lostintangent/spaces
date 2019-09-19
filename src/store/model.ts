export interface IStore {
  isLoading: boolean;
  isSignedIn: boolean;
  isMuted?: boolean;
  activeSession?: IActiveSession;
  spaces: ISpace[];
}

export interface ISpace {
  founders: string[];
  isLoading?: boolean;
  isLeaving?: boolean;
  isExpanded?: boolean;
  isMuted?: boolean;
  isPrivate?: boolean;
  isHelpRequestsExpanded?: boolean;
  name: string;
  members: IMember[];
  helpRequests: ISession[];
  codeReviews: ISession[];
  broadcasts: ISession[];
  blockedMembers: string[];
  key: string;
  readme?: string;
}

export interface IMember {
  name: string;
  email: string;
  status: Status;
  thanks: number;
  title: string | undefined;
}

export enum Status {
  available = "available",
  away = "away",
  doNotDisturb = "doNotDisturb",
  offline = "offline"
}

export interface IActiveSession {
  space: string;
  session: ISession;
}

export interface ISession {
  id: string;
  host: string;
  startTime: Date;
  description: string;
  url: string;
  type: SessionType;
}

export enum SessionType {
  Broadcast,
  CodeReview,
  HelpRequest
}

export interface IMemberStatus {
  email: string;
  status: Status;
}
