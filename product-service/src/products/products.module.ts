import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProcessorsModule } from 'src/processors/processors.module';
import { OperatingSystemsModule } from 'src/operating_systems/operating_systems.module';
import { DisplaysModule } from 'src/displays/displays.module';
import { BrandsModule } from 'src/brands/brands.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    ProcessorsModule,
    OperatingSystemsModule,
    DisplaysModule,
    BrandsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
