import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
export class CreateBrandDTO {
  //nombre de la marca del portátil
  @IsString()
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  @MinLength(2, { message: 'La marca debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'La marca no debe exceder 50 caracteres' })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/, {
    message:
      'Marca inválida, solo se permiten letras, números, espacios y guiones',
  })
  @Transform(({ value }) => value.toUpperCase())
  name: string;
}
