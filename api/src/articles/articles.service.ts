import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from 'types';
import { UploadcareService } from '../uploadcare/uploadcare.service';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadcareService: UploadcareService,
  ) {}

  async getAllByCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException("Catégorie non trouvée");
    }

    return this.prisma.article.findMany({
      where: { categoryId: categoryId },
      orderBy: { createdAt: 'asc' },
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
      },
      orderBy: { createdAt: 'asc' }
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
    // Récupérer l'article actuel pour obtenir l'ancienne image
    const currentArticle = await this.prisma.article.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    // Mettre à jour l'article
    const updatedArticle = await this.prisma.article.update({
      where: { id },
      data: dto,
    });

    // Si l'image a changé, supprimer l'ancienne
    if (
      currentArticle?.imageUrl &&
      dto.imageUrl !== undefined &&
      currentArticle.imageUrl !== dto.imageUrl
    ) {
      // Suppression asynchrone sans bloquer la réponse
      this.uploadcareService.deleteImage(currentArticle.imageUrl).catch(err => {
        console.error('Failed to delete old image:', err);
      });
    }

    return updatedArticle;
  }

  async delete(id: string) {
    // Récupérer l'article pour obtenir l'URL de l'image
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    // Supprimer l'article de la base de données
    const deletedArticle = await this.prisma.article.delete({
      where: { id },
    });

    // Supprimer l'image sur Uploadcare si elle existe
    if (article?.imageUrl) {
      // Suppression asynchrone sans bloquer la réponse
      this.uploadcareService.deleteImage(article.imageUrl).catch(err => {
        console.error('Failed to delete image:', err);
      });
    }

    return deletedArticle;
  }
}
