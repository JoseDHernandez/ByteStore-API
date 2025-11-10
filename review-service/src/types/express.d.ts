import "express";
import type { JWTData } from "./token.ts";

declare module "express-serve-static-core" {
  interface Request {
    auth?: JWTData;
  }
}
