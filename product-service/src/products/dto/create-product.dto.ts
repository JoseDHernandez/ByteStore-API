export class CreateProductDTO{
      name:string;
    description:string;
    price:number;
    discount:number|undefined;
    stock:number;
    image:string;
    model:string;
    ram_capacity:number;
    disk_capacity:number;
    processor_id:number;
    system_id:number;
    screen_id:number;
    brand_id:number;
}