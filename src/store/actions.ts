import * as redux from "redux";
import * as vsls from "vsls";
import * as api from "../api";
import * as cm from "../contacts/contactManager";
import { LocalStorage } from "../storage/LocalStorage";
import { ICommunity, IMember, Status } from "./model";
import { create } from "domain";

export const ACTION_JOIN_COMMUNITY = "JOIN_COMMUNITY";
export const ACTION_JOIN_COMMUNITY_COMPLETED = "JOIN_COMMUNITY_COMPLETED";
export const ACTION_LEAVE_COMMUNITY = "LEAVE_COMMUNITY";
export const ACTION_LEAVE_COMMUNITY_COMPLETED = "LEAVE_COMMUNITY_COMPLETED";
export const ACTION_LOAD_COMMUNITIES = "LOAD_COMMUNITIES";
export const ACTION_LOAD_COMMUNITIES_COMPLETED = "LOAD_COMMUNITIES_COMPLETED";
export const ACTION_STATUSES_UPDATED = "STATUSES_UPDATED";
export const ACTION_SESSION_CREATED = "SESSION_CREATED";
export const ACTION_ACTIVE_SESSION_ENDED = "ACTIVE_SESSION_ENDED";

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

export function joinCommunityAsync(name: string, storage: LocalStorage, userInfo: vsls.UserInfo, vslsApi: vsls.LiveShare, store: redux.Store) {
	return async (dispatch: redux.Dispatch) => {
		storage.joinCommunity(name);
		dispatch(joinCommunity(name));

		const response = await api.joinCommunity(name, userInfo.displayName, userInfo.emailAddress!);
		dispatch(joinCommunityCompleted(name, response));

		cm.rebuildContacts(vslsApi, store);	
	}
}

export function updateCommunityAsync(name: string, members: IMember[], vslsApi: vsls.LiveShare, store: redux.Store) {
	return async (dispatch: redux.Dispatch) => {
		dispatch(joinCommunityCompleted(name, members));

		cm.rebuildContacts(vslsApi, store);
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

export function leaveCommunityAsync(name: string, storage: LocalStorage, vslsApi: vsls.LiveShare, store: redux.Store) {
	return async (dispatch: redux.Dispatch) => {
		storage.leaveCommunity(name);
		dispatch(leaveCommunity(name));
		
		await api.leaveCommunity(name, vslsApi.session.user!.displayName, vslsApi.session.user!.emailAddress!);
		dispatch(leaveCommunityCompleted(name));

		cm.rebuildContacts(vslsApi, store);
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

export function loadCommunitiesAsync(storage: LocalStorage, vslsApi: vsls.LiveShare, store: redux.Store) {
	return async (dispatch: redux.Dispatch) => {
		const communityNames: string[]= storage.getCommunities();
		dispatch(loadCommunities());
		
		let response: ICommunity[] = [];
		if (communityNames.length > 0) {
			response = await api.loadCommunities(communityNames)
		}

		dispatch(loadCommunitiesCompleted(response));

		cm.rebuildContacts(vslsApi, store);	
	}
}

export interface IMemberStatus {
	email: string;
	status: Status;
}

export enum SessionType {
	Broadcast,
	CodeReview,
	HelpRequest
}

export function statusesUpdated(statuses: IMemberStatus[]) {
	return {
		type: ACTION_STATUSES_UPDATED,
		statuses
	}
}

export function createSession(community: string, type: SessionType, description: string) {
	return {
		type: ACTION_SESSION_CREATED,
		description,
		sessionType: type,
		community
	}
}
export function createSessionAsync(community: string, type: SessionType, description: string, api: vsls.LiveShare) {
	return async (dispatch: redux.Dispatch) => {
		dispatch(createSession(community, type, description));

		const sessionUrl = await api.share();

		// Call the API
	}
}

export function endActiveSession() {
	return {
		type: ACTION_ACTIVE_SESSION_ENDED
	}
}

export function endActiveSessionAsync(api: vsls.LiveShare) {
	return async (dispatch: redux.Dispatch) => {
		dispatch(endActiveSession());

		if (api.session.id) {
			await api.end();
		}

		// Call the API
	}
}