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
import { ProductsService } from './products.service';
import type { CreateArticleDto, UpdateArticleDto } from 'types';

@Controller('articles')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('category/:categoryId')
  async getAll(@Param('categoryId') categoryId: string) {
    return this.productsService.getAll(categoryId);
  }

  @Get(':id/category/:categoryId')
  async getById(@Param('id') id: string, @Param('categoryId') categoryId: string) {
    return this.productsService.getById(id, categoryId);
  }

  @Post()
  async create(@Body() dto: CreateArticleDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.productsService.update(dto, id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
