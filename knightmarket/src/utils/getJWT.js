import { fetchAuthSession } from 'aws-amplify/auth';

export async function getJwt() {
  try {
    const session = await fetchAuthSession();
    const jwtToken = session.tokens?.accessToken?.toString();

    if (jwtToken) {
      console.log("Access Token obtained successfully");
      return jwtToken;
    } else {
      console.warn("No access token found in session");
      return null;
    }
  } catch (error) {
    console.error("Error fetching auth session:", error);
    return null;
  }
}

export async function getAuthHeaders() {
  const token = await getJwt();
  if (!token) {
    throw new Error('No authentication token available');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}