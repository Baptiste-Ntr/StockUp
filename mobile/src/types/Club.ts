export interface Club {
  id: string;
  name: string;
  inviteCode: string;
  sellers: Seller[];
  categories: Category[];
  createdAt: Date;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  club: Club;
  clubId: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  club: Club;
  clubId: string;
  articles: Article[];
  createdAt: Date;
}

export interface Article {
  id: string;
  name: string;
  description: string;
  category: Category;
  categoryId: string;
  createdAt: Date;
}

export interface CreateClubDto {
  name: string;
  inviteCode: string;
}

export interface UpdateClubDto {
  name?: string;
  inviteCode?: string;
}

export interface CreateSellerDto {
  name: string;
  email: string;
  clubId: string;
}

export interface UpdateSellerDto {
  name?: string;
  email?: string;
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

export interface CreateArticleDto {
  name: string;
  description: string;
  categoryId: string;
}

export interface UpdateArticleDto {
  name?: string;
  description?: string;
}