export interface IStore {
  isLoading: boolean;
  isSignedIn: boolean;
  activeSession?: IActiveSession;
  communities: ICommunity[];
}

export interface ICommunity {
  isLoading?: boolean;
  isLeaving?: boolean;
  isExpanded?: boolean;
  isHelpRequestsExpanded?: boolean;
  name: string;
  members: IMember[];
  helpRequests: ISession[];
  codeReviews: ISession[];
  broadcasts: ISession[];
}

export interface IMember {
  name: string;
  email: string;
  status: Status;
  title: string | undefined;
}

export enum Status {
  available = "available",
  away = "away",
  doNotDisturb = "doNotDisturb",
  offline = "offline"
}

export interface IActiveSession {
  community: string;
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
