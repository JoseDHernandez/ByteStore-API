import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Header,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDTO } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import {
  ResponseProductDTO,
  ResponseProductFiltersDTO,
  ResponseProductPaginatedDTO,
} from './dto/response-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { Public } from 'src/auth/public.decorator';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
//Ruta: /
@Controller()
export class ProductsController {
  constructor(private productsService: ProductsService) {}
  //======= Crear producto =======
  @Post()
  createProduct(@Body() newProduct: CreateProductDTO) {
    return this.productsService.createProduct(newProduct);
  }

  //Actualizar
  @Put(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() product: UpdateProductDTO,
  ): Promise<ResponseProductDTO> {
    return this.productsService.updateProduct(id, product);
  }
  //eliminar
  @Delete(':id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
  //Obtener productos
  @Public()
  @Get()
  @CacheKey('products_paginated')
  @CacheTTL(300)
  @Header('Cache-Control', 'public, max-age=600')
  getProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) per_page?: number,
    @Query('search') search?: string,
    @Query('sort') sort?: 'order_price' | 'order_review',
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('list') list?: string,
  ): Promise<ResponseProductDTO[] | ResponseProductPaginatedDTO> {
    //Productos por lista
    if (list) {
      const listIds: number[] = list
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((num) => !isNaN(num));
      if (list.length === 0)
        throw new BadRequestException('Los ids indicados no son validos');
      return this.productsService.getProductsByList(listIds);
    }
    //Paginación sola
    if (per_page || page || search || sort || order) {
      //Valores por defecto
      const pageNum = page && page > 0 ? page : 1; // numero de pagina
      const perPageNum =
        per_page && per_page > 0 && per_page <= 100 ? per_page : 15; //cantidad por pagina
      const queryTerms = search
        ? decodeURIComponent(search)
            .split(',')
            .map((s) => s.trim())
        : []; //separar términos por ,
      const orderType =
        order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'; //Establecer orden
      //tipos de orden
      const sortPrice = sort && sort === 'order_price' ? orderType : null;
      const sortReview = sort && sort === 'order_review' ? orderType : null;
      return this.productsService.getProductsPaginated(
        pageNum,
        perPageNum,
        queryTerms,
        sortPrice,
        sortReview,
      );
    }
    return this.productsService.getProducts();
  }
  //obtener filtros
  @Public()
  @Get('filters')
  @CacheKey('products_filters')
  @CacheTTL(600)
  @Header('Cache-Control', 'public, max-age=600')
  getFilters(): Promise<ResponseProductFiltersDTO> {
    return this.productsService.getFilters();
  }
  //Obtener productor por Id
  @Public()
  @Get(':id')
  @CacheKey('product_id')
  @CacheTTL(600)
  @Header('Cache-Control', 'public, max-age=600')
  getProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseProductDTO> {
    return this.productsService.getProductById(id);
  }
  //Actualizar calificación
  @Patch(':id')
  updateQualification(
    @Param('id', ParseIntPipe) id: number,
    @Body() qualification: number,
  ): Promise<ResponseProductDTO> {
    if (
      isNaN(qualification) ||
      isFinite(qualification) ||
      qualification < 0 ||
      qualification > 5
    )
      throw new BadRequestException(
        `El valor de qualification es invalido (${qualification})`,
      );
    return this.productsService.updateQualification(id, qualification);
  }
}
