import { createAction } from "redux-starter-kit";
import { Access } from "vsls";
import {
  IActiveSession,
  IMember,
  IMemberStatus,
  ISession,
  ISpace,
  SessionType
} from "./model";

export const ACTION_JOIN_SPACE = "JOIN_SPACE";
export const ACTION_JOIN_SPACE_COMPLETED = "JOIN_SPACE_COMPLETED";
export const ACTION_LEAVE_SPACE = "LEAVE_SPACE";
export const ACTION_LEAVE_SPACE_COMPLETED = "LEAVE_SPACE_COMPLETED";
export const ACTION_LOAD_SPACES = "LOAD_SPACES";
export const ACTION_LOAD_SPACES_COMPLETED = "LOAD_SPACES_COMPLETED";
export const ACTION_STATUSES_UPDATED = "STATUSES_UPDATED";
export const ACTION_CREATE_SESSION = "CREATE_SESSION";
export const ACTION_SESSION_CREATED = "SESSION_CREATED";
export const ACTION_ACTIVE_SESSION_ENDED = "ACTIVE_SESSION_ENDED";
export const ACTION_CLEAR_ZOMBIE_SESSIONS = "CLEAR_ZOMBIE_SESSIONS";
export const ACTION_SPACE_NODE_EXPANDED = "SPACE_NODE_EXPANDED";
export const ACTION_USER_AUTHENTICATION_CHANGED = "USER_AUTHENTICATION_CHANGED";
export const ACTION_SPACE_UPDATED = "SPACE_UPDATED";

function action(type: string, payload = {}) {
  return { type, ...payload };
}

export const loadSpaces = () => action(ACTION_LOAD_SPACES);

export const loadSpacesCompleted = (spaces: ISpace[]) =>
  action(ACTION_LOAD_SPACES_COMPLETED, { spaces });

export const joinSpace = (name: string, key?: string) =>
  action(ACTION_JOIN_SPACE, { name: name.toLowerCase(), key });

export const joinSpaceCompleted = (
  name: string,
  members: any,
  sessions: any,
  isMuted: boolean,
  readme: string
) =>
  action(ACTION_JOIN_SPACE_COMPLETED, {
    name,
    members,
    sessions,
    isMuted,
    readme
  });

export const leaveSpace = (name: string) =>
  action(ACTION_LEAVE_SPACE, { name });

export const leaveSpaceCompleted = (name: string) =>
  action(ACTION_LEAVE_SPACE_COMPLETED, { name });

export const statusesUpdated = (statuses: IMemberStatus[]) =>
  action(ACTION_STATUSES_UPDATED, { statuses });

export const createSession = (
  space: string,
  type: SessionType,
  description: string,
  access: Access
) =>
  action(ACTION_CREATE_SESSION, {
    description,
    sessionType: type,
    space,
    access
  });

export const sessionCreated = (activeSession: IActiveSession) =>
  action(ACTION_SESSION_CREATED, { activeSession });

export const activeSessionEnded = () => action(ACTION_ACTIVE_SESSION_ENDED);

export const clearZombieSessions = () => action(ACTION_CLEAR_ZOMBIE_SESSIONS);

export const spaceNodeExpanded = (space: ISpace, nodeType: string) =>
  action(ACTION_SPACE_NODE_EXPANDED, { space, nodeType });

export const userAuthenticationChanged = (isSignedIn: boolean) =>
  action(ACTION_USER_AUTHENTICATION_CHANGED, { isSignedIn });

export const updateSpace = (
  name: string,
  members: IMember[],
  sessions: ISession[],
  readme: string
) => action(ACTION_SPACE_UPDATED, { name, members, sessions, readme });

export const clearMessages = createAction<string>("messages/clear");

export const muteSpace = createAction<string>("space/mute");

export const unmuteSpace = createAction<string>("space/unmute");

export const muteAllSpaces = createAction("space/muteAll");

export const unmuteAllSpaces = createAction("space/unmuteAll");

export const makeSpacePrivate = createAction("space/makePrivate");

export const makeSpacePublic = createAction("space/makePublic");

export const joinSpaceFailed = createAction<string>("space/joinFailed");

export const updateReadme = createAction("space/updateReadme");
