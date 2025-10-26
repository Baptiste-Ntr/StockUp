import { queryOptions } from "@tanstack/react-query";
import { api } from "./api";

export const authQuery = queryOptions({
    queryKey: ['auth', 'me'],
    queryFn: () => api.auth.me(),
    retry: false,
    staleTime: 5 * 60 * 1000,
})

export const userClubQuery = queryOptions({
  queryKey: ["userClub"],
  queryFn: () => api.clubs.userClub(),
  staleTime: 10 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});

export const clubsQuery = queryOptions({
    queryKey: ['clubs'],
    queryFn: () => api.clubs.getAll(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
})

export const clubQuery = (clubId: string) => queryOptions({
    queryKey: ['club', clubId],
    queryFn: () => api.clubs.getById(clubId),
    enabled: !!clubId,
    staleTime: 10 * 60 * 1000
})