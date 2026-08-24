import axios from "axios";

import { env } from "../env";

export const httpClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    Accept: "application/json",
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      window.dispatchEvent(new Event("iptv:session-expired"));
    }
    return Promise.reject(error);
  },
);
