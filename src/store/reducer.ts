import * as redux from "redux";
import * as R from "ramda";
import { IStore, IMember, ICommunity, Status } from "./model";
import { 
    ACTION_JOIN_COMMUNITY, ACTION_JOIN_COMMUNITY_COMPLETED,
	ACTION_LEAVE_COMMUNITY, ACTION_LEAVE_COMMUNITY_COMPLETED,
	ACTION_LOAD_COMMUNITIES, ACTION_LOAD_COMMUNITIES_COMPLETED,
	ACTION_STATUSES_UPDATED,
	IMemberStatus,
	ACTION_SESSION_CREATED,
	SessionType
} from "./actions";

const initialState: IStore = {
	isLoading: true,
	communities: []
}

const sorted = R.sortBy(R.prop("name"));

const setDefaultStatus = (m: IMember) => ({...m, status: Status.offline})

export const reducer: redux.Reducer = (state: IStore = initialState, action) => {
	switch(action.type) {
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
						isLeaving: false
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
							members: sorted(action.members.map(setDefaultStatus)),
							helpRequests: [],
							codeReviews: [],
							broadcasts: []
						}
					} else {
						return community
					}
				})
			}

		case ACTION_LEAVE_COMMUNITY:
			return {
				...state,
				communities: state.communities.filter(community => {
					if (community.name === action.name) {
						return {
							...community,
							isLeaving: true 
						}
					} else {
						return community
					}
				})
			}

		case ACTION_LEAVE_COMMUNITY_COMPLETED:
			return {
				...state,
				communities: state.communities.filter(community => 
					community.name !== action.name
				)
			}

		case ACTION_LOAD_COMMUNITIES:
			return initialState;

		case ACTION_LOAD_COMMUNITIES_COMPLETED:
			// memberSorter sorts members and adds the default status value
			const memberSorter = (c: ICommunity) => ({
				...c,
				members: sorted(c.members.map(setDefaultStatus)),
				broadcasts: [],
				codeReviews: [],
				helpRequests: []
			});
			return {
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
								({email}: IMemberStatus) => email === m.email
							)
							return {
								...m,
								status: memberStatus ? memberStatus.status : m.status
							}
						})
					}),
					state.communities)
			}

		case ACTION_SESSION_CREATED:
			const type = action.sessionType;
			const session = {
				description: action.description
			};
			let sessionType: string = "helpRequests";
			if (type === SessionType.Broadcast) {
				sessionType = "broadcasts";
			} else if (type === SessionType.CodeReview) {
				sessionType = "codeReviews";
			}

			return {
				...state,
					communities: state.communities.map(community => {
					if (community.name === action.community) {
						return {
							...community,
							[sessionType]: [
								// @ts-ignore
								...community[sessionType],
								session
							]
						};
					} else {
						return community;
					}
				})
			}
			
		default:
			return state;
	}
}