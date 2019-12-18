import { IAuthenticationState } from "./reducers/authenticationReducer";
import { IBranchBroadcastsState } from "./reducers/branchBroadcastsReducer";
import { ISpacesState } from "./reducers/spacesReducer";

export interface IStore {
  spaces: ISpacesState;
  authentication: IAuthenticationState;
  broadcastBranches: IBranchBroadcastsState;
}

export interface IComment {
  body: string;
  author: string;
}

export interface ICommentThread {
  repository: string;
  file: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  comments: IComment[];
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
  blocked_members: string[];
  key: string | null;
  readme?: string;
  commentThreads: ICommentThread[];
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

export interface IBranchBroadcastRecord {
  isExplicitlyStopped: boolean;
  spaceName: string;
  branchName: string;
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
