import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateClubDto, UpdateClubDto } from 'types/Club';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClubService {

    constructor(private prisma: PrismaService) {}

    async createClub(dto: CreateClubDto, userId: string) {
        return await this.prisma.club.create({
            data: {
                name: dto.name,
                inviteCode: dto.inviteCode,
                ownerId: userId
            }
        })
    }

    async getClubs(userId: string) {
        return await this.prisma.club.findMany({
            where: {
                ownerId: userId
            }
        })
    }

    async getClub(id: string, userId: string) {
        const club = await this.prisma.club.findUnique({
            where: { id }
        })

        if (!club) {
            throw new NotFoundException('Club non trouvé')
        }

        if (club.ownerId !== userId) {
            throw new ForbiddenException('Vous n\'avez pas accès à ce club')
        }

        return club
    }

    async getClubByUserId(id: string) {
        return await this.prisma.club.findFirst({
            where: {
                OR: [
                    { ownerId: id },
                    { sellers: { some: { id: id } } }
                ]
            }
        })
    }

    async updateClub(id: string, dto: UpdateClubDto, userId: string) {
        const club = await this.prisma.club.findUnique({
            where: { id }
        })

        if (!club) {
            throw new NotFoundException('Club non trouvé')
        }

        if (club.ownerId !== userId) {
            throw new ForbiddenException('Vous n\'avez pas accès à ce club')
        }

        return await this.prisma.club.update({
            where: {id},
            data: dto
        })
    }

    async deleteClub(id: string, userId: string) {
        const club = await this.prisma.club.findUnique({
            where: { id }
        })

        if (!club) {
            throw new NotFoundException('Club non trouvé')
        }

        if (club.ownerId !== userId) {
            throw new ForbiddenException('Vous n\'avez pas accès à ce club')
        }

        return await this.prisma.club.delete({
            where: {id}
        })
    }
}
