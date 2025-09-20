import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Display } from './display.enity';
import { Repository } from 'typeorm';
import { CreateDisplayDTO } from './dto/create-display.dto';
import {
  ResponseDisplayBrandsDTO,
  ResponseDisplayDTO,
} from './dto/response-display.dto';
import { UpdateDisplayDTO } from './dto/update-display.dto';

@Injectable()
export class DisplaysService {
  constructor(
    @InjectRepository(Display) private displaysRepository: Repository<Display>,
  ) {}
  //obtener
  async getDisplays(): Promise<ResponseDisplayDTO[]> {
    return this.displaysRepository.find();
  }
  //obtener por id
  getDisplayById(id: number): Promise<ResponseDisplayDTO | null> {
    return this.displaysRepository.findOneBy({ id });
  }
  //obtener marcas
  getDisplaysBrands(): Promise<ResponseDisplayBrandsDTO[]> {
    return this.displaysRepository
      .createQueryBuilder('displays')
      .select('DISTINCT displays.brand', 'name')
      .where('displays.brand IS NOT NULL')
      .getRawMany<ResponseDisplayBrandsDTO>();
  }
  //Crear display/ pantalla
  async createDisplay(display: CreateDisplayDTO): Promise<ResponseDisplayDTO> {
    //Buscar
    const findDisplay = await this.displaysRepository.findOneBy({
      resolution: display.resolution,
      size: display.size,
      graphics: display.graphics,
    });
    //retornar
    if (findDisplay) return findDisplay;
    const newDisplay = this.displaysRepository.create(display);
    return await this.displaysRepository.save(newDisplay);
  }
  //Actualizar
  async updateDisplay(
    id: number,
    display: UpdateDisplayDTO,
  ): Promise<ResponseDisplayDTO> {
    //actualizar
    const result = await this.displaysRepository.update({ id }, { ...display });
    if (result.affected === 1) {
      //retornar registro actualizado
      const r = await this.displaysRepository.findOneBy({ id });
      if (!r)
        throw new NotFoundException(
          `No se encontró un registro de la pantalla con el id: ${id}`,
        );
      return r;
    }
    throw new NotFoundException(
      `No se actualizo registro de la pantalla con el id: ${id}. Verifique el id solicitado.`,
    );
  }
  //Eliminar
  async deleteDisplay(id: number) {
    const result = await this.displaysRepository.delete({ id });
    if (result.affected === 1)
      return {
        message: `Se elimino correctamente el registro de la pantalla con id: ${id}`,
      };
    throw new NotFoundException(
      `No se encontró un registro de la pantalla con el id: ${id}`,
    );
  }
}
