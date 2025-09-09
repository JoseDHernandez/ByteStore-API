import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
  DefaultValuePipe,
} from '@nestjs/common';
import { CreateProductDTO } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { ResponseProductDTO } from './dto/response-product.dto';
import { ResponseProductPaginatedDTO } from './dto/response-product-pag.dto';
//Ruta: /
@Controller()
export class ProductsController {
  constructor(private productsService: ProductsService) {}
  //Crear producto
  @Post()
  createProduct(@Body() newProduct: CreateProductDTO) {
    return this.productsService.createProduct(newProduct);
  }
  //Obtener productos
  @Get()
  getProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) per_page?: number,
    @Query('search') search?: string,
    @Query('order_price') order_price?: 'ASC' | 'DESC',
    @Query('order_review') order_review?: 'ASC' | 'DESC',
  ): Promise<ResponseProductDTO[] | ResponseProductPaginatedDTO> {
    //Paginación sola
    if (per_page || page || search || order_price || order_review) {
      //Valores por defecto
      const pageNum = page && page > 0 ? page : 1;
      const perPageNum = per_page && per_page > 0 ? per_page : 15;
      const queryTerms = search?.split(',').map((s) => s.trim()) ?? [];
      const sortPrice =
        order_price === 'ASC' || order_price === 'DESC' ? order_price : null;
      const sortReview =
        order_review === 'ASC' || order_review === 'DESC' ? order_review : null;

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

  //Obtener productor por Id
  @Get(':id')
  getProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseProductDTO> {
    return this.productsService.getProductById(id);
  }
}
