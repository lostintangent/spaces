import axios from "axios";
import { ICommunity, IMember, ISession } from "./store/model";

const BASE_URL = "http://vslscommunitieswebapp.azurewebsites.net/v0";

export async function loadCommunities(communities: string[]): Promise<ICommunity[]> {
    const { data } = await axios.get(`${BASE_URL}/load?names=${communities.join(',')}`);
    // TODO: the API returns array of sessions, which will need to be split into the different types
    return data;
}

export async function joinCommunity(community: string, name: string, email: string): Promise<any> {
    const { members, sessions } = await axios.post(`${BASE_URL}/join`, createCommunityRequest(community, name, email));
    return { members, sessions };
}

export async function leaveCommunity(community: string, name: string, email: string) {
    return await axios.post(`${BASE_URL}/leave`, createCommunityRequest(community, name, email));
}

export async function createSession(community: string, session: any) {
    return await axios.post(`${BASE_URL}/community/${community}/session`, session)
}

export async function deleteSession(community: string, session: any) {
    return await axios.delete(`${BASE_URL}/community/${community}/session`, session)
}

function createCommunityRequest(communityName: string, memberName: string, memberEmail: string) {
    return {
        name: communityName,
        member: {
            name: memberName,
            email: memberEmail
        }
    };
}