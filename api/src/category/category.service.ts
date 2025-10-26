import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from 'types';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) {}

    async getAll(id: string) {

        const club = this.prisma.club.findUnique({
            where: {id}
        })

        if(!club) {
            throw new NotFoundException("Club non trouvé");
        }

        return this.prisma.category.findMany({
            where: {clubId: id}
        })
    }

    async getById(id: string, clubId: string) {
        const club = this.prisma.club.findUnique({
          where: { id },
        });

        if (!club) {
          throw new NotFoundException("Club non trouvé");
        }

        return this.prisma.category.findUnique({
            where: {id: id, clubId: clubId}
        })
    }

    async create(dto: CreateCategoryDto) {
        const club = this.prisma.club.findUnique({
        where: { id: dto.clubId },
        });

        if (!club) {
        throw new NotFoundException("Club non trouvé");
        }

        return this.prisma.category.create({
            data: dto
        })
    }

    async update(dto: UpdateCategoryDto, id:string) {
        return this.prisma.category.update({
            where: {id},
            data: dto
        })
    }

    async delete(id: string) {
        return this.prisma.category.delete({
            where: {id},
        }) 
    }
}
