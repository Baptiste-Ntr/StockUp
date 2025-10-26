import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from 'types';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) {}

    async getAll(categoryId: string) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId }
        });

        if (!category) {
            throw new NotFoundException("Catégorie non trouvée");
        }

        return this.prisma.article.findMany({
            where: { categoryId: categoryId }
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
            where: { id: id, categoryId: categoryId }
        });
    }

    async create(dto: CreateArticleDto) {
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
        });

        if (!category) {
            throw new NotFoundException("Catégorie non trouvée");
        }

        return this.prisma.article.create({
            data: dto
        });
    }

    async update(dto: UpdateArticleDto, id: string) {
        return this.prisma.article.update({
            where: { id },
            data: dto
        });
    }

    async delete(id: string) {
        return this.prisma.article.delete({
            where: { id },
        });
    }
}
