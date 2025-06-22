// src/services/userService.js
// import axios from 'axios';

// src/services/userService.js (or .ts)
import axios from 'axios';
const backendApi = import.meta.env.VITE_BACKEND_URL

export const getUserProfile = async () => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No auth token found for getUserProfile.');
            // Return an empty object or throw an error that can be handled
            return { error: 'No authentication token.' };
        }

        console.log('Attempting to fetch user profile with token...');
        const response = await axios.get('/auth/profile-completion/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('User Profile API Response:', response.data);
        return response.data; // Ensure this returns the actual data object
    } catch (error) {
        console.error('Error fetching user profile in userService:', error.response ? error.response.data : error.message);
        // Crucial: Return an error object or a specific message that Gemini can handle
        return { error: 'Failed to fetch user profile data from API.' };
    }
};

/* Duplicate getEnrollerInstitution removed to avoid redeclaration error. */



function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const getEnrollerInstitution = async (institutionId) => {
  if (!institutionId) {
    return null;
  }
  try {
    const response = await axios.get(`${backendApi}/api/institution/${institutionId}/`, {
      headers: getAuthHeaders(),
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching institution ${institutionId}:`, error);
    throw error;
  }
};

export const getUserSettings = async () => {
  try {
    const response = await axios.get(`${backendApi}/auth/users/user-settings/`, {
      headers: getAuthHeaders(),
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

export const updateUserSettings = async (settingsData) => {
  try {
    const response = await axios.put(`${backendApi}/auth/users/user-settings/`, settingsData, {
      headers: getAuthHeaders(),
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

export const getProgramsForSettings = async () => {
  try {
    const response = await axios.get(`${backendApi}/auth/users/programs-list/`, { 
      headers: getAuthHeaders(),
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching programs for settings:', error);
    throw error;
  }
};

export const getReviewersList = async () => {
  const response = await axios.get(`${backendApi}/auth/users/reviewers-list/`, {
    headers: getAuthHeaders(),
    timeout: 5000
  });
  return response.data;
};