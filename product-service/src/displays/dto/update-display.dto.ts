import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateDisplayDTO {
  // Tamaño de la pantalla
  @IsNumber({}, { message: 'El tamaño debe ser un número válido' })
  @IsOptional()
  @Min(10, { message: 'El tamaño mínimo de la pantalla es 10 pulgadas' })
  @Max(20, { message: 'El tamaño máximo de la pantalla es 20 pulgadas' })
  size?: number;

  // Código de la resolución
  @IsString({ message: 'La resolución debe ser un texto válido' })
  @IsOptional()
  @MinLength(3, { message: 'La resolución debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'La resolución no debe exceder 30 caracteres' })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/, {
    message:
      'Resolución inválida, solo se permiten letras, números, espacios y guiones',
  })
  resolution?: string;

  // Gráficos de la pantalla
  @IsString({ message: 'Los gráficos deben ser un texto válido' })
  @IsOptional()
  @MinLength(3, { message: 'Los gráficos deben tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'Los gráficos no deben exceder 30 caracteres' })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/, {
    message:
      'Gráficos inválidos, solo se permiten letras, números, espacios y guiones',
  })
  graphics?: string;

  // Marca de los gráficos
  @IsString({ message: 'La marca debe ser un texto válido' })
  @IsOptional()
  @MinLength(3, { message: 'La marca debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'La marca no debe exceder 30 caracteres' })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/, {
    message:
      'Marca inválida, solo se permiten letras, números, espacios y guiones',
  })
  brand?: string;
}
