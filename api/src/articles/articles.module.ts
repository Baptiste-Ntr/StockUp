import { Module } from '@nestjs/common';
import { ArticlesController } from "./articles.controller";
import { ArticlesService } from "./articles.service";
import { UploadcareModule } from '../uploadcare/uploadcare.module';

@Module({
  imports: [UploadcareModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ProductsModule {}
