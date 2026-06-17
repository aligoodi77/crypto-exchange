export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}${path}`);
    if (!response.ok) throw new Error("Request failed");
    return response.json() as Promise<T>;
  },
};
