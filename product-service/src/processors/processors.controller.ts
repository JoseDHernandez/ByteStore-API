import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { ProcessorsService } from './processors.service';
import { CreateProcessorDTO } from './dto/create-processor.dto';
import { ResponseProcessorDTO } from './dto/response-processor.dto';
import { UpdateProcessorDTO } from './dto/update-processor.dto';

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
  @Get()
  getProcessors(): Promise<ResponseProcessorDTO[]> {
    return this.processorService.getProcessors();
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
