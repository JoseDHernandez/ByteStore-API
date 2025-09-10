import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { DisplaysService } from './displays.service';
import { CreateDisplayDTO } from './dto/create-display.dto';
import { UpdateDisplayDTO } from './dto/update-display.dto';
import { Public } from 'src/auth/public.decorator';
@Controller('displays')
export class DisplaysController {
  constructor(private displaysService: DisplaysService) {}
  //obtener
  @Public()
  @Get()
  getDisplays() {
    return this.displaysService.getDisplays();
  }
  //Crear
  @Post()
  createDisplay(@Body() newDisplay: CreateDisplayDTO) {
    return this.displaysService.createDisplay(newDisplay);
  }
  //actualizar
  @Put(':id')
  updateDisplay(
    @Param('id', ParseIntPipe) id: number,
    @Body() display: UpdateDisplayDTO,
  ) {
    return this.displaysService.updateDisplay(id, display);
  }
  //eliminar
  @Delete(':id')
  deleteDisplay(@Param('id', ParseIntPipe) id: number) {
    return this.displaysService.deleteDisplay(id);
  }
}
