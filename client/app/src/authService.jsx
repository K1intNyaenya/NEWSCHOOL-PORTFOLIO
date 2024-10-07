const API_URL = 'http://localhost:8080/portfolio/token/'; // Adjust the URL as necessary

// Function to get the CSRF token from cookies
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
  // Here you can add logic to verify the token expiration
  return token !== null;
};
