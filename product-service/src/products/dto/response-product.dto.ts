import { Display } from 'src/displays/display.enity';
import { Operating_system } from 'src/operating_systems/operating_system.entity';
import { Processor } from 'src/processors/processor.entity';
import { ResponseBrandsNameDTO } from 'src/brands/dto/response-brand.dto';
import { ResponseProcessorsBrandsDTO } from 'src/processors/dto/response-processor.dto';
import { ResponseDisplayBrandsDTO } from 'src/displays/dto/response-display.dto';
//DTO completo
type ProcessorType = Omit<Processor, 'id'>;
type OSType = Omit<Operating_system, 'id'>;
type DisplayType = Omit<Display, 'id'>;
export class ResponseProductDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number | undefined;
  stock: number;
  image: string;
  model: string;
  ram_capacity: number;
  disk_capacity: number;
  brand: string;
  processor: ProcessorType;
  system: OSType;
  display: DisplayType;
  qualification: number;
}
//Productos paginados
export class ResponseProductPaginatedDTO {
  total: number;
  pages: number;
  first: number;
  next: number | null;
  prev: number | null;
  data: ResponseProductDTO[];
}
//Filtros
export class ResponseProductFiltersDTO {
  brands: ResponseBrandsNameDTO[];
  processors: ResponseProcessorsBrandsDTO[];
  displays: ResponseDisplayBrandsDTO[];
}
