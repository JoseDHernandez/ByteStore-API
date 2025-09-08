import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Operating_system } from './operating_system.entity';
import { Repository } from 'typeorm';
import { CreateOperatingSystemDTO } from './dto/create-operating_system.dto';

@Injectable()
export class OperatingSystemsService {
  constructor(
    @InjectRepository(Operating_system)
    private operatingSystemsRepository: Repository<Operating_system>,
  ) {}

  async createOS(OS: CreateOperatingSystemDTO) {
    //buscar
    const findOS = await this.operatingSystemsRepository.findOneBy({
      system: OS.system,
      distribution: OS.distribution,
    });
    //retornar
    if (findOS) return findOS;
    const newOS = this.operatingSystemsRepository.create(OS);
    return await this.operatingSystemsRepository.save(newOS);
  }
}
