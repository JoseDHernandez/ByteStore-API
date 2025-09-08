import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
export class CreateBrandDTO {
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  name: string;
}
