import { useToast } from "@/hooks/use-toast";

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: CMSContent[];
  meta: {
    description: string;
    keywords: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  };
  status: "draft" | "published" | "archived" | "scheduled";
  publishedAt?: Date;
  scheduledFor?: Date;
  author: {
    id: string;
    name: string;
    email: string;
  };
  template: string;
  settings: {
    showInNav: boolean;
    requireAuth: boolean;
    allowComments: boolean;
    enableSharing: boolean;
    customCSS?: string;
    customJS?: string;
  };
  analytics: {
    views: number;
    lastViewed?: Date;
    conversionRate?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  version: number;
  parentId?: string;
  sortOrder: number;
}

export interface CMSContent {
  id: string;
  type:
    | "text"
    | "heading"
    | "image"
    | "video"
    | "button"
    | "form"
    | "html"
    | "spacer"
    | "divider"
    | "gallery"
    | "testimonial"
    | "faq"
    | "pricing"
    | "hero"
    | "features";
  data: Record<string, any>;
  styles: {
    margin?: string;
    padding?: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    borderRadius?: string;
    boxShadow?: string;
    customCSS?: string;
  };
  responsive: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  animation?: {
    type: string;
    duration: number;
    delay: number;
  };
  order: number;
}

export interface CMSMedia {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  caption?: string;
  folder: string;
  tags: string[];
  createdAt: Date;
  uploadedBy: string;
  dimensions?: {
    width: number;
    height: number;
  };
  seoData?: {
    title: string;
    description: string;
  };
}

export interface CMSTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: "page" | "blog" | "landing" | "product" | "legal";
  structure: CMSContent[];
  isDefault: boolean;
  isCustom: boolean;
  createdAt: Date;
}

export interface CMSForm {
  id: string;
  name: string;
  description?: string;
  fields: CMSFormField[];
  settings: {
    submitText: string;
    redirectUrl?: string;
    emailNotifications: boolean;
    notificationEmail?: string;
    captcha: boolean;
    doubleOptIn: boolean;
  };
  submissions: CMSFormSubmission[];
  createdAt: Date;
  isActive: boolean;
}

export interface CMSFormField {
  id: string;
  label: string;
  type:
    | "text"
    | "email"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "file"
    | "date"
    | "number"
    | "phone";
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    errorMessage?: string;
  };
  order: number;
}

export interface CMSFormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  userAgent: string;
  ipAddress: string;
  submittedAt: Date;
  status: "new" | "read" | "processed" | "spam";
}

export interface CMSNavigation {
  id: string;
  name: string;
  items: CMSNavigationItem[];
  location: "header" | "footer" | "sidebar";
  isActive: boolean;
}

export interface CMSNavigationItem {
  id: string;
  label: string;
  url: string;
  type: "page" | "external" | "dropdown";
  children?: CMSNavigationItem[];
  target?: "_blank" | "_self";
  cssClass?: string;
  order: number;
  isVisible: boolean;
}

export interface CMSRedirect {
  id: string;
  from: string;
  to: string;
  type: 301 | 302;
  isActive: boolean;
  createdAt: Date;
  hits: number;
}

export interface CMSAnalytics {
  pageId: string;
  date: Date;
  views: number;
  uniqueViews: number;
  bounceRate: number;
  avgTimeOnPage: number;
  conversionEvents: number;
  traffic: {
    organic: number;
    direct: number;
    referral: number;
    social: number;
    paid: number;
  };
}

class CMSService {
  private static instance: CMSService;
  private baseUrl = "/api/cms";

  public static getInstance(): CMSService {
    if (!CMSService.instance) {
      CMSService.instance = new CMSService();
    }
    return CMSService.instance;
  }

  // Helper method to safely parse JSON responses
  private async safeJsonParse(response: Response): Promise<any> {
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.warn("Response is not JSON, content-type:", contentType);
      throw new Error("Response is not JSON");
    }
    return await response.json();
  }

  // Helper method to create fetch with timeout
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Pages Management
  async getAllPages(): Promise<CMSPage[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/pages`);
      if (!response.ok) {
        console.warn(`Pages API returned ${response.status}, using mock data`);
        return this.getMockPages();
      }
      return await this.safeJsonParse(response);
    } catch (error) {
      console.warn("Error fetching pages, using mock data:", error);
      return this.getMockPages();
    }
  }

  async getPage(id: string): Promise<CMSPage | null> {
    try {
      const response = await fetch(`${this.baseUrl}/pages/${id}`);
      if (!response.ok) throw new Error("Failed to fetch page");
      return await this.safeJsonParse(response);
    } catch (error) {
      console.error("Error fetching page:", error);
      const mockPages = this.getMockPages();
      return mockPages.find((p) => p.id === id) || null;
    }
  }

  async createPage(
    page: Omit<CMSPage, "id" | "createdAt" | "updatedAt" | "version">,
  ): Promise<CMSPage> {
    try {
      const response = await fetch(`${this.baseUrl}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      if (!response.ok) throw new Error("Failed to create page");
      return await this.safeJsonParse(response);
    } catch (error) {
      console.error("Error creating page:", error);
      // Return mock created page
      return {
        ...page,
        id: `page_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      } as CMSPage;
    }
  }

  async updatePage(id: string, updates: Partial<CMSPage>): Promise<CMSPage> {
    try {
      const response = await fetch(`${this.baseUrl}/pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update page");
      return await this.safeJsonParse(response);
    } catch (error) {
      console.error("Error updating page:", error);
      throw error;
    }
  }

  async deletePage(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/pages/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete page");
    } catch (error) {
      console.error("Error deleting page:", error);
      throw error;
    }
  }

  async publishPage(id: string): Promise<CMSPage> {
    return this.updatePage(id, {
      status: "published",
      publishedAt: new Date(),
    });
  }

  async duplicatePage(id: string): Promise<CMSPage> {
    const page = await this.getPage(id);
    if (!page) throw new Error("Page not found");

    return this.createPage({
      ...page,
      title: `${page.title} (Copy)`,
      slug: `${page.slug}-copy`,
      status: "draft",
      publishedAt: undefined,
    });
  }

  // Media Management
  async uploadMedia(file: File, folder: string = "general"): Promise<CMSMedia> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch(`${this.baseUrl}/media/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload media");
      return await this.safeJsonParse(response);
    } catch (error) {
      console.error("Error uploading media:", error);
      // Return mock media object
      return {
        id: `media_${Date.now()}`,
        filename: `${Date.now()}_${file.name}`,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        alt: file.name,
        folder,
        tags: [],
        createdAt: new Date(),
        uploadedBy: "admin@coinkrazy.com",
      };
    }
  }

  async getAllMedia(): Promise<CMSMedia[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/media`);
      if (!response.ok) {
        console.warn(`Media API returned ${response.status}, using mock data`);
        return this.getMockMedia();
      }
      return await this.safeJsonParse(response);
    } catch (error) {
      console.warn("Error fetching media, using mock data:", error);
      return this.getMockMedia();
    }
  }

  async deleteMedia(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/media/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete media");
    } catch (error) {
      console.error("Error deleting media:", error);
      throw error;
    }
  }

  // Templates Management
  async getAllTemplates(): Promise<CMSTemplate[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/templates`);
      if (!response.ok) {
        console.warn(`Templates API returned ${response.status}, using mock data`);
        return this.getMockTemplates();
      }
      return await this.safeJsonParse(response);
    } catch (error) {
      console.warn("Error fetching templates, using mock data:", error);
      return this.getMockTemplates();
    }
  }

  // Forms Management
  async getAllForms(): Promise<CMSForm[]> {
    try {
      const response = await fetch(`${this.baseUrl}/forms`);
      if (!response.ok) throw new Error("Failed to fetch forms");
      return await this.safeJsonParse(response);
    } catch (error) {
      console.error("Error fetching forms:", error);
      return this.getMockForms();
    }
  }

  async createForm(
    form: Omit<CMSForm, "id" | "createdAt" | "submissions">,
  ): Promise<CMSForm> {
    try {
      const response = await fetch(`${this.baseUrl}/forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Failed to create form");
      return await this.safeJsonParse(response);
    } catch (error) {
      console.error("Error creating form:", error);
      return {
        ...form,
        id: `form_${Date.now()}`,
        createdAt: new Date(),
        submissions: [],
      } as CMSForm;
    }
  }

  // Navigation Management
  async getAllNavigations(): Promise<CMSNavigation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/navigation`);
      if (!response.ok) throw new Error("Failed to fetch navigations");
      return await this.safeJsonParse(response);
    } catch (error) {
      console.error("Error fetching navigations:", error);
      return this.getMockNavigations();
    }
  }

  async updateNavigation(
    id: string,
    navigation: Partial<CMSNavigation>,
  ): Promise<CMSNavigation> {
    try {
      const response = await fetch(`${this.baseUrl}/navigation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(navigation),
      });
      if (!response.ok) throw new Error("Failed to update navigation");
      return await this.safeJsonParse(response);
    } catch (error) {
      console.error("Error updating navigation:", error);
      throw error;
    }
  }

  // Redirects Management
  async getAllRedirects(): Promise<CMSRedirect[]> {
    try {
      const response = await fetch(`${this.baseUrl}/redirects`);
      if (!response.ok) throw new Error("Failed to fetch redirects");
      return await this.safeJsonParse(response);
    } catch (error) {
      console.error("Error fetching redirects:", error);
      return this.getMockRedirects();
    }
  }

  async createRedirect(
    redirect: Omit<CMSRedirect, "id" | "createdAt" | "hits">,
  ): Promise<CMSRedirect> {
    try {
      const response = await fetch(`${this.baseUrl}/redirects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(redirect),
      });
      if (!response.ok) throw new Error("Failed to create redirect");
      return await this.safeJsonParse(response);
    } catch (error) {
      console.error("Error creating redirect:", error);
      return {
        ...redirect,
        id: `redirect_${Date.now()}`,
        createdAt: new Date(),
        hits: 0,
      } as CMSRedirect;
    }
  }

  // Analytics
  async getPageAnalytics(
    pageId: string,
    days: number = 30,
  ): Promise<CMSAnalytics[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/analytics/${pageId}?days=${days}`,
      );
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return await this.safeJsonParse(response);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return this.getMockAnalytics(pageId, days);
    }
  }

  // SEO Tools
  async generateSitemap(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/seo/sitemap`);
      if (!response.ok) throw new Error("Failed to generate sitemap");
      return await response.text();
    } catch (error) {
      console.error("Error generating sitemap:", error);
      return this.getMockSitemap();
    }
  }

  async optimizeSEO(
    pageId: string,
  ): Promise<{ score: number; suggestions: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/seo/analyze/${pageId}`);
      if (!response.ok) throw new Error("Failed to analyze SEO");
      return await this.safeJsonParse(response);
    } catch (error) {
      console.error("Error analyzing SEO:", error);
      return {
        score: 85,
        suggestions: [
          "Add alt text to images",
          "Optimize meta description length",
          "Include more internal links",
        ],
      };
    }
  }

  // Mock data for development (real production API calls above)
  private getMockPages(): CMSPage[] {
    return [
      {
        id: "home",
        title: "Home Page",
        slug: "home",
        content: [
          {
            id: "hero_1",
            type: "hero",
            data: {
              title: "Welcome to CoinKrazy Casino",
              subtitle:
                "Experience the thrill of winning with our premium casino games",
              buttonText: "Play Now",
              buttonUrl: "/games",
              backgroundImage: "/images/hero-bg.jpg",
            },
            styles: {
              textAlign: "center",
              padding: "80px 20px",
              backgroundColor: "#1a1a2e",
            },
            responsive: { desktop: true, tablet: true, mobile: true },
            order: 1,
          },
        ],
        meta: {
          description:
            "Premium online casino with slots, table games, and live dealers. Win big at CoinKrazy!",
          keywords: [
            "casino",
            "online gambling",
            "slots",
            "poker",
            "blackjack",
          ],
          ogTitle: "CoinKrazy Casino - Premium Online Gaming",
          ogDescription:
            "Experience premium online casino gaming with the best slots and table games.",
          ogImage: "/images/og-home.jpg",
        },
        status: "published",
        publishedAt: new Date("2024-01-01"),
        author: {
          id: "admin_1",
          name: "Admin User",
          email: "admin@coinkrazy.com",
        },
        template: "home-template",
        settings: {
          showInNav: true,
          requireAuth: false,
          allowComments: false,
          enableSharing: true,
        },
        analytics: {
          views: 15420,
          lastViewed: new Date(),
          conversionRate: 3.2,
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
        version: 5,
        sortOrder: 1,
      },
    ];
  }

  private getMockMedia(): CMSMedia[] {
    return [
      {
        id: "media_1",
        filename: "hero-bg.jpg",
        originalName: "casino-hero-background.jpg",
        mimeType: "image/jpeg",
        size: 2048576,
        url: "/images/hero-bg.jpg",
        thumbnailUrl: "/images/thumbs/hero-bg.jpg",
        alt: "Casino hero background",
        caption: "Main hero section background image",
        folder: "backgrounds",
        tags: ["hero", "background", "casino"],
        createdAt: new Date("2024-01-01"),
        uploadedBy: "admin@coinkrazy.com",
        dimensions: { width: 1920, height: 1080 },
        seoData: {
          title: "Casino Hero Background",
          description: "High-quality casino background image for hero sections",
        },
      },
    ];
  }

  private getMockTemplates(): CMSTemplate[] {
    return [
      {
        id: "home-template",
        name: "Home Page Template",
        description:
          "Default template for casino home page with hero section and features",
        thumbnail: "/images/templates/home-template.jpg",
        category: "page",
        structure: [],
        isDefault: true,
        isCustom: false,
        createdAt: new Date("2024-01-01"),
      },
    ];
  }

  private getMockForms(): CMSForm[] {
    return [
      {
        id: "contact_form",
        name: "Contact Form",
        description: "Main contact form for customer inquiries",
        fields: [
          {
            id: "name",
            label: "Full Name",
            type: "text",
            required: true,
            placeholder: "Enter your full name",
            order: 1,
          },
          {
            id: "email",
            label: "Email Address",
            type: "email",
            required: true,
            placeholder: "Enter your email",
            validation: {
              pattern: "^[^@]+@[^@]+\\.[^@]+$",
              errorMessage: "Please enter a valid email address",
            },
            order: 2,
          },
        ],
        settings: {
          submitText: "Send Message",
          emailNotifications: true,
          notificationEmail: "support@coinkrazy.com",
          captcha: true,
          doubleOptIn: false,
        },
        submissions: [],
        createdAt: new Date("2024-01-01"),
        isActive: true,
      },
    ];
  }

  private getMockNavigations(): CMSNavigation[] {
    return [
      {
        id: "main_nav",
        name: "Main Navigation",
        items: [
          {
            id: "nav_home",
            label: "Home",
            url: "/",
            type: "page",
            order: 1,
            isVisible: true,
          },
          {
            id: "nav_games",
            label: "Games",
            url: "/games",
            type: "page",
            order: 2,
            isVisible: true,
          },
        ],
        location: "header",
        isActive: true,
      },
    ];
  }

  private getMockRedirects(): CMSRedirect[] {
    return [
      {
        id: "redirect_1",
        from: "/old-games",
        to: "/games",
        type: 301,
        isActive: true,
        createdAt: new Date("2024-01-01"),
        hits: 156,
      },
    ];
  }

  private getMockAnalytics(pageId: string, days: number): CMSAnalytics[] {
    const analytics: CMSAnalytics[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      analytics.push({
        pageId,
        date,
        views: Math.floor(Math.random() * 1000) + 100,
        uniqueViews: Math.floor(Math.random() * 800) + 80,
        bounceRate: Math.random() * 50 + 20,
        avgTimeOnPage: Math.random() * 300 + 60,
        conversionEvents: Math.floor(Math.random() * 50),
        traffic: {
          organic: Math.floor(Math.random() * 400) + 50,
          direct: Math.floor(Math.random() * 300) + 30,
          referral: Math.floor(Math.random() * 200) + 20,
          social: Math.floor(Math.random() * 150) + 10,
          paid: Math.floor(Math.random() * 100) + 5,
        },
      });
    }
    return analytics;
  }

  private getMockSitemap(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://coinkrazy.com/</loc>
    <lastmod>2024-01-20</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://coinkrazy.com/games</loc>
    <lastmod>2024-01-20</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  }
}

export const cmsService = CMSService.getInstance();
