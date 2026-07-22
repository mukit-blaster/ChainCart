import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh-token rotation: on a single 401, try to refresh once, retry the
// original request, then queue any other 401s that arrived during the refresh.
let refreshing: Promise<string | null> | null = null;

const refreshOnce = async (): Promise<string | null> => {
  try {
    const { data } = await axios.post(
      `${baseURL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    useAuthStore.getState().setSession(data);
    return data.tokens.accessToken as string;
  } catch {
    useAuthStore.getState().clear();
    return null;
  }
};

api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
    const original = err.config as AxiosRequestConfig & { _retry?: boolean };
    if (
      err.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/")
    ) {
      original._retry = true;
      refreshing = refreshing ?? refreshOnce().finally(() => (refreshing = null));
      const fresh = await refreshing;
      if (fresh) {
        original.headers = { ...original.headers, Authorization: `Bearer ${fresh}` };
        return api.request(original);
      }
    }
    return Promise.reject(err);
  },
);
