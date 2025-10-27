import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

type MutationConfig<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKeys?: string[][];
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables) => void;
} & Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn' | 'onSuccess' | 'onError' | 'onMutate'>;

/**
 * Hook personnalisé pour gérer les mutations avec invalidation automatique des queries
 * et gestion des toasts
 */
export function useMutationWithInvalidation<TData, TVariables>({
  mutationFn,
  invalidateKeys = [],
  successMessage,
  errorMessage = "Une erreur s'est produite",
  loadingMessage,
  onSuccess,
  onError,
  ...options
}: MutationConfig<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    
    onMutate: async () => {
      if (loadingMessage) {
        toast.loading(loadingMessage);
      }
    },

    onSuccess: async (data, variables, context) => {
      // Invalider les queries spécifiées
      if (invalidateKeys.length > 0) {
        await Promise.all(
          invalidateKeys.map((key) =>
            queryClient.invalidateQueries({ queryKey: key })
          )
        );
      } else {
        // Si aucune clé spécifiée, invalider toutes les queries
        await queryClient.invalidateQueries();
      }

      // Afficher le toast de succès
      toast.dismiss();
      if (successMessage) {
        toast.success(successMessage);
      }

      // Appeler le callback onSuccess personnalisé si fourni
      if (onSuccess) {
        await onSuccess(data, variables);
      }
    },

    onError: (error, variables, context) => {
      toast.dismiss();
      toast.error(errorMessage);

      console.error('❌ Erreur mutation:', error);

      // Appeler le callback onError personnalisé si fourni
      if (onError) {
        onError(error, variables);
      }
    },

    ...options,
  });
}

