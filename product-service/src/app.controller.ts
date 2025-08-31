import {
  Controller,
  Get,
  Param,
  Res,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import type { Response } from 'express';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
}
