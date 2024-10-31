const API_URL = 'http://localhost:8080/portfolio/token/'; // Base URL for token endpoints

// Function to get the CSRF token from cookies (if needed)
const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

// Login function to obtain access and refresh tokens
export const login = async (username, password) => {
    const csrftoken = getCookie('csrftoken');

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid credentials');
        } else {
            throw new Error('An error occurred. Please try again.');
        }
    }

    const data = await response.json();
    // Store tokens in local storage
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data;
};

// Refresh access token using the refresh token
export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_URL}refresh/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
        throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access); // Store the new access token
};

// Logout function to clear tokens
export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

// Utility function to check if a token is valid
export const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    // Additional logic to verify if the token is expired could be added here
    return token !== null;
};

// Fetch request with the JWT access token
export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`, // Attach access token
    };

    const response = await fetch(url, { ...options, headers });

    // If token is expired, attempt to refresh
    if (response.status === 401) {
        try {
            await refreshAccessToken();
            // Retry the request after refreshing token
            const newToken = localStorage.getItem('access_token');
            headers['Authorization'] = `Bearer ${newToken}`;
            return await fetch(url, { ...options, headers });
        } catch (error) {
            // If refreshing fails, log out
            logout();
            throw new Error('Session expired. Please log in again.');
        }
    }

    return response;
};
