import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Processor } from './processor.entity';
import { Repository } from 'typeorm';
import { CreateProcessorDTO } from './dto/create-processor.dto';

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
        family: processor.familiy,
        cores: processor.cores,
      },
    });
    //Retornar
    if (findProcessor) return findProcessor;
    //crear procesador
    const newProcessor = this.processorRepository.create();
    return this.processorRepository.create(newProcessor);
  }
}
