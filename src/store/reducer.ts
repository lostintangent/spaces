import * as redux from "redux";
import { IStore, IContact, INetwork } from "./model";
import { 
    ACTION_JOIN_NETWORK, ACTION_JOIN_NETWORK_COMPLETED,
	ACTION_LEAVE_NETWORK, ACTION_LEAVE_NETWORK_COMPLETED,
	ACTION_LOAD_NETWORKS, ACTION_LOAD_NETWORKS_COMPLETED
} from "./actions";

import * as R from "ramda";

const initialState: IStore = {
	isLoading: true,
	networks: []
}

const sorted = R.sortBy(R.prop("name"));

const reducer: redux.Reducer = (state: IStore = initialState, action) => {
	switch(action.type) {
		case ACTION_JOIN_NETWORK:
			return {
				...state,
				networks: sorted([
					...state.networks,
					{
						name: action.name,
						contacts: [],
						isLoading: true,
						isLeaving: false
					}
				])
			};

		case ACTION_JOIN_NETWORK_COMPLETED:
			return {
				...state,
				networks: state.networks.map(network => {
					if (network.name === action.name) {
						return { 
							...network,
							isLoading: false,
							contacts: sorted(action.contacts)
						}
					} else {
						return network
					}
				})
			}

		case ACTION_LEAVE_NETWORK:
			return {
				...state,
				networks: state.networks.filter(network => {
					if (network.name === action.name) {
						return {
							...network,
							isLeaving: true 
						}
					} else {
						return network
					}
				})
			}

		case ACTION_LEAVE_NETWORK_COMPLETED:
			return {
				...state,
				networks: state.networks.filter(network => 
					network.name !== action.name
				)
			}

		case ACTION_LOAD_NETWORKS:
			return initialState;

		case ACTION_LOAD_NETWORKS_COMPLETED:
			return {
				isLoading: false,
				networks: sorted(action.networks) // TODO: Sort contacts as well
			};

		default:
			return state;
	}
}

export default reducer;