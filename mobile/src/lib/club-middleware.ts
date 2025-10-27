
import { redirect } from "@tanstack/react-router";
import { userClubQuery } from "./queries";
import type { QueryClient } from "@tanstack/react-query";

export async function requireClub(queryClient: QueryClient) {
  // Vérifier que l'utilisateur est authentifié via les cookies
  try {
    const userClub = await queryClient.ensureQueryData(userClubQuery);
    return userClub;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Cookie invalide ou expiré
    throw redirect({ to: "/clubs/new" });
  }
}


