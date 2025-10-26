import { redirect } from '@tanstack/react-router';
import { authQuery } from './queries';
import type { QueryClient } from '@tanstack/react-query';

export async function requireAuth(queryClient: QueryClient) {
  // Vérifier que l'utilisateur est authentifié via les cookies
  try {
    const user = await queryClient.ensureQueryData(authQuery);
    return user;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Cookie invalide ou expiré
    throw redirect({ to: '/auth/login' });
  }
}

