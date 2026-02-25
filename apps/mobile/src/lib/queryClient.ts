import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { useErrorToastStore } from '@/stores/errorToastStore/errorToastStore';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const key = JSON.stringify(query.queryKey);
      useErrorToastStore
        .getState()
        .addToast(`Query failed [${key}]: ${error.message}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      useErrorToastStore
        .getState()
        .addToast(`Mutation failed: ${error.message}`);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
