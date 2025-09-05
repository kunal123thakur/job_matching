// Configure the base API URL - adjust this to match your backend URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// Create a custom fetch wrapper to handle API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Accept': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Internship API calls
export const internshipApi = {
  // Get all internships
  getInternships: async () => {
    return await apiCall('/internships/');
  },

  // Create new internship
  createInternship: async (internshipData: {
    internship_title: string;
    company_name: string;
    location: string;
    is_remote: boolean;
    stipend_min: number;
    stipend_max: number;
    duration_months: number;
  }) => {
    return await apiCall('/internships/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(internshipData),
    });
  },
};

// Candidate API calls
export const candidateApi = {
  // Create candidate profile with file uploads
  createCandidate: async (candidateData: {
    name: string;
    email: string;
    father_income: number;
    preferred_location: string;
    resume: File;
    income_certificate: File;
  }) => {
    const formData = new FormData();
    formData.append('name', candidateData.name);
    formData.append('email', candidateData.email);
    formData.append('father_income', candidateData.father_income.toString());
    formData.append('preferred_location', candidateData.preferred_location);
    formData.append('resume', candidateData.resume);
    formData.append('income_certificate', candidateData.income_certificate);

    return await apiCall('/candidates/', {
      method: 'POST',
      body: formData,
    });
  },
};

// Search API calls
export const searchApi = {
  // Search internships based on skills
  searchInternships: async (skills: string[], limit: number = 5) => {
    return await apiCall('/search/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skills }),
    });
  },
};

export default { internshipApi, candidateApi, searchApi };