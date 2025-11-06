import { Module } from '@nestjs/common';
import { UploadcareService } from './uploadcare.service';

@Module({
  providers: [UploadcareService],
  exports: [UploadcareService],
})
export class UploadcareModule {}

