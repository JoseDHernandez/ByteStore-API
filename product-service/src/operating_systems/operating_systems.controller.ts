import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { OperatingSystemsService } from './operating_systems.service';
import { ResponseOperatingSystemDTO } from './dto/response-operating_system.dto';
import { CreateOperatingSystemDTO } from './dto/create-operating_system.dto';
import { UpdateOperatingSystemDTO } from './dto/update-operating_system.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('operating-systems')
export class OperatingSystemsController {
  constructor(private operatingSystemsService: OperatingSystemsService) {}
  //obtener
  @Public()
  @Get()
  getOS(): Promise<ResponseOperatingSystemDTO[]> {
    return this.operatingSystemsService.getOS();
  }
  //obtener por id
  @Public()
  @Get(':id')
  async getOSById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseOperatingSystemDTO> {
    const res = await this.operatingSystemsService.getOSById(id);
    if (!res)
      throw new NotFoundException(
        `No se encontró el sistema operativo con el id: ${id}`,
      );
    return res;
  }
  //crear
  @Post()
  createOS(
    @Body() newOS: CreateOperatingSystemDTO,
  ): Promise<ResponseOperatingSystemDTO> {
    return this.operatingSystemsService.createOS(newOS);
  }
  //Actualizar
  @Put(':id')
  updateOS(
    @Param('id', ParseIntPipe) id: number,
    @Body() os: UpdateOperatingSystemDTO,
  ): Promise<ResponseOperatingSystemDTO> {
    return this.operatingSystemsService.updateOS(id, os);
  }
  //eliminar
  @Delete(':id')
  deleteOS(@Param('id', ParseIntPipe) id: number) {
    return this.operatingSystemsService.deleteOs(id);
  }
}
