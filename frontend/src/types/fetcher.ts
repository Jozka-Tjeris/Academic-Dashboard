// Define a type for our secure fetcher to keep TS happy
export type Fetcher = (url: string, options?: RequestInit) => Promise<Response>;
