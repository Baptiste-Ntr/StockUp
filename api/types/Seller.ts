import { Club } from "./Club";

export interface Seller {
  id: string;
  name: string;
  email: string;
  club: Club;
  clubId: string;
  createdAt: Date;
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
