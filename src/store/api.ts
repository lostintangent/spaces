import axios from "axios";
import { ICommunity, IMember } from "./model";

const BASE_URL = "http://vslscommunitieswebapp.azurewebsites.net/"

export async function loadCommunities(communities: string[]): Promise<ICommunity[]> {
    const { data } = await axios.get(`${BASE_URL}/v0/load?names=${communities.join(',')}`);
    return data;
}

export async function joinCommunity(community: string, name: string, email: string): Promise<IMember[]> {
    const { data } = await axios.post(`${BASE_URL}/v0/join`, {name: community, member: {name, email}});
    return data;
}

export async function leaveCommunity(community: string, name: string, email: string) {
    return await axios.post(`${BASE_URL}/v0/leave`, {name: community, member: {name, email}})
}
