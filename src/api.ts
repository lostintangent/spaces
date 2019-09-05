import axios from "axios";
import { auth } from "./auth/auth";
import { config } from "./config";
import { ICommunity } from "./store/model";

const BASE_URL = `${config.serviceUri}/v0`;

const getAuthHeader = async () => {
  const t1 = Date.now();
  const tokens = await auth.API.getTokensOrAskToSignIn();
  const t2 = Date.now();

  console.log(`** Get tokens time: ${t2 - t1}ms`);

  if (tokens.length === 0) {
    throw new Error("Please authenticate and try again.");
  }

  const [token] = tokens;

  const headers = {
    Authorization: `Bearer ${token.accessToken}`
  };

  return headers;
};

const postAsync = async (route: string, payload: any) => {
  const authHeader = await getAuthHeader();
  return await axios.post(route, payload, {
    headers: { ...authHeader }
  });
};

const getAsync = async (route: string) => {
  const authHeader = await getAuthHeader();
  return await axios.get(route, {
    headers: { ...authHeader }
  });
};

const deleteAsync = async (route: string) => {
  const authHeader = await getAuthHeader();
  return await axios.delete(route, {
    headers: { ...authHeader }
  });
};

export async function loadCommunities(
  communities: string[]
): Promise<ICommunity[]> {
  const urlEncodedNames = communities.map(name => encodeURIComponent(name));
  const { data } = await getAsync(
    `${BASE_URL}/load?names=${urlEncodedNames.join(",")}`
  );
  return data;
}

export async function joinCommunity(
  community: string,
  name: string,
  email: string,
  key?: string
): Promise<any> {
  try {
    const { data, status } = await postAsync(
      `${BASE_URL}/join`,
      createCommunityRequestBody(community, name, email, key)
    );

    const { members, sessions } = data;
    return { members, sessions };
  } catch (e) {
    throw e;
  }
}

export async function leaveCommunity(
  community: string,
  name: string,
  email: string
) {
  return await postAsync(
    `${BASE_URL}/leave`,
    createCommunityRequestBody(community, name, email)
  );
}

function communityEndpoint(name: string, endpoint: string) {
  return `${BASE_URL}/community/${encodeURIComponent(name)}/${endpoint}`;
}

export async function createSession(community: string, session: any) {
  return await postAsync(communityEndpoint(community, "session"), session);
}

export async function deleteSession(community: string, sessionId: string) {
  return await deleteAsync(
    communityEndpoint(community, `session/${sessionId}`)
  );
}

export async function getMessages(community: string) {
  const { data } = await getAsync(communityEndpoint(community, "messages"));
  return data;
}

export async function getTopCommunities() {
  const { data } = await getAsync(`${BASE_URL}/top_communities`);
  return data;
}

export async function clearMessages(community: string) {
  return await deleteAsync(communityEndpoint(community, "messages"));
}

export async function sayThanks(community: string, from: string, to: string[]) {
  return await postAsync(communityEndpoint(community, "thanks"), {
    from,
    to
  });
}

export async function makePrivate(community: string, key: string) {
  return await postAsync(communityEndpoint(community, "private"), { key });
}

export async function makePublic(community: string) {
  return await postAsync(communityEndpoint(community, "public"), {});
}

function createCommunityRequestBody(
  communityName: string,
  memberName: string,
  memberEmail: string,
  key?: string
) {
  return {
    name: communityName,
    member: {
      name: memberName,
      email: memberEmail
    },
    key
  };
}
