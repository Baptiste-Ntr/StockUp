import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClubModule } from './club/club.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [AuthModule, ClubModule, PrismaModule, ProductsModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
