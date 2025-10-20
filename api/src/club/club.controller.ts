import { Body, Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';
import { ClubService } from './club.service';
import type { CreateClubDto, UpdateClubDto } from 'types/Club';

@Controller('club')
export class ClubController {
    constructor(private club: ClubService) {}

    @Get()
    async getClubs() {
        return this.club.getClubs()
    }

    @Get(':id')
    async getClub(@Param("id") id: string) {
        return this.club.getClub(id)
    }

    @Post()
    async createClub(@Body() createDto: CreateClubDto) {
        return this.club.createClub(createDto)
    }

    @Put(':id')
    async updateClub(@Param('id') id: string, @Body() updateDto: UpdateClubDto) {
        return this.club.updateClub(id, updateDto)
    }

    @Delete(':id')
    async deleteClub(@Param('id') id: string) {
        return this.club.deleteClub(id)
    }

}
