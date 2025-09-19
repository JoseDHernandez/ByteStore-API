import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsUrl,
  Matches,
  IsInt,
} from 'class-validator';
export class UpdateProductDTO {
  // Nombre
  @IsString()
  @IsOptional()
  @MinLength(5, { message: 'El nombre debe tener al menos 5 caracteres' })
  @MaxLength(40, { message: 'El nombre no debe exceder 40 caracteres' })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/, {
    message:
      'Nombre inválido, solo se permiten letras, números, espacios y guiones',
  })
  name?: string;

  // Descripción
  @IsString()
  @IsOptional()
  @MinLength(10, {
    message: 'La descripción debe tener al menos 10 caracteres',
  })
  @MaxLength(1000, {
    message: 'La descripción no debe exceder 1000 caracteres',
  })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\.\,\'\"\(\)\-\!\¡\:\;]+$/, {
    message:
      'Descripción invalida, solo se permiten letras, números, espacios y los caracteres; .,\"\')(-!¡:; ',
  })
  description?: string;

  // Precio
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número válido' },
  )
  @IsOptional()
  @Min(100000, { message: 'El precio mínimo es 100.000' })
  @Max(20000000, { message: 'El precio máximo es 20.000.000' })
  price?: number;

  // Descuento
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'El descuento mínimo es 0%' })
  @Max(90, { message: 'El descuento máximo es 90%' })
  discount?: number;

  // Unidades disponibles
  @IsInt({ message: 'El stock debe ser un número entero' })
  @IsOptional()
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;

  // Imagen del producto (URL)
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @IsOptional()
  image?: string;

  // Modelo
  @IsString()
  @IsOptional()
  @MinLength(5, { message: 'El modelo debe tener al menos 5 caracteres' })
  @MaxLength(36, { message: 'El modelo no debe exceder 36 caracteres' })
  @Matches(/^[\w\d\-\/\\]+$/, {
    message:
      'Modelo invalido, solo se permiten letras, números, guiones y barras inclinadas',
  })
  model?: string;

  // Capacidad de RAM
  @IsNumber()
  @IsOptional()
  @Min(8, { message: 'La RAM mínima es de 8 GB' })
  @Max(128, { message: 'La RAM máxima es de 128 GB' })
  ram_capacity?: number;

  // Capacidad de almacenamiento
  @IsNumber()
  @IsOptional()
  @Min(120, { message: 'El almacenamiento mínimo es de 120 GB' })
  @Max(10000, { message: 'El almacenamiento máximo es de 10000 GB' })
  disk_capacity?: number;

  //id procesador
  @IsInt()
  @IsOptional()
  @Min(1)
  processor_id?: number;

  //id sistema operativo
  @IsInt()
  @IsOptional()
  @Min(1)
  system_id?: number;

  //id pantalla/gráficos
  @IsInt()
  @IsOptional()
  @Min(1)
  display_id?: number;

  //id marca
  @IsInt()
  @IsOptional()
  @Min(1)
  brand_id?: number;
}
