import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operating_system } from './operating_system.entity';
import { OperatingSystemsController } from './operating_systems.controller';
import { OperatingSystemsService } from './operating_systems.service';

@Module({
  imports: [TypeOrmModule.forFeature([Operating_system])],
  controllers: [OperatingSystemsController],
  providers: [OperatingSystemsService],
})
export class OperatingSystemsModule {}
