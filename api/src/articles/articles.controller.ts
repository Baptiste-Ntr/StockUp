import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  NotFoundException 
} from '@nestjs/common';
import { ArticlesService } from "./articles.service";
import type { CreateArticleDto, UpdateArticleDto } from 'types';

@Controller("articles")
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get("category/:categoryId")
  async getAll(@Param("categoryId") categoryId: string) {
    return this.articlesService.getAllByCategory(categoryId);
  }

  @Get("club/:clubId")
  async getAllByClub(@Param("clubId") clubId: string) {
    return this.articlesService.getAllByClub(clubId);
  }

  @Get(":id/category/:categoryId")
  async getById(
    @Param("id") id: string,
    @Param("categoryId") categoryId: string
  ) {
    return this.articlesService.getById(id, categoryId);
  }

  @Post()
  async create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(dto, id);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.articlesService.delete(id);
  }
}
