import * as redux from "redux";
import { IContact, INetwork } from "./model";

export const ACTION_JOIN_NETWORK = "JOIN_NETWORK";
export const ACTION_JOIN_NETWORK_COMPLETED = "JOIN_NETWORK_COMPLETED";
export const ACTION_LEAVE_NETWORK = "LEAVE_NETWORK";
export const ACTION_LEAVE_NETWORK_COMPLETED = "LEAVE_NETWORK_COMPLETED";
export const ACTION_LOAD_NETWORKS = "LOAD_NETWORKS";
export const ACTION_LOAD_NETWORKS_COMPLETED = "LOAD_NETWORKS_COMPLETED";

function joinNetwork(name: string) {
	return { 
		type: ACTION_JOIN_NETWORK,
		name
	}
}

function joinNetworkCompleted(name: string, contacts: IContact[]) {
	return { 
		type: ACTION_JOIN_NETWORK_COMPLETED,
		name,
		contacts
	}
}

export function joinNetworkAsync(name: string) {
	return (dispatch: redux.Dispatch) => {
		dispatch(joinNetwork(name));

		const contacts: IContact[] = [{
			name: "Derek Bekoe",
			email: "dbekoe@microsoft.com"
		}];
		// Call the service

		dispatch(joinNetworkCompleted(name, contacts));
	}
}

function leaveNetwork(name: string) {
	return {
		type: ACTION_LEAVE_NETWORK,
		name
	}
}

function leaveNetworkCompleted(name: string) {
	return { 
		type: ACTION_LEAVE_NETWORK_COMPLETED,
		name
	}
}

export function leaveNetworkAsync(name: string) {
	return (dispatch: redux.Dispatch) => {
		dispatch(leaveNetwork(name));
		dispatch(leaveNetworkCompleted(name));
	}
}

export function loadNetworks() {
	return { 
		type: ACTION_LOAD_NETWORKS
	}
}

export function loadNetworksCompleted(networks: INetwork[]) {
	return {
		type: ACTION_LOAD_NETWORKS_COMPLETED,
		networks
	}
}

export function loadNetworksAsync() {
	return (dispatch: redux.Dispatch) => {
		dispatch(loadNetworks());

		setTimeout(() => {
			dispatch(loadNetworksCompleted([
				{
					name: "hackweek2019",
					contacts: [
						{
							name: "Jonathan Carter",
							email: "jc@trl.mx"
						},
						{
							name: "Arjun Artam",
							email: "foo@bar.com"
						}
					]
				},
				{
					name: "vssaas",
					contacts: [
						{
							name: "Arjun Artam",
							email: "foo@bar.com"
						}
					]
				}
			]))
		}, 3000);
	}
}
