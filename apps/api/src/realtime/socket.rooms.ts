export const MARKET_ROOM = "market";
export const ADMIN_ROOM = "admin";

export function getUserRoom(userId: string) {
  return `user:${userId}`;
}

export function getTokenRoom(token: string) {
  return `token:${token}`;
}
