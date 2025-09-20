export class CreateProductDTO {
  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  image: string;
  model: string;
  ram_capacity: number;
  disk_capacity: number;
  processor: {
    brand: string;
    family: string;
    model: string;
    cores: number;
    speed: string;
  };
  system: {
    system: string;
    distribution: string;
  };
  display: {
    size: number;
    resolution: string;
    graphics: string;
    brand: string;
  };
  brand: string;
}
