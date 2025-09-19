import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateProcessorDTO {
  // Marca del procesador
  @IsString({ message: 'La marca debe ser un texto válido' })
  @IsNotEmpty({ message: 'La marca del procesador es obligatoria' })
  @MinLength(3, { message: 'La marca debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'La marca no debe exceder 30 caracteres' })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/, {
    message:
      'Marca del procesador inválida, solo se permiten letras, números, espacios y guiones',
  })
  brand: string;

  // Familia del procesador
  @IsString({ message: 'La familia debe ser un texto válido' })
  @IsNotEmpty({ message: 'La familia del procesador es obligatoria' })
  @MinLength(3, { message: 'La familia debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'La familia no debe exceder 30 caracteres' })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/, {
    message:
      'Familia del procesador inválida, solo se permiten letras, números, espacios y guiones',
  })
  family: string;

  // Modelo del procesador
  @IsString({ message: 'El modelo debe ser un texto válido' })
  @IsNotEmpty({ message: 'El modelo del procesador es obligatorio' })
  @MinLength(3, { message: 'El modelo debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'El modelo no debe exceder 30 caracteres' })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/, {
    message:
      'Modelo del procesador inválido, solo se permiten letras, números, espacios y guiones',
  })
  model: string;

  // Cantidad de núcleos
  @IsNumber({}, { message: 'Los núcleos deben ser un número válido' })
  @Min(4, { message: 'El procesador debe tener mínimo 4 núcleos' })
  @Max(64, { message: 'El procesador no puede tener más de 64 núcleos' })
  cores: number;

  // Velocidad del procesador (descripción textual)
  @IsString({ message: 'La velocidad debe ser un texto válido' })
  @IsNotEmpty({ message: 'La velocidad del procesador es obligatoria' })
  @MinLength(3, { message: 'La velocidad debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'La velocidad no debe exceder 200 caracteres' })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\.\,\-\)\(\\\/]+$/, {
    message:
      'Descripción de la velocidad inválida, solo se permiten letras, números, espacios y ciertos símbolos (.,-()/)',
  })
  speed: string;
}
