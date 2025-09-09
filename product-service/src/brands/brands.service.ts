import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './brand.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateBrandDTO } from './dto/create-brand.dto';
import { ResponseBrandDTO } from './dto/response-brand.dto';
import { UpdateBrandDTO } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private brandsRepository: Repository<Brand>,
  ) {}

  //Crear marca de portátil
  async createBrand(brand: CreateBrandDTO) {
    const findBrand = await this.brandsRepository.findOneBy({
      name: brand.name,
    });
    //retornar
    if (findBrand) return findBrand;
    const newBrand = this.brandsRepository.create(brand);
    return await this.brandsRepository.save(newBrand);
  }
  //Obtener todas las marcas
  async getBrands(): Promise<ResponseBrandDTO[]> {
    const brands = await this.brandsRepository.find();
    return brands;
  }
  //actualizar marca
  async updateBrand(
    id: number,
    brand: UpdateBrandDTO,
  ): Promise<ResponseBrandDTO | NotFoundException> {
    const updateBrand = await this.brandsRepository.update(
      { id },
      { ...brand },
    );
    if (updateBrand.affected === 1) return { id, ...brand };
    throw new NotFoundException(`La marca con el id ${id} no fue actualizada.`);
  }
  //eliminar marca
  async deleteBrand(id: number): Promise<DeleteResult> {
    return await this.brandsRepository.delete({ id });
  }
}
