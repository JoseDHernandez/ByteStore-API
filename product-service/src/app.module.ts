import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsModule } from './brands/brands.module';
import { DisplaysModule } from './displays/displays.module';
import { OperatingSystemsModule } from './operating_systems/operating_systems.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      migrationsRun: false,
      autoLoadEntities: true,
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    ProductsModule,
    BrandsModule,
    DisplaysModule,
    OperatingSystemsModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public', 'images'),
      serveRoot: '/images',
      serveStaticOptions: { maxAge: '86400', immutable: true },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
