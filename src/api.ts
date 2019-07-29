import axios from "axios";
import { ICommunity, IMember } from "./store/model";

const BASE_URL = "http://vslscommunitieswebapp.azurewebsites.net/v0";

export async function loadCommunities(communities: string[]): Promise<ICommunity[]> {
    const { data } = await axios.get(`${BASE_URL}/load?names=${communities.join(',')}`);
    // TODO: the API returns array of sessions, which will need to be split into the different types
    return data;
}

export async function joinCommunity(community: string, name: string, email: string): Promise<IMember[]> {
    const { data } = await axios.post(`${BASE_URL}/join`, createCommunityRequest(community, name, email));
    return data;
}

export async function leaveCommunity(community: string, name: string, email: string) {
    return await axios.post(`${BASE_URL}/leave`, createCommunityRequest(community, name, email));
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