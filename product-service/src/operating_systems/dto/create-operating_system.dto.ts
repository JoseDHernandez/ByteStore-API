import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateOperatingSystemDTO {
  // Sistema operativo
  @IsString({ message: 'El sistema operativo debe ser un texto válido' })
  @IsNotEmpty({ message: 'El sistema operativo es obligatorio' })
  @MinLength(3, {
    message: 'El sistema operativo debe tener al menos 3 caracteres',
  })
  @MaxLength(30, {
    message: 'El sistema operativo no debe exceder 30 caracteres',
  })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/, {
    message:
      'Sistema operativo inválido, solo se permiten letras, números, espacios y guiones',
  })
  system: string;

  // Distribución
  @IsString({ message: 'La distribución debe ser un texto válido' })
  @IsNotEmpty({ message: 'La distribución es obligatoria' })
  @MinLength(3, { message: 'La distribución debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'La distribución no debe exceder 30 caracteres' })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/, {
    message:
      'Distribución inválida, solo se permiten letras, números, espacios y guiones',
  })
  distribution: string;
}
