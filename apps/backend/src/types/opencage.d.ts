declare module "opencage-api-client" {
  interface OpenCageRequest {
    q: string;
    key?: string;
    language?: string;
    limit?: number;
    no_annotations?: number;
  }

  interface OpenCageResponse {
    results: {
      formatted: string;
      geometry: {
        lat: number;
        lng: number;
      };
      [key: string]: any;
    }[];
    status: {
      code: number;
      message: string;
    };
  }

  function geocode(request: OpenCageRequest): Promise<OpenCageResponse>;

  export { geocode };
}