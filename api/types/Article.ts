import { Category } from "./Category";

export interface Article {
  id: string;
  name: string;
  description: string;
  category: Category;
  categoryId: string;
  createdAt: Date;
}

export interface CreateArticleDto {
  name: string;
  description: string;
  categoryId: string;
}

export interface UpdateArticleDto {
  name?: string;
  description?: string;
}
