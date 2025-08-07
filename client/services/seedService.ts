class SeedService {
  private static instance: SeedService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = '/api';
  }

  static getInstance(): SeedService {
    if (!SeedService.instance) {
      SeedService.instance = new SeedService();
    }
    return SeedService.instance;
  }

  async seedDatabase(): Promise<{success: boolean, message?: string, error?: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/seed-database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database seeding error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const seedService = SeedService.getInstance();
export default seedService;
