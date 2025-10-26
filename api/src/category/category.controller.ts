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
import { CategoryService } from './category.service';
import type { CreateCategoryDto, UpdateCategoryDto } from 'types';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('club/:clubId')
  async getAll(@Param('clubId') clubId: string) {
    return this.categoryService.getAll(clubId);
  }

  @Get(':id/club/:clubId')
  async getById(@Param('id') id: string, @Param('clubId') clubId: string) {
    return this.categoryService.getById(id, clubId);
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(dto, id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
