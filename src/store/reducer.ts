import * as R from "ramda";
import * as redux from "redux";
import {
  ACTION_ACTIVE_SESSION_ENDED,
  ACTION_COMMUNITY_NODE_EXPANDED,
  ACTION_JOIN_COMMUNITY,
  ACTION_JOIN_COMMUNITY_COMPLETED,
  ACTION_LEAVE_COMMUNITY,
  ACTION_LEAVE_COMMUNITY_COMPLETED,
  ACTION_LOAD_COMMUNITIES,
  ACTION_LOAD_COMMUNITIES_COMPLETED,
  ACTION_SESSION_CREATED,
  ACTION_STATUSES_UPDATED,
  ACTION_USER_AUTHENTICATION_CHANGED,
  muteAllCommunities,
  muteCommunity,
  unmuteAllCommunities,
  unmuteCommunity
} from "./actions";
import {
  ICommunity,
  IMember,
  IMemberStatus,
  ISession,
  IStore,
  SessionType,
  Status
} from "./model";

const initialState: IStore = {
  isLoading: true,
  isSignedIn: false,
  communities: []
};

const sorted = R.sortBy(R.prop("name"));

const setDefaultStatus = (m: IMember) => ({ ...m, status: Status.offline });

export const reducer: redux.Reducer = (
  state: IStore = initialState,
  action
) => {
  switch (action.type) {
    case ACTION_JOIN_COMMUNITY:
      return {
        ...state,
        communities: sorted([
          ...state.communities,
          {
            name: action.name,
            members: [],
            broadcasts: [],
            helpRequests: [],
            codeReviews: [],
            isLoading: true,
            isLeaving: false,
            isExpanded: false,
            isMuted: true
          }
        ])
      };

    case ACTION_JOIN_COMMUNITY_COMPLETED:
      return {
        ...state,
        communities: state.communities.map(community => {
          if (community.name === action.name) {
            return {
              ...community,
              isLoading: false,
              isMuted: action.isMuted,
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
            return community;
          }
        })
      };

    case ACTION_LEAVE_COMMUNITY:
      return {
        ...state,
        communities: state.communities.filter(community => {
          if (community.name === action.name) {
            return {
              ...community,
              isLeaving: true
            };
          } else {
            return community;
          }
        })
      };

    case ACTION_LEAVE_COMMUNITY_COMPLETED:
      return {
        ...state,
        communities: state.communities.filter(
          community => community.name !== action.name
        )
      };

    case ACTION_LOAD_COMMUNITIES:
      return {
        ...state,
        isLoading: true,
        communities: []
      };

    case ACTION_LOAD_COMMUNITIES_COMPLETED:
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
        communities: R.map(memberSorter, sorted(action.communities))
      };

    case ACTION_STATUSES_UPDATED:
      return {
        ...state,
        communities: R.map(
          (community: ICommunity) => ({
            ...community,
            members: community.members.map(m => {
              const memberStatus = action.statuses.find(
                ({ email }: IMemberStatus) => email === m.email
              );
              return {
                ...m,
                status: memberStatus ? memberStatus.status : m.status
              };
            })
          }),
          state.communities
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
        communities: state.communities.map(community => {
          if (community.name === action.activeSession.community) {
            return {
              ...community,
              [sessionType]: [
                // @ts-ignore
                ...community[sessionType],
                action.activeSession.session
              ]
            };
          } else {
            return community;
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
        communities: state.communities.map(community => {
          if (community.name === activeSession.community) {
            return {
              ...community,
              // @ts-ignore
              [sessionType]: community[sessionType].filter(
                (s: ISession) => s.id !== activeSession.session.id
              )
            };
          } else {
            return community;
          }
        })
      };
    }

    case ACTION_COMMUNITY_NODE_EXPANDED:
      const property =
        action.nodeType === "members" ? "isExpanded" : "isHelpRequestsExpanded";

      return {
        ...state,
        communities: state.communities.map(community => {
          if (community.name === action.community.name) {
            return {
              ...community,
              [property]: true
            };
          } else {
            return community;
          }
        })
      };

    case ACTION_USER_AUTHENTICATION_CHANGED:
      return {
        ...state,
        isSignedIn: action.isSignedIn
      };

    case muteCommunity.toString():
      return {
        ...state,
        communities: state.communities.map(community => {
          if (community.name === action.payload) {
            return {
              ...community,
              isMuted: true
            };
          } else {
            return community;
          }
        })
      };

    case unmuteCommunity.toString():
      return {
        ...state,
        communities: state.communities.map(community => {
          if (community.name === action.payload) {
            return {
              ...community,
              isMuted: false
            };
          } else {
            return community;
          }
        })
      };

    case muteAllCommunities.toString():
      return {
        ...state,
        isMuted: true,
        communities: state.communities.map(community => {
          return {
            ...community,
            isMuted: true
          };
        })
      };

    case unmuteAllCommunities.toString():
      return {
        ...state,
        isMuted: false,
        communities: state.communities.map(community => {
          return {
            ...community,
            isMuted: false
          };
        })
      };

    default:
      return state;
  }
};
