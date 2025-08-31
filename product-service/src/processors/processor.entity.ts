import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('processors')
export class Processor {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  brand: string;
  @Column()
  family: string;
  @Column()
  model: string;
  @Column()
  cores: number;
  @Column()
  speed: number;
}
