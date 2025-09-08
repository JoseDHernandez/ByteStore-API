import { Brand } from 'src/brands/brand.entity';
import { Operating_system } from 'src/operating_systems/operating_system.entity';
import { Processor } from 'src/processors/processor.entity';
import { Display } from 'src/displays/display.enity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  price: number;
  @Column({ nullable: true })
  discount: number;
  @Column({ nullable: true })
  stock: number;
  @Column()
  image: string;
  @Column()
  model: string;
  @Column()
  ram_capacity: number;
  @Column()
  disk_capacity: number;

  @Column({ type: 'decimal', default: () => 0.0 })
  qualification: number;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Processor)
  @JoinColumn({ name: 'processor_id' })
  processor: Processor;

  @ManyToOne(() => Operating_system)
  @JoinColumn({ name: 'system_id' })
  system: Operating_system;

  @ManyToOne(() => Display)
  @JoinColumn({ name: 'display_id' })
  display: Display;
}
