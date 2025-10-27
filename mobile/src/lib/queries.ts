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

export const categoriesQuery = (clubId: string) => queryOptions({
    queryKey: ['categories', clubId],
    queryFn: () => api.categories.getAll(clubId),
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
})

export const categoryQuery = (categoryId: string, clubId: string) => queryOptions({
    queryKey: ['category', categoryId, clubId],
    queryFn: () => api.categories.getById(categoryId, clubId),
    enabled: !!categoryId && !!clubId,
    staleTime: 10 * 60 * 1000
})

export const articlesCategoryQuery = (categoryId: string) =>
  queryOptions({
    queryKey: ["articles", categoryId],
    queryFn: () => api.articles.getAllByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

export const articlesClubQuery = (clubId: string) => 
    queryOptions({
      queryKey: ["articles", clubId],
      queryFn: () => api.articles.getAllByClub(clubId),
      enabled: !!clubId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });

export const articleQuery = (articleId: string, categoryId: string) => queryOptions({
    queryKey: ['article', articleId, categoryId],
    queryFn: () => api.articles.getById(articleId, categoryId),
    enabled: !!articleId && !!categoryId,
    staleTime: 10 * 60 * 1000
})