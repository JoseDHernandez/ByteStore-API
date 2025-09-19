import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsUrl,
  Matches,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateProcessorDTO } from 'src/processors/dto/create-processor.dto';
import { CreateOperatingSystemDTO } from 'src/operating_systems/dto/create-operating_system.dto';
import { CreateDisplayDTO } from 'src/displays/dto/create-display.dto';

export class CreateProductDTO {
  // Nombre
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(5, { message: 'El nombre debe tener al menos 5 caracteres' })
  @MaxLength(40, { message: 'El nombre no debe exceder 40 caracteres' })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/, {
    message:
      'Nombre inválido, solo se permiten letras, números, espacios y guiones',
  })
  name: string;

  // Descripción
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
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
  description: string;

  // Precio
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número válido' },
  )
  @Min(100000, { message: 'El precio mínimo es 100.000' })
  @Max(20000000, { message: 'El precio máximo es 20.000.000' })
  price: number;

  // Descuento
  @IsNumber()
  @Min(0, { message: 'El descuento mínimo es 0%' })
  @Max(90, { message: 'El descuento máximo es 90%' })
  discount: number;

  // Unidades disponibles
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  // Imagen del producto (URL)
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @IsNotEmpty({ message: 'La imagen es obligatoria' })
  image: string;

  // Modelo
  @IsString()
  @IsNotEmpty({ message: 'El modelo es obligatorio' })
  @MinLength(5, { message: 'El modelo debe tener al menos 5 caracteres' })
  @MaxLength(36, { message: 'El modelo no debe exceder 36 caracteres' })
  @Matches(/^[\w\d\-\/\\]+$/, {
    message:
      'Modelo invalido, solo se permiten letras, números, guiones y barras inclinadas',
  })
  model: string;

  // Capacidad de RAM
  @IsNumber()
  @Min(8, { message: 'La RAM mínima es de 8 GB' })
  @Max(128, { message: 'La RAM máxima es de 128 GB' })
  ram_capacity: number;

  // Capacidad de almacenamiento
  @IsNumber()
  @Min(120, { message: 'El almacenamiento mínimo es de 120 GB' })
  @Max(10000, { message: 'El almacenamiento máximo es de 10000 GB' })
  disk_capacity: number;

  // Procesador
  @ValidateNested()
  @Type(() => CreateProcessorDTO)
  processor: CreateProcessorDTO;

  // Sistema operativo
  @ValidateNested()
  @Type(() => CreateOperatingSystemDTO)
  system: CreateOperatingSystemDTO;

  // Pantalla / Gráficos
  @ValidateNested()
  @Type(() => CreateDisplayDTO)
  display: CreateDisplayDTO;

  // Marca
  @IsString()
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  @MinLength(2, { message: 'La marca debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'La marca no debe exceder 50 caracteres' })
  @Matches(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/, {
    message:
      'Marca inválida, solo se permiten letras, números, espacios y guiones',
  })
  @Transform(({ value }) => value.toUpperCase())
  brand: string;
}
