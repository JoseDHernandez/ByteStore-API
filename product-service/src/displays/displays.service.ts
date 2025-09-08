import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Display } from './display.enity';
import { Repository } from 'typeorm';
import { CreateDisplayDTO } from './dto/create-display.dto';

@Injectable()
export class DisplaysService {
  constructor(
    @InjectRepository(Display) private displaysRepository: Repository<Display>,
  ) {}

  //Crear display/ pantalla
  async createDisplay(display: CreateDisplayDTO) {
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
}
