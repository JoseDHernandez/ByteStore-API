import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Get,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ProcessorsService } from './processors.service';
import { CreateProcessorDTO } from './dto/create-processor.dto';
import { ResponseProcessorDTO } from './dto/response-processor.dto';
import { UpdateProcessorDTO } from './dto/update-processor.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('processors')
export class ProcessorsController {
  constructor(private processorService: ProcessorsService) {}
  //crear
  @Post()
  createProcessor(
    @Body() processor: CreateProcessorDTO,
  ): Promise<ResponseProcessorDTO> {
    return this.processorService.createProcessor(processor);
  }
  //obtener
  @Public()
  @Get()
  getProcessors(): Promise<ResponseProcessorDTO[]> {
    return this.processorService.getProcessors();
  }
  //obtener id
  @Public()
  @Get(':id')
  async getProcessor(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseProcessorDTO> {
    const res = await this.processorService.getProcessorById(id);
    if (!res) {
      throw new NotFoundException(
        `No se encontró el procesador con el id: ${id}`,
      );
    }
    return res;
  }
  //actualizar
  @Put(':id')
  updateProcessor(
    @Param('id', ParseIntPipe) id: number,
    @Body() processor: UpdateProcessorDTO,
  ): Promise<ResponseProcessorDTO> {
    return this.processorService.updateProcessor(id, processor);
  }
  //eliminar
  @Delete(':id')
  deleteProcessor(@Param('id', ParseIntPipe) id: number) {
    return this.processorService.deleteProcessor(id);
  }
}
