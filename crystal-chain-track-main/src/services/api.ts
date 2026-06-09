// API service - will connect to database tables once created
export interface Product {
  id: string;
  name: string;
  origin: string;
  status: string;
  created_at: string;
}

// Placeholder service - tables will be created when needed
export const apiService = {
  async getProducts(): Promise<Product[]> {
    // TODO: Connect to Lovable Cloud database
    return [];
  },
};
