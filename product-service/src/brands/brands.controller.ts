import {
  Controller,
  ParseIntPipe,
  Patch,
  Param,
  Body,
  Delete,
  Post,
  NotFoundException,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Get } from '@nestjs/common';
import { ResponseBrandDTO } from './dto/response-brand.dto';
import { UpdateBrandDTO } from './dto/update-brand.dto';
import { Public } from 'src/auth/public.decorator';
import { CreateBrandDTO } from './dto/create-brand.dto';
@Controller('brands')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}
  //obtener marcas
  @Public()
  @Get()
  getBrands(): Promise<ResponseBrandDTO[]> {
    return this.brandsService.getBrands();
  }
  //id
  @Public()
  @Get('id')
  async getBrand(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseBrandDTO> {
    const res = await this.brandsService.getBrandById(id);
    if (!res) {
      throw new NotFoundException(`No se encontró la marca con el id: ${id}`);
    }
    return res;
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
  //crear
  @Post()
  createBrand(@Body() brand: CreateBrandDTO): Promise<ResponseBrandDTO> {
    return this.brandsService.createBrand(brand);
  }
}
