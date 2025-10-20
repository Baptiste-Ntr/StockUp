import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClubModule } from './club/club.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ClubModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
