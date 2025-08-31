import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('operating_systems')
export class Operating_system {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  system: string;
  @Column()
  distribution: string;
}
