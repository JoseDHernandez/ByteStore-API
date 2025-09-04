import type { RowDataPacket } from "mysql2";
export type User = RowDataPacket & {
  id: string;
  name: string;
  email: string;
  password?: string;
  physical_address: string;
  role: string;
};
