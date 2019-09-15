import axios from "axios";
import { auth } from "./auth/auth";
import { config } from "./config";
import { ISpace } from "./store/model";

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

export async function loadSpaces(spaces: string[]): Promise<ISpace[]> {
  const urlEncodedNames = spaces.map(name => encodeURIComponent(name));
  const { data } = await getAsync(
    `${BASE_URL}/load?names=${urlEncodedNames.join(",")}`
  );
  return data;
}

export async function joinSpace(
  space: string,
  name: string,
  email: string,
  key?: string
): Promise<any> {
  try {
    const { data, status } = await postAsync(
      `${BASE_URL}/join`,
      createSpaceRequestBody(space, name, email, key)
    );

    const { members, sessions } = data;
    return { members, sessions };
  } catch (e) {
    throw e;
  }
}

export async function leaveSpace(space: string, name: string, email: string) {
  return await postAsync(
    `${BASE_URL}/leave`,
    createSpaceRequestBody(space, name, email)
  );
}

function spaceEndpoint(name: string, endpoint: string) {
  return `${BASE_URL}/space/${encodeURIComponent(name)}/${endpoint}`;
}

export async function createSession(space: string, session: any) {
  return await postAsync(spaceEndpoint(space, "session"), session);
}

export async function deleteSession(space: string, sessionId: string) {
  return await deleteAsync(spaceEndpoint(space, `session/${sessionId}`));
}

export async function getMessages(space: string) {
  const { data } = await getAsync(spaceEndpoint(space, "messages"));
  return data;
}

export async function getTopSpaces() {
  const { data } = await getAsync(`${BASE_URL}/top_spaces`);
  return data;
}

export async function clearMessages(space: string) {
  return await deleteAsync(spaceEndpoint(space, "messages"));
}

export async function sayThanks(space: string, from: string, to: string[]) {
  return await postAsync(spaceEndpoint(space, "thanks"), {
    from,
    to
  });
}

export async function makePrivate(space: string, key: string) {
  return await postAsync(spaceEndpoint(space, "private"), { key });
}

export async function makePublic(space: string) {
  return await postAsync(spaceEndpoint(space, "public"), {});
}

export async function updateReadme(space: string, readme: string) {
  return await postAsync(spaceEndpoint(space, "readme"), { readme });
}

function createSpaceRequestBody(
  spaceName: string,
  memberName: string,
  memberEmail: string,
  key?: string
) {
  return {
    name: spaceName,
    member: {
      name: memberName,
      email: memberEmail
    },
    key
  };
}
