import { projectId, publicAnonKey } from './supabase/info';
import { supabase } from './supabase/client';

// Re-export supabase client for backwards compatibility
export { supabase };

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0ba58e95`;

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    // Si hay error de refresh token, limpiar la sesión
    if (error) {
      console.warn('Session error, clearing invalid session:', error.message);
      await supabase.auth.signOut();
      return null;
    }
    
    return data.session?.access_token || null;
  } catch (error) {
    console.warn('Error getting auth token:', error);
    // Intentar limpiar sesión corrupta
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignorar errores al hacer signOut
    }
    return null;
  }
}

// Generic API call helper
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add auth token if available (only add header if token exists)
  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // For public endpoints, use the public anon key
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// ==================== CONTENT API ====================

export const contentAPI = {
  // Get all content items
  async getItems(type?: 'class' | 'workshop') {
    const query = type ? `?type=${type}` : '';
    return apiCall(`/content/items${query}`);
  },

  // Get all content items (alias for compatibility)
  async getAllItems() {
    return this.getItems();
  },

  // Get single content item
  async getItem(id: string) {
    return apiCall(`/content/items/${id}`);
  },

  // Create content item
  async createItem(item: any) {
    return apiCall('/content/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  // Update content item
  async updateItem(id: string, item: any) {
    return apiCall(`/content/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  // Create or update content item
  async saveItem(item: any) {
    if (item.id) {
      return this.updateItem(item.id, item);
    } else {
      return this.createItem(item);
    }
  },

  // Delete content item
  async deleteItem(id: string) {
    return apiCall(`/content/items/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== BLOG API ====================

export const blogAPI = {
  // Get all blog posts
  async getPosts(publishedOnly = false) {
    const query = publishedOnly ? '?published=true' : '';
    return apiCall(`/blog/posts${query}`);
  },

  // Get single blog post
  async getPost(slug: string) {
    return apiCall(`/blog/posts/${slug}`);
  },

  // Create or update blog post
  async savePost(post: any) {
    return apiCall('/blog/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  },

  // Delete blog post
  async deletePost(slug: string) {
    return apiCall(`/blog/posts/${slug}`, {
      method: 'DELETE',
    });
  },
};

// ==================== SETTINGS API ====================

export const settingsAPI = {
  // Get site settings
  async getSettings() {
    return apiCall('/settings');
  },

  // Update site settings
  async saveSettings(settings: any) {
    return apiCall('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },
};

// ==================== MENU API ====================

export const menuAPI = {
  // Get menu structure
  async getMenu() {
    return apiCall('/menu');
  },

  // Update menu structure
  async saveMenu(menu: any) {
    return apiCall('/menu', {
      method: 'POST',
      body: JSON.stringify(menu),
    });
  },
};

// ==================== UPLOAD API ====================

export const uploadAPI = {
  // Upload image
  async uploadImage(file: File) {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Upload error: ${response.status}`);
    }

    return response.json();
  },

  // Get all uploaded images
  async getImages() {
    return apiCall('/upload/images');
  },

  // Get all images with metadata
  async getImagesWithMetadata() {
    return apiCall('/images');
  },

  // Delete image
  async deleteImage(fileName: string) {
    return apiCall(`/images/${fileName}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PAGES API ====================

export const pagesAPI = {
  // Get all pages
  async getPages() {
    return apiCall('/pages');
  },

  // Get all pages (alias for compatibility)
  async getAllPages() {
    return this.getPages();
  },

  // Get page by slug
  async getPage(slug: string) {
    return apiCall(`/pages/${slug}`);
  },

  // Create page
  async createPage(page: any) {
    return this.savePage(page.slug, page);
  },

  // Update page
  async updatePage(id: string, page: any) {
    return this.savePage(page.slug, page);
  },

  // Delete page
  async deletePage(slug: string) {
    return apiCall(`/pages/${slug}`, {
      method: 'DELETE',
    });
  },

  // Create/Update page
  async savePage(slug: string, page: any) {
    return apiCall(`/pages/${slug}`, {
      method: 'POST',
      body: JSON.stringify(page),
    });
  },

  // Initialize default content
  async initialize() {
    return apiCall('/initialize', {
      method: 'POST',
    });
  },
};

// ==================== INITIALIZATION API ====================

export const initAPI = {
  // Initialize default content
  async initializeContent() {
    return apiCall('/initialize', {
      method: 'POST',
    });
  },

  // Initialize only classes
  async initializeClasses() {
    return apiCall('/initialize-classes', {
      method: 'POST',
    });
  },

  // Initialize only workshops
  async initializeWorkshops() {
    return apiCall('/initialize-workshops', {
      method: 'POST',
    });
  },
};

// ==================== AUTH API ====================

export const authAPI = {
  // Sign up
  async signUp(email: string, password: string, name: string) {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  // Sign in (using Supabase directly)
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const session = await this.getSession();
    return !!session;
  },
};

// ==================== USER MANAGEMENT API ====================

export const userAPI = {
  // Get all users (requires super_admin)
  async getAllUsers() {
    return apiCall('/users');
  },

  // Get current user info
  async getCurrentUser() {
    return apiCall('/users/me');
  },

  // Create user (requires super_admin)
  async createUser(userData: any) {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update user (requires super_admin)
  async updateUser(id: string, userData: any) {
    return apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Delete user (requires super_admin)
  async deleteUser(id: string) {
    return apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== MESSAGES API ====================

export const messagesAPI = {
  // Get all messages (requires auth)
  async getMessages() {
    return apiCall('/messages');
  },

  // Send message (public)
  async sendMessage(messageData: any) {
    const url = `${API_BASE_URL}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Send message error: ${response.status}`);
    }

    return response.json();
  },

  // Update message status (requires auth)
  async updateStatus(id: string, status: 'unread' | 'read' | 'archived') {
    return apiCall(`/messages/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Delete message (requires auth)
  async deleteMessage(id: string) {
    return apiCall(`/messages/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== HISTORY API ====================

export const historyAPI = {
  // Get version history for a content item
  async getHistory(itemId: string) {
    return apiCall(`/history/${itemId}`);
  },

  // Save a version (automatically called on content update)
  async saveVersion(itemId: string, data: any) {
    return apiCall(`/history/${itemId}/version`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Restore a specific version
  async restoreVersion(itemId: string, versionId: string) {
    return apiCall(`/history/${itemId}/restore/${versionId}`, {
      method: 'POST',
    });
  },
};