import { fetchAuthSession } from "@aws-amplify/auth";

export async function getAuthToken() {
    try {
        const session = await fetchAuthSession();
        const jwt = session.tokens?.accessToken?.toString();
        if (jwt) {
            console.log("Access Token obtained successfully");
            return jwt;
        } else {
            console.warn("No access token found in session");
            return null;
        }
    } catch (error) {
        console.error("Error fetching auth session:", error);
        return null;
    }
}