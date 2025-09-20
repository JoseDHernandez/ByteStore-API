import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('displays')
export class Display {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  size: number;
  @Column()
  resolution: string;
  @Column()
  graphics: string;
  @Column()
  brand: string;
}
