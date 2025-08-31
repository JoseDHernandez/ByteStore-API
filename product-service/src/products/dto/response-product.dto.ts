import { Display } from 'src/displays/display.enity';
import { Operating_system } from 'src/operating_systems/operating_system.entity';
import { Processor } from 'src/processors/processor.entity';
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
