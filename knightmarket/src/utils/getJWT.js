import { Auth } from 'aws-amplify';

export async function getAuthToken() {
    try {
      const session = await Auth.currentSession();
      return session.getAccessToken().getJwtToken();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        try {
          await Auth.currentAuthenticatedUser();
          // Retry getting the session
          const newSession = await Auth.currentSession();
          return newSession.getAccessToken().getJwtToken();
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          throw new Error('Authentication required');
        }
      }
      throw error;
    }
  }