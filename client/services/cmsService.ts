export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: CmsContent[];
  metadata: {
    description: string;
    keywords: string[];
    author: string;
    publishDate: Date;
    lastModified: Date;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    template: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImage?: string;
    schemaMarkup?: string;
  };
  settings: {
    showInNavigation: boolean;
    requireAuth: boolean;
    allowComments: boolean;
    enableLiveChat: boolean;
  };
}

export interface CmsContent {
  id: string;
  type: 'text' | 'image' | 'video' | 'component' | 'code' | 'gallery' | 'form' | 'embed';
  data: any;
  style: {
    className?: string;
    customCSS?: string;
    layout?: 'full' | 'container' | 'narrow';
    spacing?: 'none' | 'small' | 'medium' | 'large';
  };
  order: number;
  isVisible: boolean;
}

export interface CmsTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'page' | 'component' | 'layout' | 'form';
  structure: CmsContent[];
  variables: {
    [key: string]: {
      type: 'text' | 'image' | 'color' | 'number' | 'boolean';
      default: any;
      label: string;
    };
  };
}

export interface CmsAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  folder: string;
  uploadDate: Date;
  uploadedBy: string;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    dimensions?: string;
  };
}

export interface CmsForm {
  id: string;
  name: string;
  title: string;
  description?: string;
  fields: CmsFormField[];
  settings: {
    submitText: string;
    successMessage: string;
    errorMessage: string;
    emailNotifications: boolean;
    notificationEmail?: string;
    requireCaptcha: boolean;
    storeSubmissions: boolean;
  };
  submissions: CmsFormSubmission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CmsFormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  order: number;
}

export interface CmsFormSubmission {
  id: string;
  formId: string;
  data: { [fieldId: string]: any };
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  processed: boolean;
}

export interface CmsMenuItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  order: number;
  parentId?: string;
  target: '_self' | '_blank';
  isVisible: boolean;
  requireAuth: boolean;
  children?: CmsMenuItem[];
}

export interface CmsSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  defaultLanguage: string;
  timezone: string;
  maintenance: {
    enabled: boolean;
    message: string;
    allowedIPs: string[];
  };
  analytics: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    customScripts: string[];
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    discord?: string;
  };
  cache: {
    enabled: boolean;
    ttl: number;
    strategy: 'memory' | 'redis' | 'file';
  };
}

class CmsService {
  private static instance: CmsService;
  private pages: Map<string, CmsPage> = new Map();
  private templates: Map<string, CmsTemplate> = new Map();
  private assets: Map<string, CmsAsset> = new Map();
  private forms: Map<string, CmsForm> = new Map();
  private navigation: CmsMenuItem[] = [];
  private settings: CmsSettings;
  private listeners: Set<() => void> = new Set();

  static getInstance(): CmsService {
    if (!CmsService.instance) {
      CmsService.instance = new CmsService();
    }
    return CmsService.instance;
  }

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Initialize default settings
    this.settings = {
      siteName: 'CoinKrazy',
      siteDescription: 'The Ultimate Sweepstakes Casino Platform',
      siteUrl: 'https://coinkrazy.com',
      logo: '/logo.png',
      favicon: '/favicon.ico',
      defaultLanguage: 'en',
      timezone: 'UTC',
      maintenance: {
        enabled: false,
        message: 'Site is under maintenance. Please check back soon.',
        allowedIPs: []
      },
      analytics: {
        customScripts: []
      },
      social: {
        twitter: '@CoinKrazy',
        discord: 'discord.gg/coinkrazy'
      },
      cache: {
        enabled: true,
        ttl: 3600,
        strategy: 'memory'
      }
    };

    // Create default templates
    this.createDefaultTemplates();
    
    // Create default pages
    this.createDefaultPages();
    
    // Setup default navigation
    this.setupDefaultNavigation();
  }

  private createDefaultTemplates() {
    const landingPageTemplate: CmsTemplate = {
      id: 'landing-page',
      name: 'Landing Page',
      description: 'Hero section with CTA buttons',
      preview: '/templates/landing-page.jpg',
      category: 'page',
      structure: [
        {
          id: 'hero-section',
          type: 'component',
          data: {
            component: 'HeroSection',
            props: {
              title: '{{heroTitle}}',
              subtitle: '{{heroSubtitle}}',
              backgroundImage: '{{heroBackground}}',
              ctaText: '{{ctaText}}',
              ctaUrl: '{{ctaUrl}}'
            }
          },
          style: { layout: 'full' },
          order: 1,
          isVisible: true
        }
      ],
      variables: {
        heroTitle: { type: 'text', default: 'Welcome to CoinKrazy', label: 'Hero Title' },
        heroSubtitle: { type: 'text', default: 'Where Fun Meets Fortune', label: 'Hero Subtitle' },
        heroBackground: { type: 'image', default: '/hero-bg.jpg', label: 'Background Image' },
        ctaText: { type: 'text', default: 'Get Started', label: 'CTA Button Text' },
        ctaUrl: { type: 'text', default: '/register', label: 'CTA Button URL' }
      }
    };

    const blogPostTemplate: CmsTemplate = {
      id: 'blog-post',
      name: 'Blog Post',
      description: 'Standard blog post layout',
      preview: '/templates/blog-post.jpg',
      category: 'page',
      structure: [
        {
          id: 'post-header',
          type: 'component',
          data: {
            component: 'PostHeader',
            props: {
              title: '{{postTitle}}',
              author: '{{author}}',
              publishDate: '{{publishDate}}',
              featuredImage: '{{featuredImage}}'
            }
          },
          style: { layout: 'container' },
          order: 1,
          isVisible: true
        },
        {
          id: 'post-content',
          type: 'text',
          data: {
            content: '{{postContent}}'
          },
          style: { layout: 'narrow' },
          order: 2,
          isVisible: true
        }
      ],
      variables: {
        postTitle: { type: 'text', default: 'Blog Post Title', label: 'Post Title' },
        author: { type: 'text', default: 'Admin', label: 'Author' },
        publishDate: { type: 'text', default: new Date().toISOString(), label: 'Publish Date' },
        featuredImage: { type: 'image', default: '/blog-featured.jpg', label: 'Featured Image' },
        postContent: { type: 'text', default: 'Blog post content goes here...', label: 'Post Content' }
      }
    };

    this.templates.set(landingPageTemplate.id, landingPageTemplate);
    this.templates.set(blogPostTemplate.id, blogPostTemplate);
  }

  private createDefaultPages() {
    const homePage: CmsPage = {
      id: 'home',
      title: 'Home',
      slug: '/',
      content: [
        {
          id: 'hero-1',
          type: 'component',
          data: {
            component: 'HeroSection',
            props: {
              title: 'CoinKrazy - Where Fun Meets Fortune',
              subtitle: 'Experience the ultimate sweepstakes casino',
              ctaText: 'Play Now',
              ctaUrl: '/games'
            }
          },
          style: { layout: 'full', spacing: 'none' },
          order: 1,
          isVisible: true
        }
      ],
      metadata: {
        description: 'CoinKrazy - The ultimate sweepstakes casino platform with real cash prizes',
        keywords: ['casino', 'sweepstakes', 'games', 'prizes'],
        author: 'CoinKrazy Team',
        publishDate: new Date(),
        lastModified: new Date(),
        status: 'published',
        featured: true,
        template: 'landing-page'
      },
      seo: {
        metaTitle: 'CoinKrazy - Ultimate Sweepstakes Casino',
        metaDescription: 'Play casino games and win real cash prizes at CoinKrazy',
        ogImage: '/og-image.jpg'
      },
      settings: {
        showInNavigation: true,
        requireAuth: false,
        allowComments: false,
        enableLiveChat: true
      }
    };

    this.pages.set(homePage.id, homePage);
  }

  private setupDefaultNavigation() {
    this.navigation = [
      {
        id: 'nav-home',
        label: 'Home',
        url: '/',
        order: 1,
        target: '_self',
        isVisible: true,
        requireAuth: false
      },
      {
        id: 'nav-games',
        label: 'Games',
        url: '/games',
        order: 2,
        target: '_self',
        isVisible: true,
        requireAuth: false
      },
      {
        id: 'nav-store',
        label: 'Store',
        url: '/store',
        order: 3,
        target: '_self',
        isVisible: true,
        requireAuth: false
      }
    ];
  }

  // Page Management
  createPage(pageData: Omit<CmsPage, 'id' | 'metadata'> & { metadata?: Partial<CmsPage['metadata']> }): string {
    const id = `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const page: CmsPage = {
      ...pageData,
      id,
      metadata: {
        description: pageData.metadata?.description || '',
        keywords: pageData.metadata?.keywords || [],
        author: pageData.metadata?.author || 'Admin',
        publishDate: pageData.metadata?.publishDate || new Date(),
        lastModified: new Date(),
        status: pageData.metadata?.status || 'draft',
        featured: pageData.metadata?.featured || false,
        template: pageData.metadata?.template || 'default'
      }
    };

    this.pages.set(id, page);
    this.notifyListeners();
    return id;
  }

  updatePage(id: string, updates: Partial<CmsPage>): boolean {
    const page = this.pages.get(id);
    if (!page) return false;

    const updatedPage = {
      ...page,
      ...updates,
      metadata: {
        ...page.metadata,
        ...updates.metadata,
        lastModified: new Date()
      }
    };

    this.pages.set(id, updatedPage);
    this.notifyListeners();
    return true;
  }

  deletePage(id: string): boolean {
    const success = this.pages.delete(id);
    if (success) {
      this.notifyListeners();
    }
    return success;
  }

  getPage(id: string): CmsPage | undefined {
    return this.pages.get(id);
  }

  getPageBySlug(slug: string): CmsPage | undefined {
    return Array.from(this.pages.values()).find(page => page.slug === slug);
  }

  getAllPages(): CmsPage[] {
    return Array.from(this.pages.values()).sort((a, b) => 
      b.metadata.lastModified.getTime() - a.metadata.lastModified.getTime()
    );
  }

  getPublishedPages(): CmsPage[] {
    return this.getAllPages().filter(page => page.metadata.status === 'published');
  }

  // Template Management
  createTemplate(template: Omit<CmsTemplate, 'id'>): string {
    const id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.templates.set(id, { ...template, id });
    this.notifyListeners();
    return id;
  }

  getTemplate(id: string): CmsTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): CmsTemplate[] {
    return Array.from(this.templates.values());
  }

  // Asset Management
  uploadAsset(file: File, folder: string = 'uploads'): Promise<CmsAsset> {
    return new Promise((resolve) => {
      // Simulate file upload
      const asset: CmsAsset = {
        id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: `${Date.now()}-${file.name}`,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        folder,
        uploadDate: new Date(),
        uploadedBy: 'admin',
        metadata: {}
      };

      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          asset.metadata.width = img.width;
          asset.metadata.height = img.height;
          asset.metadata.dimensions = `${img.width}x${img.height}`;
          this.assets.set(asset.id, asset);
          this.notifyListeners();
          resolve(asset);
        };
        img.src = asset.url;
      } else {
        this.assets.set(asset.id, asset);
        this.notifyListeners();
        resolve(asset);
      }
    });
  }

  getAsset(id: string): CmsAsset | undefined {
    return this.assets.get(id);
  }

  getAllAssets(folder?: string): CmsAsset[] {
    const assets = Array.from(this.assets.values());
    return folder ? assets.filter(asset => asset.folder === folder) : assets;
  }

  deleteAsset(id: string): boolean {
    const success = this.assets.delete(id);
    if (success) {
      this.notifyListeners();
    }
    return success;
  }

  // Form Management
  createForm(formData: Omit<CmsForm, 'id' | 'submissions' | 'createdAt' | 'updatedAt'>): string {
    const id = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const form: CmsForm = {
      ...formData,
      id,
      submissions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.forms.set(id, form);
    this.notifyListeners();
    return id;
  }

  submitForm(formId: string, data: { [fieldId: string]: any }): boolean {
    const form = this.forms.get(formId);
    if (!form) return false;

    const submission: CmsFormSubmission = {
      id: `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      formId,
      data,
      submittedAt: new Date(),
      processed: false
    };

    form.submissions.push(submission);
    this.notifyListeners();
    return true;
  }

  getForm(id: string): CmsForm | undefined {
    return this.forms.get(id);
  }

  getAllForms(): CmsForm[] {
    return Array.from(this.forms.values());
  }

  // Navigation Management
  updateNavigation(navigation: CmsMenuItem[]): void {
    this.navigation = navigation;
    this.notifyListeners();
  }

  getNavigation(): CmsMenuItem[] {
    return this.navigation;
  }

  // Settings Management
  updateSettings(settings: Partial<CmsSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.notifyListeners();
  }

  getSettings(): CmsSettings {
    return this.settings;
  }

  // Search and Analytics
  searchContent(query: string): CmsPage[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllPages().filter(page => 
      page.title.toLowerCase().includes(lowercaseQuery) ||
      page.metadata.description.toLowerCase().includes(lowercaseQuery) ||
      page.content.some(content => 
        JSON.stringify(content.data).toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  getContentStats(): {
    totalPages: number;
    publishedPages: number;
    draftPages: number;
    totalAssets: number;
    totalForms: number;
    totalFormSubmissions: number;
  } {
    const pages = this.getAllPages();
    const publishedPages = pages.filter(p => p.metadata.status === 'published');
    const draftPages = pages.filter(p => p.metadata.status === 'draft');
    const forms = this.getAllForms();
    const totalSubmissions = forms.reduce((sum, form) => sum + form.submissions.length, 0);

    return {
      totalPages: pages.length,
      publishedPages: publishedPages.length,
      draftPages: draftPages.length,
      totalAssets: this.assets.size,
      totalForms: forms.length,
      totalFormSubmissions: totalSubmissions
    };
  }

  // Event System
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  // Export/Import
  exportData(): {
    pages: CmsPage[];
    templates: CmsTemplate[];
    assets: CmsAsset[];
    forms: CmsForm[];
    navigation: CmsMenuItem[];
    settings: CmsSettings;
  } {
    return {
      pages: this.getAllPages(),
      templates: this.getAllTemplates(),
      assets: this.getAllAssets(),
      forms: this.getAllForms(),
      navigation: this.getNavigation(),
      settings: this.getSettings()
    };
  }

  importData(data: Partial<ReturnType<typeof this.exportData>>): void {
    if (data.pages) {
      data.pages.forEach(page => this.pages.set(page.id, page));
    }
    if (data.templates) {
      data.templates.forEach(template => this.templates.set(template.id, template));
    }
    if (data.assets) {
      data.assets.forEach(asset => this.assets.set(asset.id, asset));
    }
    if (data.forms) {
      data.forms.forEach(form => this.forms.set(form.id, form));
    }
    if (data.navigation) {
      this.navigation = data.navigation;
    }
    if (data.settings) {
      this.settings = { ...this.settings, ...data.settings };
    }
    this.notifyListeners();
  }
}

export const cmsService = CmsService.getInstance();
