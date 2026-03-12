import { Fetcher } from "@/types/fetcher";
import { handleResponse } from "./handleResponse";

export const getAuth = (fetcher: Fetcher) => 
  fetcher("/api/auth/me").then(res => handleResponse<Response>(res));

export const logout = (fetcher: Fetcher) =>
  fetcher("/api/auth/logout", {
    method: "POST",
  }).then(res => handleResponse<void>(res));
