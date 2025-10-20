import { Article } from "./Article";
import { Club } from "./Club";

export interface Category {
  id: string;
  name: string;
  description: string;
  club: Club;
  clubId: string;
  articles: Article[];
  createdAt: Date;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  clubId: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}
