// src/services/dataService.js (or .ts)
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken'); // Assuming 'authToken' is where you store your JWT
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Existing functions (ensure they are correct)
export const fetchInstitutions = async () => {
    try {
        // Assuming /api/institutions/ is publicly accessible or handled by a global interceptor if you have one
        const response = await axios.get(`${API_BASE_URL}/api/institutions/`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error fetching institutions:', error);
        throw error;
    }
};

export const fetchInstitutionPrograms = async (institution_id) => {
    try {
        // Assuming this endpoint also requires authentication
        const response = await axios.get(`${API_BASE_URL}/api/institutions/${institution_id}/programs/`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error fetching programs for institution ${institution_id}:`, error);
        throw error;
    }
};

export const fetchAllProgramDetails = async () => {
    try {
        // If this is truly for "public" programs, it might not need auth.
        // But if it contains sensitive details or is protected, add headers.
        // Based on your previous context, let's add headers for safety.
        const response = await axios.get(`${API_BASE_URL}/all-program-details/`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error fetching all program details:', error);
        throw error;
    }
};

export const fetchPublicProgramDetails = async (pk) => {
    try {
        // This is explicitly named 'public' but if your backend setup requires auth, add headers.
        // Let's add them for consistency with authenticated user's session.
        const response = await axios.get(`${API_BASE_URL}/api/public/program-details/${pk}/`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error fetching public program details for PK ${pk}:`, error);
        throw error;
    }
};

export const fetchProgramRecommendations = async () => {
    try {
        // This is the correct endpoint for user-specific recommendations
        const response = await axios.get(`${API_BASE_URL}/api/programs/recommendations/for-user/`, { headers: getAuthHeaders() });

        return response.data;
    } catch (error) {
        console.error('Error fetching program recommendations for user:', error);
        throw error;
    }
};

// --- NEW SERVICE FUNCTIONS ---

export const fetchProgramsByInstitutionName = async (institution_name) => {
    try {
        // This specifically returned 401 Unauthorized, so headers are crucial here.
        const response = await axios.get(`${API_BASE_URL}/api/institution/${institution_name}/programs/`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error fetching programs by institution name "${institution_name}":`, error);
        throw error;
    }
};

export const fetchProgramStats = async (pk) => {
    try {
        // You already had headers here, which is good.
        const response = await axios.get(`${API_BASE_URL}/api/program-details/${pk}/stats/`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error fetching program stats for PK ${pk}:`, error);
        throw error;
    }
};

export const fetchPlatformStats = async () => {
    try {
        // Your note says AllowAny, but adding headers is harmless if not needed and consistent.
        // If it truly is always public and requires no auth, you can remove headers.
        const response = await axios.get(`${API_BASE_URL}/enrollment/stats/`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error fetching platform stats:', error);
        throw error;
    }
};

export const fetchUserApplications = async () => {
    try {
        // !!! CRITICAL FIX: Add '/api/' prefix here based on your backend logs (404 was for without /api/)
        const response = await axios.get(`${API_BASE_URL}/api/applications/my_applications/`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error fetching user applications:', error);
        throw error;
    }
};

export const fetchUserActivities = async () => {
    try {
        // Assuming this also needs authentication.
        const response = await axios.get(`${API_BASE_URL}/api/applications/my_activities/`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error fetching user activities:', error);
        throw error;
    }
};

export const checkUserApplication = async (program_id) => {
    try {
        // Assuming this needs authentication.
        const response = await axios.get(`${API_BASE_URL}/api/application/check/?program_id=${program_id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error checking user application for program ${program_id}:`, error);
        throw error;
    }
};