import * as redux from "redux";
import { IMember, ICommunity, Status } from "./model";

export const ACTION_JOIN_COMMUNITY = "JOIN_COMMUNITY";
export const ACTION_JOIN_COMMUNITY_COMPLETED = "JOIN_COMMUNITY_COMPLETED";
export const ACTION_LEAVE_COMMUNITY = "LEAVE_COMMUNITY";
export const ACTION_LEAVE_COMMUNITY_COMPLETED = "LEAVE_COMMUNITY_COMPLETED";
export const ACTION_LOAD_COMMUNITIES = "LOAD_COMMUNITIES";
export const ACTION_LOAD_COMMUNITIES_COMPLETED = "LOAD_COMMUNITIES_COMPLETED";

function joinCommunity(name: string) {
	return { 
		type: ACTION_JOIN_COMMUNITY,
		name
	}
}

function joinCommunityCompleted(name: string, members: IMember[]) {
	return { 
		type: ACTION_JOIN_COMMUNITY_COMPLETED,
		name,
		members
	}
}

export function joinCommunityAsync(name: string) {
	return (dispatch: redux.Dispatch) => {
		dispatch(joinCommunity(name));

		const members: IMember[] = [{
			name: "Derek Bekoe",
			email: "dbekoe@microsoft.com",
			status: Status.away
		}];
		// Call the service

		dispatch(joinCommunityCompleted(name, members));
	}
}

function leaveCommunity(name: string) {
	return {
		type: ACTION_LEAVE_COMMUNITY,
		name
	}
}

function leaveCommunityCompleted(name: string) {
	return { 
		type: ACTION_LEAVE_COMMUNITY_COMPLETED,
		name
	}
}

export function leaveNetworkAsync(name: string) {
	return (dispatch: redux.Dispatch) => {
		dispatch(leaveCommunity(name));
		dispatch(leaveCommunityCompleted(name));
	}
}

export function loadCommunities() {
	return { 
		type: ACTION_LOAD_COMMUNITIES
	}
}

export function loadCommunitiesCompleted(communities: ICommunity[]) {
	return {
		type: ACTION_LOAD_COMMUNITIES_COMPLETED,
		communities
	}
}

export function loadCommunitiesAsync() {
	return (dispatch: redux.Dispatch) => {
		dispatch(loadCommunities());

		setTimeout(() => {
			dispatch(loadCommunitiesCompleted([
				{
					name: "hackweek2019",
					members: [
						{
							name: "Jonathan Carter",
							email: "jc@trl.mx",
							status: Status.away
						},
						{
							name: "Arjun Artam",
							email: "foo@bar.com",
							status: Status.available
						}
					]
				},
				{
					name: "vssaas",
					members: [
						{
							name: "Arjun Artam",
							email: "foo@bar.com",
							status: Status.available
						}
					]
				}
			]))
		}, 3000);
	}
}
