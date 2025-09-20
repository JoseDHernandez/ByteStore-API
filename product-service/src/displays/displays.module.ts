import { Module } from '@nestjs/common';
import { DisplaysController } from './displays.controller';
import { DisplaysService } from './displays.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Display } from './display.enity';

@Module({
  imports: [TypeOrmModule.forFeature([Display])],
  controllers: [DisplaysController],
  providers: [DisplaysService],
  exports: [DisplaysService],
})
export class DisplaysModule {}
