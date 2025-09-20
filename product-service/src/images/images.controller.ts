import {
  Controller,
  Post,
  Put,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { ResponseImageDTO } from './dto/response-image.dto';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}
  //crear
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.imagesService.uploadImage(file);
  }
  //eliminar
  @Delete(':filename')
  deleteImage(@Param('filename') filename: string) {
    return this.imagesService.deleteImage(filename);
  }
  //remplazar
  @Put(':filename')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  updateImage(
    @Param('filename') filename: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseImageDTO | BadRequestException> {
    return this.imagesService.replaceImage(filename, file);
  }
}
