// src/services/userService.js
// import axios from 'axios';

// src/services/userService.js (or .ts)
import axios from 'axios';

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



// // Replace with your actual base URL from your environment variables or config
// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// export const getUserProfile = async () => {
//   try {
//     const token = localStorage.getItem('access_token'); // Or wherever your token is stored

//     const response = await axios.get(`${API_BASE_URL}/auth/profile/`, {
//       headers: {
//         'Authorization': `Bearer ${token}` 
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching user profile:', error.response?.data || error.message);
//     throw error; 
//   }
// };
