import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/lib/api-types";

import type { Wallet } from "./types";

export async function getMyWallet(token: string): Promise<Wallet> {
  const response = await apiClient.get<ApiSuccessResponse<Wallet>>(
    "/api/wallet/me",
    {
      token,
    },
  );

  return response.data;
}
