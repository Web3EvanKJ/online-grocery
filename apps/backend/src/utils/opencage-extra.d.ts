import type { Components } from "opencage-api-client";

declare module "opencage-api-client" {
  interface Components {
    residential?: string;
    quarter?: string;
    province?: string;
    municipality?: string;
  }
}
