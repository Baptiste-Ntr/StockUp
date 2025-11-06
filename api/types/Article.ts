import { Category } from "./Category";

export interface Article {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  stock?: number;
  category: Category;
  categoryId: string;
  createdAt: Date;
}

export interface CreateArticleDto {
  name: string;
  description: string;
  imageUrl?: string;
  categoryId?: string;
  stock?: number;
  price: number;
  clubId: string;
}

export interface UpdateArticleDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  stock?: number;
  price?: number;
}
