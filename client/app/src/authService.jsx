const API_URL = 'http://localhost:8080/portfolio/token/';

const ACCESS_TOKEN_KEY = 'access_token';

// Helper to get access token
export const getAccessToken = () => localStorage.getItem('access_token');

// Check if token is expired (optional, if `exp` claim is included)
const isTokenExpired = (token) => {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
};

// Function to handle refreshing access token
export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        console.warn('No refresh token available');
        return false;
    }

    const response = await fetch(`${API_URL}refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        console.log('Access token refreshed');
        return true;
    } else {
        console.error('Failed to refresh access token');
        logout();  // Clear tokens if refresh fails
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

    let response = await fetch(url, options);

    // Retry once if unauthorized
    if (response.status === 401) {
        console.log('401 Unauthorized, trying to refresh token');
        const refreshSuccessful = await refreshAccessToken();
        if (refreshSuccessful) {
            options.headers['Authorization'] = `Bearer ${getAccessToken()}`;
            response = await fetch(url, options);
        } else {
            console.error('Token refresh failed, unable to fetch resource');
            throw new Error('Unauthorized: Token refresh failed');
        }
    }

    return response;
};

// Login function to obtain tokens and user role
export const login = async (username, password) => {
  const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
  });

    if (!response.ok) {
        throw new Error('Invalid credentials');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    // Assuming the response contains the user's role; adjust if needed
    const role = data.role || 'member'; // default to 'user' if role is not in response
    localStorage.setItem('user_role', role); // store role in local storage

    console.log('User logged in and tokens stored');
    return role;
};

// Logout function to clear tokens
export const logout = () => {
    console.log('Logging out and clearing tokens');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role'); // Clear the role on logout
};

// Utility function to check if the user is authenticated
export const isAuthenticated = () => {
    const accessToken = getAccessToken();
    return accessToken && !isTokenExpired(accessToken);
};

// Function to get user role from local storage
export const getUserRole = () => {
    return localStorage.getItem('user_role') || null; // Retrieve the user role if available
};
