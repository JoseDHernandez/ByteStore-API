import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './brand.entity';
import { Repository } from 'typeorm';
import { CreateBrandDTO } from './dto/create-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private brandsRepository: Repository<Brand>,
  ) {}

  //Crear marca de protatil
  async createBrand(brand: CreateBrandDTO) {
    const findBrand = await this.brandsRepository.findOneBy({
      name: brand.name,
    });
    //retornar
    if (findBrand) return findBrand;
    const newBrand = this.brandsRepository.create(brand);
    return await this.brandsRepository.save(newBrand);
  }
}
