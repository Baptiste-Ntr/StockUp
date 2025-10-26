import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { ClubService } from './club.service';
import type { CreateClubDto, UpdateClubDto } from 'types/Club';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clubs')
@UseGuards(JwtAuthGuard)
export class ClubController {
    constructor(private club: ClubService) {}

    @Get()
    async getClubs(@Request() req) {
        return this.club.getClubs(req.user.userId)
    }

    @Get('user')
    async getClubByUserId(@Request() req) {
        return this.club.getClubByUserId(req.user.userId)
    }

    @Get(':id')
    async getClub(@Param("id") id: string, @Request() req) {
        return this.club.getClub(id, req.user.userId)
    }

    @Post()
    async createClub(@Body() createDto: CreateClubDto, @Request() req) {
        return this.club.createClub(createDto, req.user.userId)
    }

    @Put(':id')
    async updateClub(@Param('id') id: string, @Body() updateDto: UpdateClubDto, @Request() req) {
        return this.club.updateClub(id, updateDto, req.user.userId)
    }

    @Delete(':id')
    async deleteClub(@Param('id') id: string, @Request() req) {
        return this.club.deleteClub(id, req.user.userId)
    }

}
