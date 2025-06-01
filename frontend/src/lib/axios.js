import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Add request interceptor to make sure JWT cookie is sent with every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Log the request URL for debugging
    console.log(`Making request to: ${config.url}`);
    
    // Ensure withCredentials is set for every request to send cookies
    config.withCredentials = true;
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);
