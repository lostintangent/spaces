import * as R from "ramda";
import * as redux from "redux";
import {
  ACTION_ACTIVE_SESSION_ENDED,
  ACTION_JOIN_SPACE,
  ACTION_JOIN_SPACE_COMPLETED,
  ACTION_LEAVE_SPACE,
  ACTION_LEAVE_SPACE_COMPLETED,
  ACTION_LOAD_SPACES,
  ACTION_LOAD_SPACES_COMPLETED,
  ACTION_SESSION_CREATED,
  ACTION_SPACE_NODE_EXPANDED,
  ACTION_STATUSES_UPDATED,
  ACTION_USER_AUTHENTICATION_CHANGED,
  joinSpaceFailed,
  makeSpacePrivate,
  makeSpacePublic,
  muteAllSpaces,
  muteSpace,
  unmuteAllSpaces,
  unmuteSpace,
  updateReadme
} from "./actions";
import {
  IMember,
  IMemberStatus,
  ISession,
  ISpace,
  IStore,
  SessionType,
  Status
} from "./model";

const initialState: IStore = {
  isLoading: true,
  isSignedIn: false,
  spaces: []
};

const sorted = R.sortBy(R.prop("name"));

const setDefaultStatus = (m: IMember) => ({ ...m, status: Status.offline });

export const reducer: redux.Reducer = (
  state: IStore = initialState,
  action
) => {
  switch (action.type) {
    case ACTION_JOIN_SPACE:
      return {
        ...state,
        spaces: sorted([
          ...state.spaces,
          {
            name: action.name,
            members: [],
            broadcasts: [],
            helpRequests: [],
            codeReviews: [],
            isLoading: true,
            isLeaving: false,
            isExpanded: false,
            isPrivate: !!action.key,
            key: action.key,
            isMuted: true
          }
        ])
      };

    case ACTION_JOIN_SPACE_COMPLETED:
      return {
        ...state,
        spaces: state.spaces.map(space => {
          if (space.name === action.name) {
            return {
              ...space,
              isLoading: false,
              isMuted: action.isMuted,
              readme: action.readme,
              members: sorted(action.members.map(setDefaultStatus)),
              helpRequests: action.sessions.filter(
                (s: any) => s.type === SessionType.HelpRequest
              ),
              codeReviews: action.sessions.filter(
                (s: any) => s.type === SessionType.CodeReview
              ),
              broadcasts: action.sessions.filter(
                (s: any) => s.type === SessionType.Broadcast
              )
            };
          } else {
            return space;
          }
        })
      };

    case joinSpaceFailed.toString():
      return {
        ...state,
        spaces: state.spaces.filter(space => space.name !== action.payload)
      };

    case ACTION_LEAVE_SPACE:
      return {
        ...state,
        spaces: state.spaces.filter(space => {
          if (space.name === action.name) {
            return {
              ...space,
              isLeaving: true
            };
          } else {
            return space;
          }
        })
      };

    case ACTION_LEAVE_SPACE_COMPLETED:
      return {
        ...state,
        spaces: state.spaces.filter(space => space.name !== action.name)
      };

    case ACTION_LOAD_SPACES:
      return {
        ...state,
        isLoading: true,
        spaces: []
      };

    case ACTION_LOAD_SPACES_COMPLETED:
      // memberSorter sorts members and adds the default status value
      const memberSorter = (c: any) => ({
        ...c,
        members: sorted(c.members.map(setDefaultStatus)),
        broadcasts: c.sessions.filter(
          (s: any) => s.type === SessionType.Broadcast
        ),
        codeReviews: c.sessions.filter(
          (s: any) => s.type === SessionType.CodeReview
        ),
        helpRequests: c.sessions.filter(
          (s: any) => s.type === SessionType.HelpRequest
        )
      });
      return {
        ...state,
        isLoading: false,
        spaces: R.map(memberSorter, sorted(action.spaces))
      };

    case ACTION_STATUSES_UPDATED:
      return {
        ...state,
        spaces: R.map(
          (space: ISpace) => ({
            ...space,
            members: space.members.map(m => {
              const memberStatus = action.statuses.find(
                ({ email }: IMemberStatus) => email === m.email
              );
              return {
                ...m,
                status: memberStatus ? memberStatus.status : m.status
              };
            })
          }),
          state.spaces
        )
      };

    case ACTION_SESSION_CREATED: {
      const type = action.activeSession.session.type;
      let sessionType: string = "helpRequests";
      if (type === SessionType.Broadcast) {
        sessionType = "broadcasts";
      } else if (type === SessionType.CodeReview) {
        sessionType = "codeReviews";
      }

      return {
        ...state,
        activeSession: action.activeSession,
        spaces: state.spaces.map(space => {
          if (space.name === action.activeSession.space) {
            return {
              ...space,
              [sessionType]: [
                // @ts-ignore
                ...space[sessionType],
                action.activeSession.session
              ]
            };
          } else {
            return space;
          }
        })
      };
    }

    case ACTION_ACTIVE_SESSION_ENDED: {
      const activeSession = state.activeSession!;
      let sessionType: string = "helpRequests";
      if (activeSession.session.type === SessionType.Broadcast) {
        sessionType = "broadcasts";
      } else if (activeSession.session.type === SessionType.CodeReview) {
        sessionType = "codeReviews";
      }

      return {
        ...state,
        activeSession: null,
        spaces: state.spaces.map(space => {
          if (space.name === activeSession.space) {
            return {
              ...space,
              // @ts-ignore
              [sessionType]: space[sessionType].filter(
                (s: ISession) => s.id !== activeSession.session.id
              )
            };
          } else {
            return space;
          }
        })
      };
    }

    case ACTION_SPACE_NODE_EXPANDED:
      const property =
        action.nodeType === "members" ? "isExpanded" : "isHelpRequestsExpanded";

      return {
        ...state,
        spaces: state.spaces.map(space => {
          if (space.name === action.space.name) {
            return {
              ...space,
              [property]: true
            };
          } else {
            return space;
          }
        })
      };

    case ACTION_USER_AUTHENTICATION_CHANGED:
      return {
        ...state,
        isSignedIn: action.isSignedIn
      };

    case muteSpace.toString():
      return {
        ...state,
        spaces: state.spaces.map(space => {
          if (space.name === action.payload) {
            return {
              ...space,
              isMuted: true
            };
          } else {
            return space;
          }
        })
      };

    case unmuteSpace.toString():
      return {
        ...state,
        spaces: state.spaces.map(space => {
          if (space.name === action.payload) {
            return {
              ...space,
              isMuted: false
            };
          } else {
            return space;
          }
        })
      };

    case muteAllSpaces.toString():
      return {
        ...state,
        isMuted: true,
        spaces: state.spaces.map(space => {
          return {
            ...space,
            isMuted: true
          };
        })
      };

    case unmuteAllSpaces.toString():
      return {
        ...state,
        isMuted: false,
        spaces: state.spaces.map(space => {
          return {
            ...space,
            isMuted: false
          };
        })
      };

    case makeSpacePrivate.toString():
      return {
        ...state,
        spaces: state.spaces.map(space => {
          if (space.name === action.payload.space) {
            return {
              ...space,
              isPrivate: true,
              key: action.payload.key
            };
          } else {
            return space;
          }
        })
      };

    case makeSpacePublic.toString():
      return {
        ...state,
        spaces: state.spaces.map(space => {
          if (space.name === action.payload) {
            return {
              ...space,
              isPrivate: false,
              key: null
            };
          } else {
            return space;
          }
        })
      };

    case updateReadme.toString():
      return {
        ...state,
        spaces: state.spaces.map(space => {
          if (space.name === action.payload.space) {
            return {
              ...space,
              readme: action.payload.readme
            };
          } else {
            return space;
          }
        })
      };

    default:
      return state;
  }
};
