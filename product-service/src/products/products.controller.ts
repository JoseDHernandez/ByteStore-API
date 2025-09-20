import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
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
  getProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) per_page?: number,
    @Query('search') search?: string,
    @Query('sort') sort?: 'order_price' | 'order_review',
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<ResponseProductDTO[] | ResponseProductPaginatedDTO> {
    //Paginación sola
    if (per_page || page || search || sort || order) {
      //Valores por defecto
      const pageNum = page && page > 0 ? page : 1; // numero de pagina
      const perPageNum = per_page && per_page > 0 ? per_page : 15; //cantidad por pagina
      const queryTerms = search
        ? decodeURIComponent(search)
            .split(',')
            .map((s) => s.trim())
        : []; //separar términos por ,
      const orderType =
        order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'; //Establecer orden
      //typos de orden
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
  getFilters(): Promise<ResponseProductFiltersDTO> {
    return this.productsService.getFilters();
  }
  //Obtener productor por Id
  @Public()
  @Get(':id')
  getProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseProductDTO> {
    return this.productsService.getProductById(id);
  }
}
