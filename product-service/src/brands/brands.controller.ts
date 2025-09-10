import {
  Controller,
  ParseIntPipe,
  Patch,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Get } from '@nestjs/common';
import { ResponseBrandDTO } from './dto/response-brand.dto';
import { UpdateBrandDTO } from './dto/update-brand.dto';
import { Public } from 'src/auth/public.decorator';
@Controller('brands')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}
  //obtener marcas
  @Public()
  @Get()
  getBrands(): Promise<ResponseBrandDTO[]> {
    return this.brandsService.getBrands();
  }
  //Actualizar marca
  @Patch(':id')
  updateBrand(
    @Param('id', ParseIntPipe) id: number,
    @Body() brand: UpdateBrandDTO,
  ): Promise<ResponseBrandDTO> {
    return this.brandsService.updateBrand(id, brand);
  }
  //eliminar
  @Delete(':id')
  deleteBrand(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.deleteBrand(id);
  }
}
