import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Operating_system } from './operating_system.entity';
import { Repository } from 'typeorm';
import { CreateOperatingSystemDTO } from './dto/create-operating_system.dto';
import { ResponseOperatingSystemDTO } from './dto/response-operating_system.dto';
import { UpdateOperatingSystemDTO } from './dto/update-operating_system.dto';

@Injectable()
export class OperatingSystemsService {
  constructor(
    @InjectRepository(Operating_system)
    private operatingSystemsRepository: Repository<Operating_system>,
  ) {}
  //obtener
  async getOS(): Promise<ResponseOperatingSystemDTO[]> {
    return this.operatingSystemsRepository.find();
  }
  //obtener por id
  getOSById(id: number): Promise<ResponseOperatingSystemDTO | null> {
    return this.operatingSystemsRepository.findOneBy({ id });
  }
  //crear
  async createOS(
    OS: CreateOperatingSystemDTO,
  ): Promise<ResponseOperatingSystemDTO> {
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
  //actualizar
  async updateOS(
    id: number,
    os: UpdateOperatingSystemDTO,
  ): Promise<ResponseOperatingSystemDTO> {
    const updatedOS = await this.operatingSystemsRepository.update(
      { id },
      { ...os },
    );
    if (updatedOS.affected === 1) {
      const res = await this.operatingSystemsRepository.findOneBy({ id });
      if (!res)
        throw new NotFoundException(
          `No se actualizo el registro del sistema operativo con el id: ${id}.`,
        );
      return res;
    }
    throw new NotFoundException(
      `No se actualizo el registro del sistema operativo con el id: ${id}.`,
    );
  }
  //eliminar
  async deleteOs(id: number) {
    const deleteOS = await this.operatingSystemsRepository.delete({ id });
    if (deleteOS.affected === 1)
      return {
        message: `Se elimino correctamente el registro de sistema operativo con id: ${id}`,
      };
    throw new NotFoundException(
      `No se elimino el registro de sistema operativo con el id: ${id}.`,
    );
  }
}
