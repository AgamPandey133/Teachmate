import axios from "axios";

export const axiosInstance = axios.create({
  // Replace with YOUR exact DuckDNS domain
  baseURL: import.meta.env.MODE === "development" ? "/api" : "https://agam-teachmate.duckdns.org/api",
  withCredentials: true,
});
