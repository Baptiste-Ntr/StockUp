import { Category } from "./Category";
import { Seller } from "./Seller";

export interface Club {
  id: string;
  name: string;
  inviteCode: string;
  sellers: Seller[];
  categories: Category[];
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