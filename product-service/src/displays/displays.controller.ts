import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
  Body,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { DisplaysService } from './displays.service';
import { CreateDisplayDTO } from './dto/create-display.dto';
import { UpdateDisplayDTO } from './dto/update-display.dto';
import { Public } from 'src/auth/public.decorator';
import { ResponseDisplayDTO } from './dto/response-display.dto';
@Controller('displays')
export class DisplaysController {
  constructor(private displaysService: DisplaysService) {}
  //obtener
  @Public()
  @Get()
  getDisplays() {
    return this.displaysService.getDisplays();
  }
  //por id
  @Public()
  @Get(':id')
  async getDisplay(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDisplayDTO> {
    const res = await this.displaysService.getDisplayById(id);
    if (!res) {
      throw new NotFoundException(
        `No se encontró la pantalla con el id: ${id}`,
      );
    }
    return res;
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
