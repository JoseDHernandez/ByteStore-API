import { IsString } from 'class-validator';

export class CreateOperatingSystemDTO {
  @IsString()
  system: string;
  @IsString()
  distribution: string;
}
