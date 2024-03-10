import axios from "axios";

// Create an axios instance and set the base url from environment variables
export const axiosAgent = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});
