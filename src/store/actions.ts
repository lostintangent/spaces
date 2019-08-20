import { createAction } from "redux-starter-kit";
import { Access } from "vsls";
import {
  IActiveSession,
  ICommunity,
  IMember,
  IMemberStatus,
  ISession,
  SessionType
} from "./model";

export const ACTION_JOIN_COMMUNITY = "JOIN_COMMUNITY";
export const ACTION_JOIN_COMMUNITY_COMPLETED = "JOIN_COMMUNITY_COMPLETED";
export const ACTION_LEAVE_COMMUNITY = "LEAVE_COMMUNITY";
export const ACTION_LEAVE_COMMUNITY_COMPLETED = "LEAVE_COMMUNITY_COMPLETED";
export const ACTION_LOAD_COMMUNITIES = "LOAD_COMMUNITIES";
export const ACTION_LOAD_COMMUNITIES_COMPLETED = "LOAD_COMMUNITIES_COMPLETED";
export const ACTION_STATUSES_UPDATED = "STATUSES_UPDATED";
export const ACTION_CREATE_SESSION = "CREATE_SESSION";
export const ACTION_SESSION_CREATED = "SESSION_CREATED";
export const ACTION_ACTIVE_SESSION_ENDED = "ACTIVE_SESSION_ENDED";
export const ACTION_COMMUNITY_NODE_EXPANDED = "COMMUNITY_NODE_EXPANDED";
export const ACTION_USER_AUTHENTICATION_CHANGED = "USER_AUTHENTICATION_CHANGED";
export const ACTION_COMMUNITY_UPDATED = "COMMUNITY_UPDATED";

function action(type: string, payload = {}) {
  return { type, ...payload };
}

export const loadCommunities = () => action(ACTION_LOAD_COMMUNITIES);

export const loadCommunitiesCompleted = (communities: ICommunity[]) =>
  action(ACTION_LOAD_COMMUNITIES_COMPLETED, { communities });

export const joinCommunity = (name: string) =>
  action(ACTION_JOIN_COMMUNITY, { name: name.toLowerCase() });

export const joinCommunityCompleted = (
  name: string,
  members: any,
  sessions: any
) => action(ACTION_JOIN_COMMUNITY_COMPLETED, { name, members, sessions });

export const leaveCommunity = (name: string) =>
  action(ACTION_LEAVE_COMMUNITY, { name });

export const leaveCommunityCompleted = (name: string) =>
  action(ACTION_LEAVE_COMMUNITY_COMPLETED, { name });

export const statusesUpdated = (statuses: IMemberStatus[]) =>
  action(ACTION_STATUSES_UPDATED, { statuses });

export const createSession = (
  community: string,
  type: SessionType,
  description: string,
  access: Access
) =>
  action(ACTION_CREATE_SESSION, {
    description,
    sessionType: type,
    community,
    access
  });

export const sessionCreated = (activeSession: IActiveSession) =>
  action(ACTION_SESSION_CREATED, { activeSession });

export const activeSessionEnded = () => action(ACTION_ACTIVE_SESSION_ENDED);

export const communityNodeExpanded = (
  community: ICommunity,
  nodeType: string
) => action(ACTION_COMMUNITY_NODE_EXPANDED, { community, nodeType });

export const userAuthenticationChanged = (isSignedIn: boolean) =>
  action(ACTION_USER_AUTHENTICATION_CHANGED, { isSignedIn });

export const updateCommunity = (
  name: string,
  members: IMember[],
  sessions: ISession[]
) => action(ACTION_COMMUNITY_UPDATED, { name, members, sessions });

export const clearMessages = createAction<string>("messages/clear");
