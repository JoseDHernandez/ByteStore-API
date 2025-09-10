import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
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
