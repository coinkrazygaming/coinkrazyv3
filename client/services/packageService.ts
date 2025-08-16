import { authService } from "./authService";

// Types
export interface GoldCoinPackage {
  id: string;
  packageName: string;
  description: string;
  goldCoins: number;
  bonusCoins: number;
  priceUsd: number;
  originalPriceUsd?: number;
  discountPercentage: number;
  packageImageUrl?: string;
  packageIcon: string;
  isFeatured: boolean;
  isPopular: boolean;
  isBestValue: boolean;
  isActive: boolean;
  displayOrder: number;
  maxPurchasesPerUser?: number;
  packageType: 'standard' | 'starter' | 'premium' | 'vip' | 'special';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  // Runtime fields
  userPurchaseCount?: number;
  timesSold?: number;
  rating?: number;
  reviews?: number;
}

export interface SweepsCoinPackage {
  id: string;
  packageName: string;
  description: string;
  sweepsCoins: number;
  goldCoinsIncluded: number;
  priceUsd: number;
  originalPriceUsd?: number;
  discountPercentage: number;
  packageImageUrl?: string;
  packageIcon: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  maxPurchasesPerUser?: number;
  packageType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PackageStats {
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
  topSellingPackages: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export interface CreatePackageRequest {
  packageName: string;
  description?: string;
  goldCoins?: number;
  sweepsCoins?: number;
  bonusCoins?: number;
  goldCoinsIncluded?: number;
  priceUsd: number;
  originalPriceUsd?: number;
  discountPercentage?: number;
  packageImageUrl?: string;
  packageIcon: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  isBestValue?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  maxPurchasesPerUser?: number;
  packageType: string;
  tags?: string[];
}

export interface UpdatePackageRequest extends Partial<CreatePackageRequest> {
  id: string;
}

export interface PackageFilters {
  search?: string;
  packageType?: string;
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  isBestValue?: boolean;
  tags?: string[];
}

export interface PackageSortOptions {
  sortBy: 'displayOrder' | 'priceAsc' | 'priceDesc' | 'coinsDesc' | 'popular' | 'newest' | 'rating';
  limit?: number;
  offset?: number;
}

class PackageService {
  private static instance: PackageService;
  private baseUrl = '/api';

  static getInstance(): PackageService {
    if (!PackageService.instance) {
      PackageService.instance = new PackageService();
    }
    return PackageService.instance;
  }

  // Private helper for API calls
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = authService.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Gold Coin Packages

  /**
   * Get all gold coin packages with optional filters
   */
  async getGoldCoinPackages(filters?: PackageFilters, sortOptions?: PackageSortOptions): Promise<GoldCoinPackage[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.packageType) queryParams.append('packageType', filters.packageType);
      if (filters.priceMin !== undefined) queryParams.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax !== undefined) queryParams.append('priceMax', filters.priceMax.toString());
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
      if (filters.isFeatured !== undefined) queryParams.append('isFeatured', filters.isFeatured.toString());
      if (filters.isPopular !== undefined) queryParams.append('isPopular', filters.isPopular.toString());
      if (filters.isBestValue !== undefined) queryParams.append('isBestValue', filters.isBestValue.toString());
      if (filters.tags) filters.tags.forEach(tag => queryParams.append('tags', tag));
    }

    if (sortOptions) {
      queryParams.append('sortBy', sortOptions.sortBy);
      if (sortOptions.limit) queryParams.append('limit', sortOptions.limit.toString());
      if (sortOptions.offset) queryParams.append('offset', sortOptions.offset.toString());
    }

    const endpoint = `/packages/gold${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiCall<GoldCoinPackage[]>(endpoint);
  }

  /**
   * Get a specific gold coin package by ID
   */
  async getGoldCoinPackage(id: string): Promise<GoldCoinPackage> {
    return this.apiCall<GoldCoinPackage>(`/packages/gold/${id}`);
  }

  /**
   * Get featured gold coin packages
   */
  async getFeaturedGoldCoinPackages(): Promise<GoldCoinPackage[]> {
    return this.apiCall<GoldCoinPackage[]>('/packages/gold/featured');
  }

  /**
   * Get popular gold coin packages
   */
  async getPopularGoldCoinPackages(): Promise<GoldCoinPackage[]> {
    return this.apiCall<GoldCoinPackage[]>('/packages/gold/popular');
  }

  /**
   * Create a new gold coin package (admin only)
   */
  async createGoldCoinPackage(packageData: CreatePackageRequest): Promise<GoldCoinPackage> {
    return this.apiCall<GoldCoinPackage>('/packages/gold', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  }

  /**
   * Update a gold coin package (admin only)
   */
  async updateGoldCoinPackage(id: string, packageData: Partial<CreatePackageRequest>): Promise<GoldCoinPackage> {
    return this.apiCall<GoldCoinPackage>(`/packages/gold/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });
  }

  /**
   * Delete a gold coin package (admin only)
   */
  async deleteGoldCoinPackage(id: string): Promise<void> {
    return this.apiCall<void>(`/packages/gold/${id}`, {
      method: 'DELETE',
    });
  }

  // Sweeps Coin Packages

  /**
   * Get all sweeps coin packages
   */
  async getSweepsCoinPackages(filters?: PackageFilters, sortOptions?: PackageSortOptions): Promise<SweepsCoinPackage[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.packageType) queryParams.append('packageType', filters.packageType);
      if (filters.priceMin !== undefined) queryParams.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax !== undefined) queryParams.append('priceMax', filters.priceMax.toString());
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
      if (filters.isFeatured !== undefined) queryParams.append('isFeatured', filters.isFeatured.toString());
      if (filters.tags) filters.tags.forEach(tag => queryParams.append('tags', tag));
    }

    if (sortOptions) {
      queryParams.append('sortBy', sortOptions.sortBy);
      if (sortOptions.limit) queryParams.append('limit', sortOptions.limit.toString());
      if (sortOptions.offset) queryParams.append('offset', sortOptions.offset.toString());
    }

    const endpoint = `/packages/sweeps${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiCall<SweepsCoinPackage[]>(endpoint);
  }

  /**
   * Get a specific sweeps coin package by ID
   */
  async getSweepsCoinPackage(id: string): Promise<SweepsCoinPackage> {
    return this.apiCall<SweepsCoinPackage>(`/packages/sweeps/${id}`);
  }

  /**
   * Create a new sweeps coin package (admin only)
   */
  async createSweepsCoinPackage(packageData: CreatePackageRequest): Promise<SweepsCoinPackage> {
    return this.apiCall<SweepsCoinPackage>('/packages/sweeps', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  }

  /**
   * Update a sweeps coin package (admin only)
   */
  async updateSweepsCoinPackage(id: string, packageData: Partial<CreatePackageRequest>): Promise<SweepsCoinPackage> {
    return this.apiCall<SweepsCoinPackage>(`/packages/sweeps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });
  }

  /**
   * Delete a sweeps coin package (admin only)
   */
  async deleteSweepsCoinPackage(id: string): Promise<void> {
    return this.apiCall<void>(`/packages/sweeps/${id}`, {
      method: 'DELETE',
    });
  }

  // Package Analytics

  /**
   * Get package sales statistics
   */
  async getPackageStats(): Promise<PackageStats> {
    return this.apiCall<PackageStats>('/packages/stats');
  }

  /**
   * Get user's purchase count for a specific package
   */
  async getUserPackagePurchaseCount(packageId: string): Promise<number> {
    return this.apiCall<{ count: number }>(`/packages/${packageId}/user-purchases`)
      .then(response => response.count);
  }

  /**
   * Get user's purchase history
   */
  async getUserPurchaseHistory(limit?: number, offset?: number): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());

    const endpoint = `/packages/purchase-history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiCall<any[]>(endpoint);
  }

  // Package Management Utilities

  /**
   * Reorder packages (admin only)
   */
  async reorderPackages(packageIds: string[], packageType: 'gold' | 'sweeps'): Promise<void> {
    return this.apiCall<void>(`/packages/${packageType}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ packageIds }),
    });
  }

  /**
   * Bulk update package status (admin only)
   */
  async bulkUpdatePackages(packageIds: string[], updates: Partial<CreatePackageRequest>, packageType: 'gold' | 'sweeps'): Promise<void> {
    return this.apiCall<void>(`/packages/${packageType}/bulk-update`, {
      method: 'PUT',
      body: JSON.stringify({ packageIds, updates }),
    });
  }

  /**
   * Get package analytics for admin
   */
  async getPackageAnalytics(packageId: string, startDate?: string, endDate?: string): Promise<{
    totalSales: number;
    totalRevenue: number;
    conversionRate: number;
    salesByDay: Array<{ date: string; sales: number; revenue: number }>;
  }> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const endpoint = `/packages/${packageId}/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiCall(endpoint);
  }

  // Search and Discovery

  /**
   * Search packages across all types
   */
  async searchPackages(query: string, filters?: {
    packageType?: 'gold' | 'sweeps' | 'all';
    priceRange?: { min: number; max: number };
    includeInactive?: boolean;
  }): Promise<{
    goldPackages: GoldCoinPackage[];
    sweepsPackages: SweepsCoinPackage[];
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (filters) {
      if (filters.packageType && filters.packageType !== 'all') {
        queryParams.append('type', filters.packageType);
      }
      if (filters.priceRange) {
        queryParams.append('priceMin', filters.priceRange.min.toString());
        queryParams.append('priceMax', filters.priceRange.max.toString());
      }
      if (filters.includeInactive) {
        queryParams.append('includeInactive', 'true');
      }
    }

    return this.apiCall<{
      goldPackages: GoldCoinPackage[];
      sweepsPackages: SweepsCoinPackage[];
    }>(`/packages/search?${queryParams.toString()}`);
  }

  /**
   * Get package recommendations for user
   */
  async getPackageRecommendations(): Promise<{
    recommended: GoldCoinPackage[];
    trending: GoldCoinPackage[];
    similar: GoldCoinPackage[];
  }> {
    return this.apiCall<{
      recommended: GoldCoinPackage[];
      trending: GoldCoinPackage[];
      similar: GoldCoinPackage[];
    }>('/packages/recommendations');
  }

  // Admin Helpers

  /**
   * Import packages from CSV (admin only)
   */
  async importPackagesFromCSV(file: File, packageType: 'gold' | 'sweeps'): Promise<{
    imported: number;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('packageType', packageType);

    const token = authService.getToken();
    const response = await fetch(`${this.baseUrl}/packages/import`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Export packages to CSV (admin only)
   */
  async exportPackagesToCSV(packageType: 'gold' | 'sweeps', filters?: PackageFilters): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('format', 'csv');
    
    if (filters) {
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.packageType) queryParams.append('packageType', filters.packageType);
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    }

    const token = authService.getToken();
    const response = await fetch(`${this.baseUrl}/packages/${packageType}/export?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  }

  // Cache Management

  /**
   * Clear package cache
   */
  clearCache(): void {
    // Clear any local caching if implemented
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('packages_cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  /**
   * Prefetch popular packages for better performance
   */
  async prefetchPopularPackages(): Promise<void> {
    try {
      await Promise.all([
        this.getFeaturedGoldCoinPackages(),
        this.getPopularGoldCoinPackages(),
      ]);
    } catch (error) {
      console.warn('Failed to prefetch packages:', error);
    }
  }
}

export const packageService = PackageService.getInstance();
