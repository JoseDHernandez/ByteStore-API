import { BadRequestException, Injectable } from '@nestjs/common';
import { ResponseImageDTO } from './dto/response-image.dto';
import { join } from 'path';
import { promises as fs } from 'fs';
@Injectable()
export class ImagesService {
  //Subir imagen
  uploadImage(file: Express.Multer.File): ResponseImageDTO {
    //si no existe
    if (!file) throw new BadRequestException('Archivo no subido');
    //tamaño (30kb max)
    const maxSize = 30 * 1024;
    if (file.size > maxSize)
      throw new BadRequestException('Archivo superior a 30kb');
    //validar tipo
    if (file.mimetype !== 'image/webp')
      throw new BadRequestException(
        'Formato invalido, solo se permite el formato webp',
      );
    return {
      message: 'Imagen subida correctamente',
      filepath: `${process.env.API_URL || 'http://localhost:3000'}/products/images/${file.filename}`,
    };
  }
  //eliminar imagen
  async deleteImage(filename: string): Promise<ResponseImageDTO> {
    try {
      await fs.unlink(`./public/images/${filename}`);
      return { message: `La imagen ${filename} fue eliminada.` };
    } catch (error) {
      throw new BadRequestException(
        `No se pudo eliminar la imagen ${filename}`,
      );
    }
  }
  //remplazar
  async replaceImage(
    filename: string,
    file: Express.Multer.File,
  ): Promise<ResponseImageDTO> {
    try {
      //si no existe
      if (!file) throw new BadRequestException('Archivo no subido');
      //tamaño (30kb max)
      const maxSize = 30 * 1024;
      if (file.size > maxSize)
        throw new BadRequestException('Archivo superior a 30kb');
      //validar tipo
      if (file.mimetype !== 'image/webp')
        throw new BadRequestException(
          'Formato invalido, solo se permite el formato webp',
        );
      const filePath = join(process.cwd(), 'public', 'images', filename);
      //renombrar
      const name = `${filename.split('.').shift()}.${file.originalname.split('.').pop()}`;
      await fs.writeFile(filePath, file.buffer);
      return {
        message: `Imagen reemplazada correctamente`,
        filepath: `${process.env.API_URL || 'http://localhost:3000'}/products/images/${name}`,
      };
    } catch (error) {
      throw new BadRequestException(
        `No se pudo remplazar la imagen ${filename}`,
      );
    }
  }
}
