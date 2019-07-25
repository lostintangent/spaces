import * as redux from "redux";
import * as R from "ramda";
import { IStore, IMember, ICommunity } from "./model";
import { 
    ACTION_JOIN_COMMUNITY, ACTION_JOIN_COMMUNITY_COMPLETED,
	ACTION_LEAVE_COMMUNITY, ACTION_LEAVE_COMMUNITY_COMPLETED,
	ACTION_LOAD_COMMUNITIES, ACTION_LOAD_COMMUNITIES_COMPLETED
} from "./actions";

const initialState: IStore = {
	isLoading: true,
	communities: []
}

const sorted = R.sortBy(R.prop("name"));

const reducer: redux.Reducer = (state: IStore = initialState, action) => {
	switch(action.type) {
		case ACTION_JOIN_COMMUNITY:
			return {
				...state,
				communities: sorted([
					...state.communities,
					{
						name: action.name,
						members: [],
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
							members: sorted(action.members)
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
			const memberSorter = (c: ICommunity) => ({...c, members: sorted(c.members)});

			// R.
			// const memberSorter = c => R.merge(R.identity(c), sorted(R.pluck("members", c)))

			// R.map(
			// 	c => {
			// 		return R.merge(c, {members: sorted(c.members)})
			// 	},

			// 	sorted(action.communities)
			// )

			return {
				isLoading: false,
				communities: R.map(memberSorter, sorted(action.communities))
			};

		default:
			return state;
	}
}

export default reducer;