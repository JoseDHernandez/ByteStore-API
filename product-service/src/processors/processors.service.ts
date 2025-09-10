import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Processor } from './processor.entity';
import { Repository } from 'typeorm';
import { CreateProcessorDTO } from './dto/create-processor.dto';
import {
  ResponseProcessorDTO,
  ResponseProcessorsBrandsDTO,
} from './dto/response-processor.dto';
import { UpdateProcessorDTO } from './dto/update-processor.dto';

@Injectable()
export class ProcessorsService {
  constructor(
    @InjectRepository(Processor)
    private processorRepository: Repository<Processor>,
  ) {}
  //Registrar nuevo procesador
  async createProcessor(processor: CreateProcessorDTO) {
    //Buscar si ya existe
    const findProcessor = await this.processorRepository.findOne({
      where: {
        model: processor.model,
        brand: processor.brand,
        family: processor.family,
        cores: processor.cores,
      },
    });
    //Retornar
    if (findProcessor) return findProcessor;
    //crear procesador
    const newProcessor = this.processorRepository.create();
    return this.processorRepository.create(newProcessor);
  }
  //obtener
  getProcessors(): Promise<ResponseProcessorDTO[]> {
    return this.processorRepository.find();
  }
  //obtener por id
  getProcessorById(id: number): Promise<ResponseProcessorDTO | null> {
    return this.processorRepository.findOneBy({ id });
  }
  //obtener marcas
  getProcessorsBrands(): Promise<ResponseProcessorsBrandsDTO[]> {
    return this.processorRepository
      .createQueryBuilder('processor')
      .select('DISTINCT processor.brand', 'name')
      .getRawMany<ResponseProcessorsBrandsDTO>();
  }

  //actualizar
  async updateProcessor(
    id: number,
    processor: UpdateProcessorDTO,
  ): Promise<ResponseProcessorDTO> {
    const updatedProcessor = await this.processorRepository.update(
      { id },
      { ...processor },
    );
    if (updatedProcessor.affected === 1) {
      const res = await this.processorRepository.findOneBy({ id });
      if (res) return res;
      throw new NotFoundException(
        `No se actualizo registro del procesador con el id: ${id}.`,
      );
    }
    throw new NotFoundException(
      `No se actualizo registro del procesador con el id: ${id}.`,
    );
  }
  //eliminar
  async deleteProcessor(id: number) {
    const deletedProcessor = await this.processorRepository.delete({ id });
    if (deletedProcessor.affected)
      return {
        message: `Se elimino correctamente el registro del procesador con id: ${id}`,
      };
    throw new NotFoundException(
      `No se elimino registro del procesador con el id: ${id}.`,
    );
  }
}
