import { ResponseProductDTO } from './response-product.dto';

export class ResponseProductPaginatedDTO {
  total: number;
  pages: number;
  first: number;
  next: number | null;
  prev: number | null;
  data: ResponseProductDTO[];
}
