import { apiFetch } from "@/lib/queryClient";

export function useApi() {
  const getCsrfToken = () => {
    if (typeof window === "undefined") return null;
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1];
  };

  const secureFetch = async (url: string, options: RequestInit = {}) => {
    const csrfToken = getCsrfToken();
    
    const headers = new Headers(options.headers || {});

    // Only attach CSRF for mutating methods
    const method = options.method?.toUpperCase() || 'GET';
    if (csrfToken && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      headers.set("X-CSRF-Token", csrfToken);
    }

    return apiFetch(url, {
      ...options,
      headers,
    });
  };

  return { secureFetch };
}
