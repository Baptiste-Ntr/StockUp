import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from 'types';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllByCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException("Catégorie non trouvée");
    }

    return this.prisma.article.findMany({
      where: { categoryId: categoryId },
    });
  }

  async getAllByClub(clubId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId }
    });

    if (!club) {
      throw new NotFoundException("Club non trouvé");
    }

    return this.prisma.article.findMany({
      where: { clubId: clubId },
      include: {
        category: true
      }
    });
  }

  async getById(id: string, categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException("Catégorie non trouvée");
    }

    return this.prisma.article.findUnique({
      where: { id: id, categoryId: categoryId },
    });
  }

  async create(dto: CreateArticleDto) {
    const club = await this.prisma.club.findUnique({
      where: { id: dto.clubId },
    });

    if (!club) {
      throw new NotFoundException("Club non trouvé");
    }

    // Vérifier la catégorie si elle est fournie
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException("Catégorie non trouvée");
      }
    }

    return this.prisma.article.create({
      data: dto,
    });
  }

  async update(dto: UpdateArticleDto, id: string) {
    return this.prisma.article.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    return this.prisma.article.delete({
      where: { id },
    });
  }
}
