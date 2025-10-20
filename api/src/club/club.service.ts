import { Injectable } from '@nestjs/common';
import { CreateClubDto, UpdateClubDto } from 'types/Club';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClubService {

    constructor(private prisma: PrismaService) {}

    async createClub(dto: CreateClubDto) {
        return await this.prisma.club.create({
            data: {
                name: dto.name,
                inviteCode: dto.inviteCode
            }
        })
    }

    async getClubs() {
        return await this.prisma.club.findMany({})
    }

    async getClub(id: string) {
        return await this.prisma.club.findUniqueOrThrow({
            where: { id }
        })
    }

    async updateClub(id: string, dto: UpdateClubDto) {
        return await this.prisma.club.update({
            where: {id},
            data: dto
        })
    }

    async deleteClub(id: string) {
        return await this.prisma.club.delete({
            where: {id}
        })
    }
}
