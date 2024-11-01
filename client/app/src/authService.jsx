const API_URL = 'http://localhost:8080/portfolio/token/';
const ACCESS_TOKEN_KEY = 'access_token';

// Unique log identifiers for easier debugging
const logContext = (functionName) => `[AuthService: ${functionName}]`;

// Helper to get access token
export const getAccessToken = () => {
    console.log(`${logContext("getAccessToken")} Retrieving access token from localStorage`);
    return localStorage.getItem('access_token');
};

// Check if token is expired
const isTokenExpired = (token) => {
    console.log(`${logContext("isTokenExpired")} Checking if token is expired`);
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        console.log(`${logContext("isTokenExpired")} Token expired: ${isExpired}`);
        return isExpired;
    } catch (error) {
        console.error(`${logContext("isTokenExpired")} Token parsing error:`, error);
        return true;
    }
};

// Function to handle refreshing access token
export const refreshAccessToken = async () => {
    console.log(`${logContext("refreshAccessToken")} Attempting to refresh access token`);
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        console.warn(`${logContext("refreshAccessToken")} No refresh token available`);
        return false;
    }

    try {
        const response = await fetch(`${API_URL}refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            console.log(`${logContext("refreshAccessToken")} Access token refreshed successfully`);
            return true;
        } else {
            console.error(`${logContext("refreshAccessToken")} Failed to refresh access token`);
            logout();
            return false;
        }
    } catch (error) {
        console.error(`${logContext("refreshAccessToken")} Network or server error during token refresh:`, error);
        logout();
        return false;
    }
};

// Fetch wrapper to add Authorization header and handle token refresh
export const fetchWithAuth = async (url, options = {}) => {
    let accessToken = getAccessToken();
    
    // Pre-check if token is expired
    if (isTokenExpired(accessToken)) {
      console.log('Access token expired, attempting to refresh');
      const refreshSuccessful = await refreshAccessToken();
      if (!refreshSuccessful) {
        throw new Error('Unauthorized: Access token expired and refresh failed');
      }
      accessToken = getAccessToken(); // Update with new token after refresh
    }
  
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };
  
    try {
      const response = await fetch(url, options);
  
      // Check for 404 specifically for profile images
      if (response.status === 404) {
        console.warn(`[AuthService: fetchWithAuth] 404 Not Found for URL: ${url}`);
        return { ok: false, status: 404 }; // Return a controlled response
      }
  
      if (!response.ok) {
        throw new Error(`Failed request with status ${response.status}: ${response.statusText}`);
      }
  
      return response;
    } catch (error) {
      console.error('[AuthService: fetchWithAuth] Error during fetch:', error);
      throw error;
    }
  };
  

// Login function to obtain tokens and user role
export const login = async (username, password) => {
    console.log(`${logContext("login")} Attempting login with username: ${username}`);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`${logContext("login")} Login failed: ${errorData.message || 'Invalid credentials'}`);
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        const role = data.role || 'member'; 
        localStorage.setItem('user_role', role); 

        console.log(`${logContext("login")} User logged in with role: ${role}`);
        return role;
    } catch (error) {
        console.error(`${logContext("login")} Login error:`, error);
        throw error;
    }
};

// Logout function to clear tokens
export const logout = () => {
    console.log(`${logContext("logout")} Logging out and clearing tokens`);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
};

// Utility function to check if the user is authenticated
export const isAuthenticated = () => {
    console.log(`${logContext("isAuthenticated")} Checking authentication status`);
    const accessToken = getAccessToken();
    const authenticated = accessToken && !isTokenExpired(accessToken);
    console.log(`${logContext("isAuthenticated")} Authenticated: ${authenticated}`);
    return authenticated;
};

// Function to get user role from local storage
export const getUserRole = () => {
    const role = localStorage.getItem('user_role') || null;
    console.log(`${logContext("getUserRole")} Retrieved user role: ${role}`);
    return role;
};
