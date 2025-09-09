import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { CreateProductDTO } from './dto/create-product.dto';
import { ResponseProductDTO } from './dto/response-product.dto';
import { ResponseProductPaginatedDTO } from './dto/response-product-pag.dto';
import { ProcessorsService } from 'src/processors/processors.service';
import { OperatingSystemsService } from 'src/operating_systems/operating_systems.service';
import { DisplaysService } from 'src/displays/displays.service';
import { BrandsService } from 'src/brands/brands.service';
@Injectable()
export class ProductsService {
  //Usar clase/entidad Product en privado
  constructor(
    //Repositorio de product
    @InjectRepository(Product) private productRepository: Repository<Product>,
    //Repositorio de processor
    private readonly processorsService: ProcessorsService,
    //repositorio de os
    private readonly operatingSystemsService: OperatingSystemsService,
    //repositorio pantallas
    private readonly displaysService: DisplaysService,
    //repositorio marchas
    private readonly brandsService: BrandsService,
  ) {}
  //Conversor de Producto a ResponseProductDTO
  parseProductToDTO(product: Product): ResponseProductDTO {
    //Quitar ids
    const { id: _procId, ...processor } = product.processor;
    const { id: _sysId, ...system } = product.system;
    const { id: _dispId, ...display } = product.display;
    return {
      ...product,
      image: `${process.env.API_URL || 'http://localhost:3000'}/products/images/${product.image}`,
      brand: product.brand.name,
      processor,
      system,
      display,
    };
  }
  //Crear producto
  async createProduct(product: CreateProductDTO) {
    //Registrar procesador
    const processor = await this.processorsService.createProcessor({
      ...product.processor,
    });
    //Registrar os
    const system = await this.operatingSystemsService.createOS({
      ...product.system,
    });
    //registrar pantalla
    const display = await this.displaysService.createDisplay({
      ...product.display,
    });
    //marca
    const brand = await this.brandsService.createBrand({
      name: product.brand,
    });
    //crear producto
    const newProduct = this.productRepository.create({
      ...product,
      qualification: 0.0,
      processor,
      system,
      display,
      brand,
    });
    return this.parseProductToDTO(
      await this.productRepository.save(newProduct),
    );
  }
  //Obtener productos
  async getProducts(): Promise<ResponseProductDTO[]> {
    const res = await this.productRepository.find({
      relations: ['brand', 'processor', 'system', 'display'],
    });
    return res.map((r) => this.parseProductToDTO(r));
  }
  //Obtener producto por Id
  async getProductById(id: number): Promise<ResponseProductDTO> {
    const res = await this.productRepository.findOne({
      relations: ['brand', 'processor', 'system', 'display'],
      where: { id },
    });

    if (!res) {
      throw new NotFoundException(
        `El producto con el id ${id} no fue encontrado`,
      );
    }

    return this.parseProductToDTO(res);
  }
  //paginador
  async getProductsPaginated(
    numberPage: number,
    perPage: number,
    search: string[] = [],
    order_price: 'ASC' | 'DESC' | null,
    order_review: 'ASC' | 'DESC' | null,
  ): Promise<ResponseProductPaginatedDTO> {
    const query = this.productRepository
      .createQueryBuilder('products')
      .innerJoinAndSelect('products.brand', 'brand')
      .innerJoinAndSelect('products.display', 'display')
      .innerJoinAndSelect('products.processor', 'processor')
      .innerJoinAndSelect('products.system', 'system');

    //buscar por nombre o modelo
    if (search.length > 0) {
      search.forEach((term, index) => {
        query.andWhere(
          '(products.name LIKE :term' +
            index +
            ' OR products.model LIKE :term' +
            index +
            ')',
          { ['term' + index]: `%${term}%` },
        );
      });
    }

    //ordenar por precio
    if (order_price) {
      query.addOrderBy('products.price', order_price);
    }
    //Ordenar por calificación
    if (order_review) {
      query.addOrderBy('products.qualification', order_review);
    }

    //Cantidad de registros
    const totalItems = await query.getCount();

    //Paginar
    const pages = Math.ceil(totalItems / perPage);
    const page = Math.max(1, Math.min(numberPage, pages));
    const first = 1;
    const prev = page > 1 ? page - 1 : null;
    const next = page < pages ? page + 1 : null;

    const res = await query
      .skip((page - 1) * perPage)
      .take(perPage)
      .getMany();

    return {
      total: totalItems,
      pages,
      first,
      next,
      prev,
      data: res.map((e) => this.parseProductToDTO(e)),
    };
  }
}
