import { Controller, Post } from '@nestjs/common';
import { ProcessorsService } from './processors.service';

@Controller('processors')
export class ProcessorsController {
  constructor(private processorService: ProcessorsService) {}
  @Post()
  createProcessor() {}
}
