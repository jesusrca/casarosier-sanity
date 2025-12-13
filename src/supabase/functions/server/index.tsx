import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { seedClasses, seedWorkshops } from "./seed-data.tsx";
const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Initialize storage bucket
async function initializeStorage() {
  try {
    const bucketName = 'make-0ba58e95-uploads';
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('Storage service temporarily unavailable, will retry later');
      return;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      });
      
      if (error) {
        console.log('Could not create bucket (service may be temporarily unavailable)');
      } else {
        console.log('Storage bucket created successfully');
      }
    }
  } catch (error) {
    console.log('Storage initialization skipped (service temporarily unavailable)');
  }
}

// Initialize storage on startup (non-blocking)
initializeStorage().catch(() => {
  console.log('Storage initialization will be retried on first upload');
});

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Middleware to verify authenticated user
async function verifyAuth(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user?.id) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
}

// Middleware to verify super admin role
async function verifySuperAdmin(c: any, next: any) {
  const userId = c.get('userId');
  const userEmail = c.get('userEmail');
  
  if (!userId) {
    return c.json({ error: 'Unauthorized: No user ID' }, 401);
  }

  // Get user role from metadata
  let userRole = await kv.get(`user:${userId}:role`);
  
  // Migration: If user doesn't have role assigned, check if they're the first user
  if (!userRole) {
    const allUsers = await kv.getByPrefix('user:');
    const existingUsers = allUsers.filter((u: any) => u.email && u.id !== userId);
    
    // If this is the first/only user or no users have roles, make them super_admin
    const usersWithRoles = allUsers.filter((u: any) => u.role);
    if (existingUsers.length === 0 || usersWithRoles.length === 0) {
      userRole = 'super_admin';
    } else {
      userRole = 'editor';
    }
    
    // Store the role
    let userData = await kv.get(`user:${userId}`);
    if (!userData) {
      // Get user info from Supabase
      const { data: { user } } = await supabase.auth.getUser(c.req.header('Authorization')?.split(' ')[1] || '');
      userData = {
        id: userId,
        email: userEmail,
        name: user?.user_metadata?.name || userEmail?.split('@')[0] || 'Usuario',
        role: userRole,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      userData.role = userRole;
    }
    
    await kv.set(`user:${userId}`, userData);
    await kv.set(`user:${userId}:role`, userRole);
    
    console.log(`Auto-assigned role ${userRole} to user ${userEmail} in verifySuperAdmin middleware`);
  }
  
  if (userRole !== 'super_admin') {
    return c.json({ error: 'Forbidden: Super admin access required' }, 403);
  }

  await next();
}

// Health check endpoint
app.get("/make-server-0ba58e95/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ENDPOINTS ====================

// Sign up endpoint
app.post("/make-server-0ba58e95/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since email server not configured
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: `Signup error: ${error.message}` }, 400);
    }

    // Check if this is the first user
    const allUsers = await kv.getByPrefix('user:');
    const existingUsers = allUsers.filter((u: any) => u.email);
    const isFirstUser = existingUsers.length === 0;

    // Assign role - first user becomes super_admin
    const userId = data.user.id;
    const userRole = isFirstUser ? 'super_admin' : 'editor';
    
    const userData = {
      id: userId,
      email,
      name,
      role: userRole,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store user data in KV
    await kv.set(`user:${userId}`, userData);
    await kv.set(`user:${userId}:role`, userRole);

    console.log(`User created: ${email} with role: ${userRole}`);

    return c.json({ user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: `Signup error: ${error}` }, 500);
  }
});

// ==================== USER MANAGEMENT ENDPOINTS ====================

// Get all users (requires super_admin)
app.get("/make-server-0ba58e95/users", verifyAuth, verifySuperAdmin, async (c) => {
  try {
    const usersData = await kv.getByPrefix('user:');
    const users = usersData.filter((u: any) => u.email); // Filter out role entries
    
    return c.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: `Error fetching users: ${error}` }, 500);
  }
});

// Get current user info
app.get("/make-server-0ba58e95/users/me", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    
    let userData = await kv.get(`user:${userId}`);
    let userRole = await kv.get(`user:${userId}:role`);
    
    // Migration: If user doesn't have role assigned, check if they're the first user
    if (!userRole) {
      const allUsers = await kv.getByPrefix('user:');
      const existingUsers = allUsers.filter((u: any) => u.email && u.id !== userId);
      
      // If this is the first/only user or no users have roles, make them super_admin
      const usersWithRoles = allUsers.filter((u: any) => u.role);
      if (existingUsers.length === 0 || usersWithRoles.length === 0) {
        userRole = 'super_admin';
      } else {
        userRole = 'editor';
      }
      
      // Store the role
      if (!userData) {
        // Get user info from Supabase
        const { data: { user } } = await supabase.auth.getUser(c.req.header('Authorization')?.split(' ')[1] || '');
        userData = {
          id: userId,
          email: userEmail,
          name: user?.user_metadata?.name || userEmail.split('@')[0],
          role: userRole,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        userData.role = userRole;
      }
      
      await kv.set(`user:${userId}`, userData);
      await kv.set(`user:${userId}:role`, userRole);
      
      console.log(`Auto-assigned role ${userRole} to user ${userEmail}`);
    }
    
    return c.json({ 
      user: {
        id: userId,
        email: userEmail,
        ...userData,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return c.json({ error: `Error fetching current user: ${error}` }, 500);
  }
});

// Get user role by user ID (authenticated users can check their own role or any role)
app.get("/make-server-0ba58e95/users/:id/role", verifyAuth, async (c) => {
  try {
    const userId = c.req.param('id');
    
    console.log(`Fetching role for user ${userId}...`);
    
    let userRole = await kv.get(`user:${userId}:role`);
    
    console.log(`Retrieved role from KV: ${userRole}`);
    
    // Migration: If user doesn't have role assigned, check if they're the first user
    if (!userRole) {
      console.log('No role found, checking if first user...');
      const allUsers = await kv.getByPrefix('user:');
      console.log(`Found ${allUsers.length} users in system`);
      
      const existingUsers = allUsers.filter((u: any) => u.email && u.id !== userId);
      
      // If this is the first/only user or no users have roles, make them super_admin
      const usersWithRoles = allUsers.filter((u: any) => u.role);
      if (existingUsers.length === 0 || usersWithRoles.length === 0) {
        userRole = 'super_admin';
      } else {
        userRole = 'editor';
      }
      
      // Store the role
      await kv.set(`user:${userId}:role`, userRole);
      
      console.log(`Auto-assigned role ${userRole} to user ${userId}`);
    }
    
    return c.json({ role: userRole });
  } catch (error) {
    console.error('Error fetching user role:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ 
      error: `Error fetching user role: ${error instanceof Error ? error.message : String(error)}`,
      details: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});

// Create user (requires super_admin)
app.post("/make-server-0ba58e95/users", verifyAuth, verifySuperAdmin, async (c) => {
  try {
    const { email, password, name, role, active } = await c.req.json();

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (error) {
      console.error('Create user error:', error);
      return c.json({ error: `Create user error: ${error.message}` }, 400);
    }

    // Store user metadata and role in KV
    const userId = data.user.id;
    const userData = {
      id: userId,
      email,
      name,
      role: role || 'editor',
      active: active !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, userData);
    await kv.set(`user:${userId}:role`, userData.role);

    return c.json({ user: userData });
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ error: `Error creating user: ${error}` }, 500);
  }
});

// Update user (requires super_admin)
app.put("/make-server-0ba58e95/users/:id", verifyAuth, verifySuperAdmin, async (c) => {
  try {
    const userId = c.req.param('id');
    const { name, role, active, password } = await c.req.json();

    // Get existing user data
    const existingUser = await kv.get(`user:${userId}`);
    if (!existingUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update password if provided
    if (password) {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password,
      });

      if (error) {
        console.error('Update password error:', error);
        return c.json({ error: `Update password error: ${error.message}` }, 400);
      }
    }

    // Update user metadata if name changed
    if (name && name !== existingUser.name) {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { name },
      });

      if (error) {
        console.error('Update user metadata error:', error);
        // Continue anyway, this is not critical
      }
    }

    // Update user data in KV
    const userData = {
      ...existingUser,
      name: name || existingUser.name,
      role: role || existingUser.role,
      active: active !== undefined ? active : existingUser.active,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, userData);
    await kv.set(`user:${userId}:role`, userData.role);

    return c.json({ user: userData });
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: `Error updating user: ${error}` }, 500);
  }
});

// Delete user (requires super_admin)
app.delete("/make-server-0ba58e95/users/:id", verifyAuth, verifySuperAdmin, async (c) => {
  try {
    const userId = c.req.param('id');

    // Check if user exists and get role
    const userData = await kv.get(`user:${userId}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Prevent deleting the last super_admin
    if (userData.role === 'super_admin') {
      const allUsers = await kv.getByPrefix('user:');
      const superAdmins = allUsers.filter((u: any) => u.role === 'super_admin');
      if (superAdmins.length <= 1) {
        return c.json({ error: 'Cannot delete the last super admin' }, 400);
      }
    }

    // Delete user from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Delete user from auth error:', error);
      // Continue anyway to clean up KV data
    }

    // Delete user data from KV
    await kv.del(`user:${userId}`);
    await kv.del(`user:${userId}:role`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: `Error deleting user: ${error}` }, 500);
  }
});

// ==================== CONTENT ENDPOINTS ====================

// Get all classes/workshops
app.get("/make-server-0ba58e95/content/items", async (c) => {
  try {
    const type = c.req.query('type'); // 'class' or 'workshop'
    
    // Get all content items
    const allItems = await kv.getByPrefix('content:');
    
    // Filtrar items que no estén en papelera
    let items = allItems.filter((item: any) => !item.deleted);
    
    // Filter by type if specified
    if (type) {
      items = items.filter((item: any) => item.type === type);
    }
    
    return c.json({ items });
  } catch (error) {
    console.error('Error fetching content items:', error);
    return c.json({ error: `Error fetching content items: ${error}` }, 500);
  }
});

// Get single content item
app.get("/make-server-0ba58e95/content/items/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const item = await kv.get(`content:${id}`);
    
    if (!item) {
      return c.json({ error: 'Content item not found' }, 404);
    }
    
    return c.json({ item });
  } catch (error) {
    console.error('Error fetching content item:', error);
    return c.json({ error: `Error fetching content item: ${error}` }, 500);
  }
});

// Create/Update content item (requires auth)
app.post("/make-server-0ba58e95/content/items", verifyAuth, async (c) => {
  try {
    const item = await c.req.json();
    
    if (!item || !item.type) {
      return c.json({ error: 'Invalid content item: missing required fields' }, 400);
    }
    
    // Validar y asegurar que el slug sea único
    if (item.slug) {
      const allItems = await kv.getByPrefix('content:');
      const existingSlugs = allItems
        .filter((existingItem: any) => existingItem.id !== item.id) // Excluir el item actual si está actualizando
        .map((existingItem: any) => existingItem.slug)
        .filter(Boolean);
      
      // Verificar si el slug ya existe
      if (existingSlugs.includes(item.slug)) {
        // Buscar el siguiente número disponible
        const baseSlug = item.slug.replace(/-\d+$/, ''); // Remover número existente si lo hay
        let counter = 1;
        let uniqueSlug = `${baseSlug}-${counter}`;
        
        // Encontrar el siguiente número disponible
        while (existingSlugs.includes(uniqueSlug)) {
          counter++;
          uniqueSlug = `${baseSlug}-${counter}`;
        }
        
        item.slug = uniqueSlug;
        console.log(`Slug duplicado detectado. Nuevo slug único: ${uniqueSlug}`);
      }
    }
    
    const id = item.id || `${item.type}:${Date.now()}`;
    
    const contentItem = {
      ...item,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: item.createdAt || new Date().toISOString(),
    };
    
    // Intentar guardar con reintentos en caso de fallo temporal
    let retries = 3;
    let saved = false;
    let lastError = null;
    
    while (retries > 0 && !saved) {
      try {
        await kv.set(`content:${id}`, contentItem);
        saved = true;
        console.log(`Content item saved successfully: ${id}`);
      } catch (err) {
        lastError = err;
        retries--;
        if (retries > 0) {
          console.log(`Failed to save content item, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }
    
    if (!saved) {
      console.error('Error saving content item after all retries:', lastError);
      return c.json({ error: `Failed to save content item: ${lastError}` }, 500);
    }
    
    return c.json({ item: contentItem });
  } catch (error) {
    console.error('Error saving content item:', error);
    return c.json({ error: `Error saving content item: ${error}` }, 500);
  }
});

// Update content item (requires auth)
app.put("/make-server-0ba58e95/content/items/:id", verifyAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const item = await c.req.json();
    
    if (!id || !item) {
      return c.json({ error: 'Invalid request: missing id or item data' }, 400);
    }
    
    // Guardar versión anterior antes de actualizar (con reintentos)
    const oldItem = await kv.get(`content:${id}`);
    if (oldItem) {
      try {
        const versionId = `version:${Date.now()}:${Math.random().toString(36).substring(7)}`;
        await kv.set(`history:${id}:${versionId}`, {
          ...oldItem,
          versionId,
          savedAt: new Date().toISOString(),
        });
        console.log(`Version saved for content item: ${id}`);
      } catch (versionError) {
        console.error('Warning: Failed to save version history:', versionError);
        // Continuar aunque falle el historial - el contenido principal es más importante
      }
    }
    
    // Validar y asegurar que el slug sea único (solo si se está cambiando)
    if (item.slug && item.slug !== oldItem?.slug) {
      const allItems = await kv.getByPrefix('content:');
      const existingSlugs = allItems
        .filter((existingItem: any) => existingItem.id !== id) // Excluir el item actual
        .map((existingItem: any) => existingItem.slug)
        .filter(Boolean);
      
      // Verificar si el slug ya existe
      if (existingSlugs.includes(item.slug)) {
        // Buscar el siguiente número disponible
        const baseSlug = item.slug.replace(/-\d+$/, ''); // Remover número existente si lo hay
        let counter = 1;
        let uniqueSlug = `${baseSlug}-${counter}`;
        
        // Encontrar el siguiente número disponible
        while (existingSlugs.includes(uniqueSlug)) {
          counter++;
          uniqueSlug = `${baseSlug}-${counter}`;
        }
        
        item.slug = uniqueSlug;
        console.log(`Slug duplicado detectado en actualización. Nuevo slug único: ${uniqueSlug}`);
      }
    }
    
    const contentItem = {
      ...item,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: oldItem?.createdAt || item.createdAt || new Date().toISOString(),
    };
    
    // Intentar guardar con reintentos
    let retries = 3;
    let saved = false;
    let lastError = null;
    
    while (retries > 0 && !saved) {
      try {
        await kv.set(`content:${id}`, contentItem);
        saved = true;
        console.log(`Content item updated successfully: ${id}`);
      } catch (err) {
        lastError = err;
        retries--;
        if (retries > 0) {
          console.log(`Failed to update content item, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!saved) {
      console.error('Error updating content item after all retries:', lastError);
      return c.json({ error: `Failed to update content item: ${lastError}` }, 500);
    }
    
    return c.json({ item: contentItem });
  } catch (error) {
    console.error('Error updating content item:', error);
    return c.json({ error: `Error updating content item: ${error}` }, 500);
  }
});

// Delete content item (requires auth)
app.delete("/make-server-0ba58e95/content/items/:id", verifyAuth, async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`content:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting content item:', error);
    return c.json({ error: `Error deleting content item: ${error}` }, 500);
  }
});

// ==================== BLOG ENDPOINTS ====================

// Get all blog posts (public)
app.get('/make-server-0ba58e95/blog/posts', async (c) => {
  try {
    const publishedOnly = c.req.query('published') === 'true';
    const posts = await kv.getByPrefix('post:').catch(err => {
      console.error('Database temporarily unavailable, returning empty array:', err);
      return [];
    });
    
    // Filtrar posts que no estén en papelera
    let filteredPosts = (posts || []).filter((post: any) => !post.deleted);
    
    if (publishedOnly) {
      filteredPosts = filteredPosts.filter((post: any) => post.published);
    }
    
    // Sort by date, newest first
    filteredPosts.sort((a: any, b: any) => 
      new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
    );
    
    return c.json({ posts: filteredPosts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return c.json({ posts: [], error: 'Database temporarily unavailable. Please try again in a moment.' }, 200);
  }
});

// Get single blog post by slug (public)
app.get('/make-server-0ba58e95/blog/posts/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const post = await kv.get(`post:${slug}`);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    return c.json({ post });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return c.json({ error: `Failed to fetch post: ${error}` }, 500);
  }
});

// Create/Update blog post (requires auth)
app.post('/make-server-0ba58e95/blog/posts', verifyAuth, async (c) => {
  try {
    const postData = await c.req.json();
    
    if (!postData || !postData.title) {
      return c.json({ error: 'Invalid post data: missing title' }, 400);
    }
    
    // Generate slug if not provided
    const slug = postData.slug || postData.title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Get existing post to preserve createdAt
    const existingPost = await kv.get(`post:${slug}`);
    
    const post = {
      ...postData,
      slug,
      updatedAt: new Date().toISOString(),
      createdAt: existingPost?.createdAt || postData.createdAt || new Date().toISOString(),
    };
    
    // Intentar guardar con reintentos
    let retries = 3;
    let saved = false;
    let lastError = null;
    
    while (retries > 0 && !saved) {
      try {
        await kv.set(`post:${slug}`, post);
        saved = true;
        console.log(`Blog post saved successfully: ${slug}`);
      } catch (err) {
        lastError = err;
        retries--;
        if (retries > 0) {
          console.log(`Failed to save blog post, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!saved) {
      console.error('Error saving blog post after all retries:', lastError);
      return c.json({ error: `Failed to save post: ${lastError}` }, 500);
    }
    
    return c.json({ post });
  } catch (error) {
    console.error('Error saving blog post:', error);
    return c.json({ error: `Error saving post: ${error}` }, 500);
  }
});

// Delete blog post (requires auth)
app.delete('/make-server-0ba58e95/blog/posts/:slug', verifyAuth, async (c) => {
  try {
    const slug = c.req.param('slug');
    await kv.del(`post:${slug}`);
    
    return c.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return c.json({ error: `Error deleting post: ${error}` }, 500);
  }
});

// Legacy endpoint for compatibility
app.get('/make-server-0ba58e95/blog', async (c) => {
  try {
    const posts = await kv.getByPrefix('post:');
    // Filtrar posts que no estén en papelera
    const activePosts = (posts || []).filter((post: any) => !post.deleted);
    return c.json({ posts: activePosts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

// Messages endpoints
app.get('/make-server-0ba58e95/messages', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const messages = await kv.getByPrefix('message:');
    // Ordenar por fecha, más recientes primero
    const sortedMessages = (messages || []).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json({ messages: sortedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

app.post('/make-server-0ba58e95/messages', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, phone, subject, message } = body;

    if (!email || !message) {
      return c.json({ error: 'Email and message are required' }, 400);
    }

    const messageId = `message:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const messageData = {
      id: messageId,
      name: name || 'Sin nombre',
      email,
      phone: phone || '',
      subject: subject || 'Sin asunto',
      message,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };

    await kv.set(messageId, messageData);

    // Enviar email de notificación
    try {
      const settings = await kv.get('settings');
      const contactEmail = settings?.contactEmail || 'info@casarosierceramica.com';
      const resendApiKey = Deno.env.get('RESEND_API_KEY');

      if (resendApiKey) {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Casa Rosier <onboarding@resend.dev>',
            to: ['jrcaguilar@gmail.com'], // Email verificado en Resend (modo prueba)
            subject: `Nuevo mensaje de contacto: ${subject || 'Sin asunto'}`,
            html: `
              <h2>Nuevo mensaje de contacto</h2>
              <p><strong>De:</strong> ${name || 'Sin nombre'}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
              <p><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
              <p><strong>Mensaje:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
              <hr>
              <p style="color: #666; font-size: 12px;">Recibido el ${new Date().toLocaleString('es-ES')}</p>
              <p style="color: #999; font-size: 11px;">Nota: Este email se envía a jrcaguilar@gmail.com porque Resend está en modo prueba. Para enviar a ${contactEmail}, verifica tu dominio en resend.com/domains</p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email notification:', await emailResponse.text());
        }
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // No fallar la petición si el email falla
    }

    return c.json({ message: 'Message sent successfully', data: messageData });
  } catch (error) {
    console.error('Error creating message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

app.patch('/make-server-0ba58e95/messages/:id/status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const messageId = c.req.param('id');
    const { status } = await c.req.json();

    const message = await kv.get(messageId);
    if (!message) {
      return c.json({ error: 'Message not found' }, 404);
    }

    const updatedMessage = { ...message, status };
    await kv.set(messageId, updatedMessage);

    return c.json({ message: 'Status updated', data: updatedMessage });
  } catch (error) {
    console.error('Error updating message status:', error);
    return c.json({ error: 'Failed to update status' }, 500);
  }
});

app.delete('/make-server-0ba58e95/messages/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const messageId = c.req.param('id');
    await kv.del(messageId);

    return c.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return c.json({ error: 'Failed to delete message' }, 500);
  }
});

// ==================== SETTINGS ENDPOINTS ====================

// Get site settings
app.get("/make-server-0ba58e95/settings", async (c) => {
  try {
    const defaultSettings = {
      siteName: 'Casa Rosier',
      siteDescription: 'Taller de cerámica en Barcelona',
      seoTitle: 'Casa Rosier - Taller de Cerámica en Barcelona',
      seoDescription: 'Descubre la cerámica en Casa Rosier. Clases, workshops y espacios para eventos en Barcelona.',
      seoKeywords: 'cerámica, Barcelona, taller, clases, workshops, torno',
      ogImage: '',
      contactEmail: 'info@casarosierceramica.com',
      contactPhone: '+34 633788860',
    };
    
    const settings = await kv.get('site:settings').catch(err => {
      console.log('Database temporarily unavailable, using default settings');
      return defaultSettings;
    });
    
    return c.json({ settings: settings || defaultSettings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return c.json({ settings: defaultSettings }, 200);
  }
});

// Update site settings (requires auth)
app.post("/make-server-0ba58e95/settings", verifyAuth, async (c) => {
  try {
    const settings = await c.req.json();
    
    if (!settings) {
      return c.json({ error: 'Invalid settings data' }, 400);
    }
    
    // Intentar guardar con reintentos
    let retries = 3;
    let saved = false;
    let lastError = null;
    
    while (retries > 0 && !saved) {
      try {
        await kv.set('site:settings', settings);
        saved = true;
        console.log('Site settings saved successfully');
      } catch (err) {
        lastError = err;
        retries--;
        if (retries > 0) {
          console.log(`Failed to save settings, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!saved) {
      console.error('Error saving settings after all retries:', lastError);
      return c.json({ error: `Failed to save settings: ${lastError}` }, 500);
    }
    
    return c.json({ settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    return c.json({ error: `Error saving settings: ${error}` }, 500);
  }
});

// ==================== MENU ENDPOINTS ====================

// Get menu structure (public)
app.get("/make-server-0ba58e95/menu", async (c) => {
  try {
    const defaultMenu = {
      items: [
        { name: 'Inicio', path: '/', order: 0 },
        {
          name: 'Clases',
          order: 1,
          submenu: [
            { name: 'Iniciación a la cerámica', path: '/clases/iniciacion', order: 0 },
            { name: 'Regular de modelado', path: '/clases', order: 1 },
            { name: 'Modelado con torno', path: '/clases/torno', order: 2 },
          ],
        },
        {
          name: 'Workshops',
          order: 2,
          submenu: [
            { name: 'Esmaltes online vía zoom', path: '/workshops/esmaltes-online', order: 0 },
            { name: 'Esmaltes Barcelona', path: '/workshops/esmaltes-barcelona', order: 1 },
            { name: 'Laboratorio Cerámico', path: '/workshops/laboratorio', order: 2 },
            { name: 'Método Seger', path: '/workshops/metodo-seger', order: 3 },
          ],
        },
        {
          name: 'Reservas Privadas',
          order: 3,
          submenu: [
            { name: 'Taller para grupos', path: '/espacios-privados', order: 0 },
          ],
        },
        { name: 'Tarjeta de regalo', path: '/tarjeta-regalo', order: 4 },
        { name: 'El Estudio', path: '/el-estudio', order: 5 },
        { name: 'Blog', path: '/blog', order: 6 },
        { name: 'Tiendita', path: '/tiendita', order: 7 },
      ],
    };
    
    const menu = await kv.get('menu').catch(err => {
      console.log('Database temporarily unavailable, using default menu');
      return defaultMenu;
    });
    
    return c.json({ menu: menu || defaultMenu });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return c.json({ menu: defaultMenu }, 200);
  }
});

// Update menu structure (requires auth)
app.post("/make-server-0ba58e95/menu", verifyAuth, async (c) => {
  try {
    const menu = await c.req.json();
    
    if (!menu || !menu.items) {
      return c.json({ error: 'Invalid menu data: missing items' }, 400);
    }
    
    // Intentar guardar con reintentos
    let retries = 3;
    let saved = false;
    let lastError = null;
    
    while (retries > 0 && !saved) {
      try {
        await kv.set('menu', menu);
        saved = true;
        console.log('Menu saved successfully');
      } catch (err) {
        lastError = err;
        retries--;
        if (retries > 0) {
          console.log(`Failed to save menu, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!saved) {
      console.error('Error saving menu after all retries:', lastError);
      return c.json({ error: `Failed to save menu: ${lastError}` }, 500);
    }
    
    return c.json({ menu });
  } catch (error) {
    console.error('Error saving menu:', error);
    return c.json({ error: `Error saving menu: ${error}` }, 500);
  }
});

// ==================== IMAGE UPLOAD ENDPOINTS ====================

// Upload image (requires auth)
app.post("/make-server-0ba58e95/upload/image", verifyAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, 400);
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'File size exceeds 10MB limit' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage con reintentos
    const bucketName = 'make-0ba58e95-uploads';
    let retries = 3;
    let uploaded = false;
    let lastError = null;
    let publicUrl = null;

    while (retries > 0 && !uploaded) {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, uint8Array, {
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        publicUrl = urlData.publicUrl;
        uploaded = true;
        console.log(`Image uploaded successfully: ${filePath}`);
        
        // Guardar metadata de la imagen en el KV store para referencia
        await kv.set(`image:${fileName}`, {
          fileName,
          filePath,
          url: publicUrl,
          originalName: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: c.get('userId'),
        }).catch(err => {
          console.error('Warning: Failed to save image metadata:', err);
          // No lanzar error, la imagen ya está subida
        });
        
      } catch (err) {
        lastError = err;
        retries--;
        if (retries > 0) {
          console.log(`Failed to upload image, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }

    if (!uploaded) {
      console.error('Upload error after all retries:', lastError);
      return c.json({ error: `Upload failed: ${lastError.message || lastError}` }, 500);
    }

    return c.json({ 
      success: true, 
      url: publicUrl,
      path: filePath,
      fileName: fileName
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return c.json({ error: `Image upload error: ${error}` }, 500);
  }
});

// Get all uploaded images (requires auth)
app.get("/make-server-0ba58e95/upload/images", verifyAuth, async (c) => {
  try {
    const bucketName = 'make-0ba58e95-uploads';
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('uploads', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('List images error:', error);
      return c.json({ error: `List images error: ${error.message}` }, 500);
    }

    // Get public URLs for all images
    const images = data.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(`uploads/${file.name}`);
      
      return {
        name: file.name,
        url: publicUrl,
        createdAt: file.created_at,
        size: file.metadata?.size,
      };
    });

    return c.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return c.json({ error: `Error fetching images: ${error}` }, 500);
  }
});

// Get all images with metadata from KV (requires auth)
app.get("/make-server-0ba58e95/images", verifyAuth, async (c) => {
  try {
    // Get all image metadata from KV store
    const imageMetadata = await kv.getByPrefix('image:');
    
    // Sort by upload date (newest first)
    const sortedImages = (imageMetadata || []).sort((a: any, b: any) => {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

    return c.json({ images: sortedImages });
  } catch (error) {
    console.error('Error fetching images:', error);
    return c.json({ error: `Error fetching images: ${error}`, images: [] }, 500);
  }
});

// Delete image (requires auth)
app.delete("/make-server-0ba58e95/images/:fileName", verifyAuth, async (c) => {
  try {
    const fileName = c.req.param('fileName');
    
    if (!fileName) {
      return c.json({ error: 'Missing fileName parameter' }, 400);
    }

    const bucketName = 'make-0ba58e95-uploads';
    const filePath = `uploads/${fileName}`;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      return c.json({ error: `Failed to delete image: ${storageError.message}` }, 500);
    }

    // Delete metadata from KV store
    try {
      await kv.del(`image:${fileName}`);
    } catch (kvError) {
      console.error('Warning: Failed to delete image metadata:', kvError);
      // Continue even if metadata deletion fails - the main file is deleted
    }

    console.log(`Image deleted successfully: ${fileName}`);
    return c.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return c.json({ error: `Error deleting image: ${error}` }, 500);
  }
});

// ==================== EDIT LOCKS ENDPOINTS ====================

// Helper to clean expired locks (inactive for more than 5 minutes)
async function cleanExpiredLocks() {
  try {
    const locks = await kv.getByPrefix('lock:');
    const now = Date.now();
    const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    for (const lock of locks) {
      const lastHeartbeat = new Date(lock.lastHeartbeat).getTime();
      if (now - lastHeartbeat > LOCK_TIMEOUT) {
        await kv.del(`lock:${lock.resourceId}`);
        console.log(`Expired lock cleaned: ${lock.resourceId}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning expired locks:', error);
  }
}

// Get lock status for a resource (public - anyone can check)
app.get("/make-server-0ba58e95/locks/:resource", async (c) => {
  try {
    const resource = c.req.param('resource');
    const lock = await kv.get(`lock:${resource}`);
    
    if (!lock) {
      return c.json({ locked: false, lock: null });
    }

    // Check if lock is expired
    const lastHeartbeat = new Date(lock.lastHeartbeat).getTime();
    const now = Date.now();
    const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    if (now - lastHeartbeat > LOCK_TIMEOUT) {
      // Lock expired, remove it
      await kv.del(`lock:${resource}`);
      return c.json({ locked: false, lock: null });
    }

    return c.json({ locked: true, lock });
  } catch (error) {
    console.error('Error checking lock:', error);
    return c.json({ error: 'Error checking lock status' }, 500);
  }
});

// Acquire lock (requires auth)
app.post("/make-server-0ba58e95/locks/:resource", verifyAuth, async (c) => {
  try {
    const resource = c.req.param('resource');
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    
    // Get user name from metadata
    const userMeta = await kv.get(`user:${userId}`);
    const userName = userMeta?.name || userEmail?.split('@')[0] || 'Usuario';

    // Check if lock exists
    const existingLock = await kv.get(`lock:${resource}`);
    
    // Check if lock is expired
    if (existingLock) {
      const lastHeartbeat = new Date(existingLock.lastHeartbeat).getTime();
      const now = Date.now();
      const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

      if (now - lastHeartbeat > LOCK_TIMEOUT) {
        // Lock expired, remove it
        console.log(`Lock expired for ${resource}, cleaning up...`);
        await kv.del(`lock:${resource}`);
      } else if (existingLock.userId !== userId) {
        // Another user has an active lock
        console.log(`Lock denied: ${resource} is locked by ${existingLock.userName}`);
        return c.json({ 
          success: false, 
          locked: true, 
          lock: existingLock,
          message: 'Resource is locked by another user'
        }, 409);
      } else {
        // Same user already has the lock, just update heartbeat
        console.log(`Lock refreshed: ${resource} by ${userName}`);
        existingLock.lastHeartbeat = new Date().toISOString();
        await kv.set(`lock:${resource}`, existingLock);
        return c.json({ success: true, locked: true, lock: existingLock });
      }
    }

    // Create new lock
    const lock = {
      resourceId: resource,
      userId,
      userName,
      userEmail,
      lockedAt: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
    };

    await kv.set(`lock:${resource}`, lock);
    console.log(`Lock acquired: ${resource} by ${userName}`);

    return c.json({ success: true, locked: true, lock });
  } catch (error) {
    console.error('Error acquiring lock:', error);
    return c.json({ error: `Error acquiring lock: ${error.message || error}` }, 500);
  }
});

// Send heartbeat to keep lock alive (requires auth)
app.post("/make-server-0ba58e95/locks/:resource/heartbeat", verifyAuth, async (c) => {
  try {
    const resource = c.req.param('resource');
    const userId = c.get('userId');

    const existingLock = await kv.get(`lock:${resource}`);
    
    if (!existingLock) {
      return c.json({ error: 'Lock not found' }, 404);
    }

    if (existingLock.userId !== userId) {
      return c.json({ error: 'Lock owned by another user' }, 403);
    }

    // Update heartbeat
    existingLock.lastHeartbeat = new Date().toISOString();
    await kv.set(`lock:${resource}`, existingLock);

    return c.json({ success: true, lock: existingLock });
  } catch (error) {
    console.error('Error sending heartbeat:', error);
    return c.json({ error: 'Error updating heartbeat' }, 500);
  }
});

// Release lock (requires auth)
app.delete("/make-server-0ba58e95/locks/:resource", verifyAuth, async (c) => {
  try {
    const resource = c.req.param('resource');
    const userId = c.get('userId');

    const existingLock = await kv.get(`lock:${resource}`);
    
    // Only the owner can release their own lock
    if (existingLock && existingLock.userId !== userId) {
      return c.json({ error: 'Cannot release lock owned by another user' }, 403);
    }

    await kv.del(`lock:${resource}`);
    console.log(`Lock released: ${resource}`);

    return c.json({ success: true, message: 'Lock released' });
  } catch (error) {
    console.error('Error releasing lock:', error);
    return c.json({ error: 'Error releasing lock' }, 500);
  }
});

// Takeover lock (force release by another user - requires auth)
app.post("/make-server-0ba58e95/locks/:resource/takeover", verifyAuth, async (c) => {
  try {
    const resource = c.req.param('resource');
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    
    // Get user name from metadata
    const userMeta = await kv.get(`user:${userId}`);
    const userName = userMeta?.name || userEmail?.split('@')[0] || 'Usuario';

    const existingLock = await kv.get(`lock:${resource}`);
    
    if (existingLock) {
      console.log(`Lock takeover: ${resource} - Previous owner: ${existingLock.userName}, New owner: ${userName}`);
    }

    // Force create new lock
    const lock = {
      resourceId: resource,
      userId,
      userName,
      userEmail,
      lockedAt: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
    };

    await kv.set(`lock:${resource}`, lock);

    return c.json({ success: true, locked: true, lock, takenOver: !!existingLock });
  } catch (error) {
    console.error('Error taking over lock:', error);
    return c.json({ error: 'Error taking over lock' }, 500);
  }
});

// ==================== PAGES ENDPOINTS ====================

// Get all pages (public)
app.get("/make-server-0ba58e95/pages", async (c) => {
  try {
    const pages = await kv.getByPrefix('page:').catch(err => {
      console.error('Database temporarily unavailable, returning empty array:', err);
      return [];
    });
    
    // Filtrar páginas que no estén en papelera
    const activePages = (pages || []).filter((page: any) => !page.deleted);
    
    return c.json({ pages: activePages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return c.json({ pages: [], error: 'Database temporarily unavailable. Please try again in a moment.' }, 200);
  }
});

// Get page by slug (public)
app.get("/make-server-0ba58e95/pages/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    const page = await kv.get(`page:${slug}`).catch(err => {
      console.error('Database temporarily unavailable:', err);
      return null;
    });
    
    if (!page) {
      return c.json({ error: 'Page not found or database temporarily unavailable' }, 404);
    }
    
    return c.json({ page });
  } catch (error) {
    console.error('Error fetching page:', error);
    return c.json({ error: 'Database temporarily unavailable. Please try again in a moment.' }, 503);
  }
});

// Create/Update page (requires auth)
app.post("/make-server-0ba58e95/pages/:slug", verifyAuth, async (c) => {
  try {
    const slug = c.req.param('slug');
    const pageData = await c.req.json();
    
    if (!slug || !pageData) {
      return c.json({ error: 'Invalid request: missing slug or page data' }, 400);
    }
    
    // Get existing page to preserve createdAt
    const existingPage = await kv.get(`page:${slug}`);
    
    const page = {
      ...pageData,
      slug,
      updatedAt: new Date().toISOString(),
      createdAt: existingPage?.createdAt || pageData.createdAt || new Date().toISOString(),
    };
    
    // Intentar guardar con reintentos
    let retries = 3;
    let saved = false;
    let lastError = null;
    
    while (retries > 0 && !saved) {
      try {
        await kv.set(`page:${slug}`, page);
        saved = true;
        console.log(`Page saved successfully: ${slug}`);
      } catch (err) {
        lastError = err;
        retries--;
        if (retries > 0) {
          console.log(`Failed to save page, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!saved) {
      console.error('Error saving page after all retries:', lastError);
      return c.json({ error: `Failed to save page: ${lastError}` }, 500);
    }
    
    return c.json({ page });
  } catch (error) {
    console.error('Error saving page:', error);
    return c.json({ error: `Error saving page: ${error}` }, 500);
  }
});

// Delete page (requires auth)
app.delete("/make-server-0ba58e95/pages/:slug", verifyAuth, async (c) => {
  try {
    const slug = c.req.param('slug');
    await kv.del(`page:${slug}`);
    
    return c.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    return c.json({ error: `Error deleting page: ${error}` }, 500);
  }
});

// Initialize default content (requires auth)
app.post("/make-server-0ba58e95/initialize", verifyAuth, async (c) => {
  try {
    // Initialize Home page
    const homePage = {
      slug: 'home',
      title: 'Inicio',
      sections: [
        {
          id: 'hero',
          type: 'hero',
          title: 'estudio Cerámica creativa en Barcelona',
          images: [],
        },
        {
          id: 'about',
          type: 'about',
          title: 'Sobre Casa Rosier',
          content: 'Ya sea en clases mensuales o en talleres intensivos de fin de semana, te acompañaremos para que descubras todas las posibilidades del barro.\n\nTambién puedes crear un evento privado totalmente personalizado.',
          images: [
            'https://images.unsplash.com/photo-1737564483280-15481c31608a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRzJTIwd29ya3Nob3B8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1668840306122-526500331070?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwY2VyYW1pYyUyMGJvd2wlMjBjbGF5fGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1595351298005-4d29bb980ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwd2hlZWwlMjBjZXJhbWljc3xlbnwxfHx8fDE3NjUwODY1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1673436765901-6327d8030e38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwc3R1ZGlvJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
          ],
        },
        {
          id: 'courses',
          type: 'courses',
          title: 'Cursos y workshops',
          titleLine1: 'CURSOS Y',
          titleLine2: 'WORKSHOPS',
          courses: [
            {
              title: 'Clases Regulares',
              subtitle: 'Modelado',
              image: 'https://images.unsplash.com/photo-1737564483280-15481c31608a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRzJTIwd29ya3Nob3B8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
              link: '/clases',
            },
            {
              title: 'Formación de Esmaltes',
              subtitle: 'Octave via zoom',
              image: 'https://images.unsplash.com/photo-1668840306122-526500331070?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwY2VyYW1pYyUyMGJvd2wlMjBjbGF5fGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
              link: '/workshops',
            },
            {
              title: 'Laboratorio Cerámico',
              subtitle: 'Workshop Esmaltes',
              image: 'https://images.unsplash.com/photo-1673436765901-6327d8030e38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwc3R1ZGlvJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
              link: '/workshops',
            },
            {
              title: 'Iniciación al Torno',
              subtitle: 'Química cerámica',
              image: 'https://images.unsplash.com/photo-1595351298005-4d29bb980ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwd2hlZWwlMjBjZXJhbWljc3xlbnwxfHx8fDE3NjUwODY1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
              link: '/clases',
            },
          ],
        },
        {
          id: 'courses2',
          type: 'courses2',
          titleLine1: 'MÁS',
          titleLine2: 'OPCIONES',
          courses: [
            {
              title: 'Taller Privado',
              subtitle: 'Grupos',
              image: 'https://images.unsplash.com/photo-1610701596295-4dc5d6289214?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwZ3JvdXAlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjUyMTgxMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
              link: '/espacios-privados',
            },
            {
              title: 'Gift Card',
              subtitle: 'Tarjeta Regalo',
              image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwZ2lmdCUyMGNhcmR8ZW58MXx8fHwxNzY1MjE4MTExfDA&ixlib=rb-4.1.0&q=80&w=1080',
              link: '/tarjeta-regalo',
            },
            {
              title: 'El Estudio',
              subtitle: 'Nuestro Espacio',
              image: 'https://images.unsplash.com/photo-1610701635763-0f500c76f7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwc3R1ZGlvJTIwc3BhY2V8ZW58MXx8fHwxNzY1MjE4MTExfDA&ixlib=rb-4.1.0&q=80&w=1080',
              link: '/el-estudio',
            },
            {
              title: 'Blog',
              subtitle: 'Inspiración',
              image: 'https://images.unsplash.com/photo-1611003228941-98852ba62227?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwYXJ0JTIwaW5zcGlyYXRpb258ZW58MXx8fHwxNzY1MjE4MTExfDA&ixlib=rb-4.1.0&q=80&w=1080',
              link: '/blog',
            },
          ],
        },
        {
          id: 'banner',
          type: 'banner',
          title: 'TIENDITA',
          description: 'Descubre nuestras piezas únicas hechas a mano',
          image: 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcGllY2VzJTIwc2hvcHxlbnwxfHx8fDE3NjUyMTgxMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
          link: '/tiendita',
        },
      ],
      visible: true,
      updatedAt: new Date().toISOString(),
    };

    await kv.set('page:home', homePage);

    // Initialize El Estudio page
    const estudioPage = {
      slug: 'el-estudio',
      title: 'El Estudio',
      sections: [
        {
          id: 'hero',
          type: 'hero',
          title: 'El Estudio',
          content: 'Bienvenido a nuestro espacio creativo en el corazón de Barcelona.',
          images: ['https://images.unsplash.com/photo-1737564483280-15481c31608a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRzJTIwd29ya3Nob3B8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080'],
        },
        {
          id: 'about',
          type: 'about',
          title: 'Nuestro Espacio',
          content: 'Casa Rosier es un taller de cerámica ubicado en Barcelona donde la creatividad y la artesanía se unen.',
          images: [
            'https://images.unsplash.com/photo-1668840306122-526500331070?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwY2VyYW1pYyUyMGJvd2wlMjBjbGF5fGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1595351298005-4d29bb980ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwd2hlZWwlMjBjZXJhbWljc3xlbnwxfHx8fDE3NjUwODY1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1673436765901-6327d8030e38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwc3R1ZGlvJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
          ],
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    await kv.set('page:el-estudio', estudioPage);

    // Initialize Taller para Grupos page
    const tallerGruposPage = {
      id: 'taller-para-grupos',
      slug: 'espacios-privados',
      title: 'Taller para Grupos',
      sections: [
        {
          id: 'hero',
          type: 'hero',
          title: 'Taller para Grupos',
          subtitle: 'Experiencias cerámicas únicas',
          image: 'https://images.unsplash.com/photo-1759646828783-7e1b8f02f89b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwZ3JvdXAlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjUxMTk4MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        },
        {
          id: 'intro',
          type: 'text',
          content: 'Reserva nuestro estudio de forma privada para vivir una experiencia cerámica única con tu grupo. Ideal para team building empresarial, despedidas de soltero/a, cumpleaños, eventos familiares o simplemente para compartir una actividad creativa con amigos.',
        },
        {
          id: 'description',
          type: 'text',
          content: 'Diseñamos la experiencia según vuestras necesidades y nivel. Podéis elegir entre diferentes técnicas: modelado manual, torno, esmaltado o una combinación. Nuestro equipo os guiará durante toda la sesión para que todos creéis vuestra propia pieza única.\n\nEl estudio tiene capacidad para grupos de 6 a 12 personas. Incluimos todos los materiales, herramientas, hornada de las piezas y opcionalmente podemos organizar catering con bebidas y aperitivos para hacer la experiencia aún más especial.',
        },
        {
          id: 'pricing',
          type: 'pricing',
          title: 'Precio por Grupo',
          price: 'Desde 350€',
          subtitle: 'Grupo de 6-8 personas · 2,5 horas',
          includes: [
            'Alquiler privado del estudio',
            'Instructor profesional dedicado',
            'Todos los materiales (arcilla, esmaltes)',
            'Herramientas de trabajo',
            'Hornada de todas las piezas',
            'Delantales y toallas',
          ],
          extras: [
            { name: 'Catering con vinos y aperitivos', price: '+150€' },
            { name: 'Fotografía profesional del evento', price: '+100€' },
            { name: 'Sesión de torno privado', price: '+50€/persona' },
          ],
        },
        {
          id: 'event-types',
          type: 'list',
          title: 'Tipos de Eventos',
          items: [
            {
              title: 'Team Building Empresarial',
              description: 'Perfecta actividad para equipos de trabajo. Fomenta la creatividad, colaboración y desconexión en un ambiente relajado.',
            },
            {
              title: 'Despedidas de Soltero/a',
              description: 'Una alternativa original y divertida. Creación de piezas personalizadas, ambiente festivo y recuerdos únicos.',
            },
            {
              title: 'Cumpleaños y Celebraciones',
              description: 'Celebra de forma diferente. Sesión adaptada a la edad y nivel del grupo.',
            },
            {
              title: 'Eventos Familiares',
              description: 'Experiencias intergeneracionales donde toda la familia puede participar.',
            },
            {
              title: 'Eventos Corporativos',
              description: 'Lanzamientos de producto, eventos de clientes, incentivos para empleados.',
            },
          ],
        },
        {
          id: 'schedule',
          type: 'text',
          title: 'Horarios Disponibles',
          content: 'Flexibles según disponibilidad:\n• Sesiones entre semana (mañanas y tardes)\n• Fines de semana (mañanas preferentemente)\n• Eventos especiales en horario nocturno\n\nPara reservas y presupuestos personalizados, contáctanos por WhatsApp +34 633788860 o a info@casarosierceramica.com',
        },
        {
          id: 'cancellation',
          type: 'text',
          title: 'Política de Cancelación',
          content: 'Cancelación gratuita hasta 7 días antes del evento. Entre 7 y 3 días: devolución del 50% de la señal. Menos de 3 días: no reembolsable. Posibilidad de cambio de fecha según disponibilidad.',
        },
      ],
      visible: true,
      seo: {
        metaTitle: 'Taller para Grupos - Casa Rosier',
        metaDescription: 'Reserva nuestro estudio de cerámica para grupos. Ideal para team building, despedidas, cumpleaños y eventos corporativos en Barcelona.',
        keywords: 'taller cerámica grupos, team building barcelona, eventos corporativos cerámica, despedidas barcelona, actividades grupos',
      },
      updatedAt: new Date().toISOString(),
    };

    await kv.set('page:espacios-privados', tallerGruposPage);

    // Initialize Tarjeta de Regalo page
    const tarjetaRegaloPage = {
      slug: 'tarjeta-regalo',
      title: 'Tarjeta de Regalo',
      heroImage: 'https://images.unsplash.com/photo-1607081692251-ee5e4e70e5f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaWZ0JTIwY2VyYW1pY3N8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      content: '<h2>El regalo perfecto para los amantes de la cerámica</h2><p>¿Buscas un regalo original y especial? Nuestras tarjetas regalo son perfectas para que tus seres queridos descubran el mundo de la cerámica o continúen desarrollando su pasión.</p><h3>¿Cómo funciona?</h3><ol><li>Elige el valor de la tarjeta (desde 50€ hasta 500€)</li><li>Recibe tu tarjeta digital por email en minutos</li><li>Regálasela a quien quieras</li><li>El beneficiario puede canjearla en cualquier clase, workshop o producto de la tienda</li></ol><h3>Valores disponibles</h3><ul><li><strong>50€</strong> - Ideal para materiales o una clase de prueba</li><li><strong>120€</strong> - Una clase mensual completa</li><li><strong>250€</strong> - Workshop intensivo de fin de semana</li><li><strong>500€</strong> - Pack de clases o eventos privados</li></ul><p><strong>Válida por 12 meses desde su compra.</strong></p><p>Para adquirir tu tarjeta regalo, contáctanos por WhatsApp +34 633788860 o email info@casarosierceramica.com</p>',
      visible: true,
      seo: {
        metaTitle: 'Tarjeta de Regalo - Casa Rosier Cerámica Barcelona',
        metaDescription: 'Regala creatividad. Tarjetas regalo para clases de cerámica, workshops y productos en Casa Rosier Barcelona. Válidas 12 meses.',
        keywords: 'tarjeta regalo cerámica, gift card barcelona, regalar clases cerámica, voucher taller ceramica',
      },
      updatedAt: new Date().toISOString(),
    };
    await kv.set('page:tarjeta-regalo', tarjetaRegaloPage);

    // Initialize Blog page
    const blogPage = {
      slug: 'blog',
      title: 'Blog',
      content: '<h2>Descubre el mundo de la cerámica</h2><p>Artículos, tutoriales, inspiración y noticias del estudio.</p>',
      visible: true,
      seo: {
        metaTitle: 'Blog - Casa Rosier Cerámica',
        metaDescription: 'Artículos sobre cerámica, técnicas, inspiración y noticias del taller. Aprende más sobre el arte cerámico con Casa Rosier Barcelona.',
        keywords: 'blog cerámica, tutoriales cerámica, técnicas cerámicas, inspiración pottery',
      },
      updatedAt: new Date().toISOString(),
    };
    await kv.set('page:blog', blogPage);

    // Initialize Clases pages
    const clasesIniciacionPage = {
      slug: 'clases-iniciacion',
      title: 'Iniciación a la Cerámica',
      heroImage: 'https://images.unsplash.com/photo-1615220368787-d9d6f5e4f54b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWdpbm5lciUyMHBvdHRlcnl8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      content: '<h2>Tu primer paso en el mundo de la cerámica</h2><p>Clase diseñada especialmente para principiantes. No necesitas experiencia previa, solo ganas de crear y experimentar con tus manos.</p><h3>¿Qué aprenderás?</h3><ul><li>Introducción a las propiedades del barro</li><li>Técnicas básicas de modelado manual</li><li>Construcción de pellizco (pinch pot)</li><li>Placas y churros (coil building)</li><li>Texturizado y decoración</li><li>Proceso de secado y cocción</li><li>Introducción a los esmaltes</li></ul><h3>Información práctica</h3><p><strong>Duración:</strong> 4 sesiones de 2 horas (1 mes)</p><p><strong>Precio:</strong> 120€ (incluye materiales, hornadas y 1kg de arcilla)</p><p><strong>Horarios disponibles:</strong></p><ul><li>Lunes 18:00 - 20:00</li><li>Miércoles 10:00 - 12:00</li><li>Sábados 11:00 - 13:00</li></ul><p><strong>Grupos reducidos:</strong> Máximo 8 personas por clase</p><p>Al finalizar el curso, habrás creado entre 4-6 piezas únicas y tendrás las bases para continuar tu camino cerámico.</p><p><em>Reserva tu plaza escribiendo a info@casarosierceramica.com o por WhatsApp +34 633788860</em></p>',
      visible: true,
      seo: {
        metaTitle: 'Iniciación a la Cerámica - Clases para Principiantes Barcelona',
        metaDescription: 'Clases de cerámica para principiantes en Barcelona. Aprende modelado manual, técnicas básicas y crea tus primeras piezas. Grupos reducidos.',
        keywords: 'clases cerámica principiantes barcelona, iniciación cerámica, curso cerámica básico, aprender cerámica',
      },
      updatedAt: new Date().toISOString(),
    };
    await kv.set('page:clases-iniciacion', clasesIniciacionPage);

    const clasesRegularPage = {
      slug: 'clases-regular-modelado',
      title: 'Clases Regulares de Modelado',
      heroImage: 'https://images.unsplash.com/photo-1737564483280-15481c31608a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRzJTIwd29ya3Nob3B8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      content: '<h2>Clases mensuales de modelado manual</h2><p>Para quienes ya tienen experiencia o han completado la iniciación. Desarrolla tu estilo personal y profundiza en técnicas cerámicas avanzadas.</p><h3>Modalidades</h3><p><strong>Nivel Intermedio</strong><br>Perfecciona las técnicas básicas y aprende nuevas formas de construcción. Experimentación con texturas, engobes y decoración.</p><p><strong>Nivel Avanzado</strong><br>Proyectos complejos, esculturas, piezas de gran formato. Desarrollo de tu lenguaje artístico personal.</p><h3>¿Qué incluye?</h3><ul><li>4 sesiones mensuales de 2,5 horas</li><li>Acceso a todas las herramientas del estudio</li><li>Uso ilimitado de arcilla durante las sesiones</li><li>Asesoramiento personalizado</li><li>Todas las hornadas incluidas</li><li>Biblioteca de técnicas y recursos</li><li>Comunidad de ceramistas</li></ul><h3>Información práctica</h3><p><strong>Precio:</strong> 140€/mes</p><p><strong>Horarios:</strong></p><ul><li>Martes 10:00 - 12:30 o 18:00 - 20:30</li><li>Jueves 10:00 - 12:30 o 18:00 - 20:30</li><li>Viernes 10:00 - 12:30</li></ul><p><strong>Compromiso mínimo:</strong> 3 meses (con opción a continuar mes a mes después)</p><p><strong>Grupos:</strong> Máximo 8 personas</p><p><em>Plazas limitadas. Contacta para disponibilidad: info@casarosierceramica.com o WhatsApp +34 633788860</em></p>',
      visible: true,
      seo: {
        metaTitle: 'Clases Regulares de Modelado - Casa Rosier Barcelona',
        metaDescription: 'Clases mensuales de cerámica y modelado en Barcelona. Niveles intermedio y avanzado. Desarrolla tu estilo y técnica cerámica.',
        keywords: 'clases cerámica barcelona, modelado cerámico, curso cerámica avanzado, taller cerámica mensual',
      },
      updatedAt: new Date().toISOString(),
    };
    await kv.set('page:clases-regular-modelado', clasesRegularPage);

    const clasesTornoPage = {
      slug: 'clases-torno',
      title: 'Modelado con Torno',
      heroImage: 'https://images.unsplash.com/photo-1595351298005-4d29bb980ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwd2hlZWwlMjBjZXJhbWljc3xlbnwxfHx8fDE3NjUwODY1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      content: '<h2>Aprende el arte del torno cerámico</h2><p>El torno es una de las técnicas más fascinantes de la cerámica. Requiere paciencia, práctica y dedicación, pero los resultados son increíblemente gratificantes.</p><h3>Niveles</h3><p><strong>Torno Iniciación (4 semanas)</strong><br>Fundamentos del centrado, apertura y levantado de paredes. Cilindros, cuencos básicos y acabados.</p><p><strong>Precio:</strong> 160€ (materiales y hornadas incluidas)</p><p><strong>Torno Intermedio (mensual)</strong><br>Formas más complejas, jarras, platos, teteras. Torneado de piezas grandes y refinamiento técnico.</p><p><strong>Precio:</strong> 150€/mes</p><p><strong>Torno Avanzado (mensual)</strong><br>Juegos de piezas, formas asimétricas, técnicas japonesas, nerikomi en torno.</p><p><strong>Precio:</strong> 150€/mes</p><h3>¿Qué incluye?</h3><ul><li>Sesiones de 2,5 horas</li><li>Torno individual por persona</li><li>Arcilla ilimitada durante la sesión</li><li>Herramientas especializadas</li><li>Seguimiento personalizado</li><li>Todas las cocciones incluidas</li></ul><h3>Horarios</h3><ul><li>Lunes 18:00 - 20:30</li><li>Miércoles 10:00 - 12:30 o 18:00 - 20:30</li><li>Sábados 16:00 - 18:30</li></ul><p><strong>Grupos ultra-reducidos:</strong> Máximo 4 personas (2 tornos compartidos)</p><p><em>Reserva tu torno: info@casarosierceramica.com o WhatsApp +34 633788860</em></p>',
      visible: true,
      seo: {
        metaTitle: 'Clases de Torno Cerámico - Casa Rosier Barcelona',
        metaDescription: 'Aprende torno cerámico en Barcelona. Clases para todos los niveles. Grupos reducidos con torno individual. Iniciación, intermedio y avanzado.',
        keywords: 'clases torno barcelona, pottery wheel barcelona, aprender torno cerámico, curso torno alfarero',
      },
      updatedAt: new Date().toISOString(),
    };
    await kv.set('page:clases-torno', clasesTornoPage);

    // Initialize Workshops pages
    const workshopEsmaltesOnlinePage = {
      slug: 'workshop-esmaltes-online',
      title: 'Workshop Esmaltes Online vía Zoom',
      heroImage: 'https://images.unsplash.com/photo-1668840306122-526500331070?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwY2VyYW1pYyUyMGJvd2wlMjBjbGF5fGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
      content: '<h2>Formación en esmaltes cerámicos desde casa</h2><p>Workshop online intensivo sobre química y formulación de esmaltes cerámicos. Aprende a crear tus propios esmaltes y entender cómo funcionan.</p><h3>Programa del curso</h3><p><strong>Módulo 1: Fundamentos de química cerámica</strong></p><ul><li>Introducción a los óxidos y su función</li><li>Temperaturas de cocción y atmósferas</li><li>Bases, fundentes y opacificantes</li></ul><p><strong>Módulo 2: Formulación de esmaltes</strong></p><ul><li>Método Seger y cálculos de fórmula</li><li>Software para formulación (GlazeMaster)</li><li>Creación de bases de datos personales</li></ul><p><strong>Módulo 3: Esmaltes específicos</strong></p><ul><li>Transparentes y opacos</li><li>Mates y brillantes</li><li>Colores y pigmentos</li><li>Efectos especiales (craquelado, cristalizaciones)</li></ul><p><strong>Módulo 4: Problemas y soluciones</strong></p><ul><li>Defectos comunes y cómo solucionarlos</li><li>Ajustes de fórmulas</li><li>Testeo y documentación</li></ul><h3>Detalles prácticos</h3><p><strong>Formato:</strong> 4 sesiones en vivo de 2,5 horas + material complementario</p><p><strong>Plataforma:</strong> Zoom (sesiones grabadas disponibles 30 días)</p><p><strong>Incluye:</strong></p><ul><li>Manual digital completo (PDF)</li><li>Hojas de cálculo de formulación</li><li>Base de datos de 50+ recetas</li><li>Acceso a grupo privado de WhatsApp</li><li>Certificado de participación</li></ul><p><strong>Precio:</strong> 180€</p><p><strong>Próximas fechas:</strong></p><ul><li>15, 17, 22 y 24 de enero - 19:00h (hora España)</li><li>12, 14, 19 y 21 de febrero - 19:00h (hora España)</li></ul><p><strong>Requisitos:</strong> Conocimientos básicos de cerámica recomendados</p><p><em>Inscripciones: info@casarosierceramica.com</em></p>',
      visible: true,
      seo: {
        metaTitle: 'Workshop Esmaltes Online - Formación Zoom Casa Rosier',
        metaDescription: 'Curso online de esmaltes cerámicos vía Zoom. Aprende química, formulación y método Seger desde casa. 4 sesiones en vivo con certificado.',
        keywords: 'curso esmaltes online, formación cerámica zoom, química cerámica, método seger, esmaltes cerámicos',
      },
      updatedAt: new Date().toISOString(),
    };
    await kv.set('page:workshop-esmaltes-online', workshopEsmaltesOnlinePage);

    const workshopEsmaltesBarcelonaPage = {
      slug: 'workshop-esmaltes-barcelona',
      title: 'Workshop Esmaltes Barcelona',
      heroImage: 'https://images.unsplash.com/photo-1673436765901-6327d8030e38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwc3R1ZGlvJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
      content: '<h2>Workshop presencial de esmaltes en Barcelona</h2><p>Sumérgete en el fascinante mundo de los esmaltes cerámicos en nuestro estudio. Workshop intensivo de fin de semana con práctica hands-on.</p><h3>Programa</h3><p><strong>Sábado (10:00 - 14:00 y 15:30 - 18:30)</strong></p><ul><li>Mañana: Teoría de esmaltes, química básica, tipos de esmaltes</li><li>Tarde: Formulación práctica, preparación de testeos, aplicación</li></ul><p><strong>Domingo (10:00 - 14:00)</strong></p><ul><li>Análisis de resultados de horneada test</li><li>Ajustes y correcciones de fórmulas</li><li>Aplicación final en piezas</li></ul><h3>Metodología práctica</h3><p>Cada participante formulará, preparará y aplicará 10-15 esmaltes diferentes. Trabajaremos con balanza de precisión, molino de bolas y todas las herramientas profesionales.</p><h3>¿Qué incluye?</h3><ul><li>11 horas de formación intensiva</li><li>Todos los materiales (óxidos, fundentes, bases)</li><li>10 plaquetas de gres para testeo</li><li>3 piezas de gres biscochas para aplicar</li><li>Manual completo impreso</li><li>Recetario de 100+ esmaltes</li><li>Coffee break sábado y domingo</li><li>Hornada de todas las piezas</li><li>Certificado de asistencia</li></ul><h3>Información práctica</h3><p><strong>Precio:</strong> 280€</p><p><strong>Plazas:</strong> Máximo 6 personas</p><p><strong>Nivel:</strong> Intermedio (requiere conocimientos básicos de cerámica)</p><p><strong>Próximas fechas:</strong></p><ul><li>25-26 de enero 2025</li><li>15-16 de febrero 2025</li><li>22-23 de marzo 2025</li></ul><p><em>Reservas: info@casarosierceramica.com o WhatsApp +34 633788860</em></p>',
      visible: true,
      seo: {
        metaTitle: 'Workshop Esmaltes Barcelona - Casa Rosier',
        metaDescription: 'Workshop intensivo de esmaltes cerámicos en Barcelona. Fin de semana práctico de formulación y aplicación. Grupos reducidos.',
        keywords: 'workshop esmaltes barcelona, curso esmaltes cerámicos, formación esmaltes presencial, química cerámica barcelona',
      },
      updatedAt: new Date().toISOString(),
    };
    await kv.set('page:workshop-esmaltes-barcelona', workshopEsmaltesBarcelonaPage);

    const workshopLaboratorioPage = {
      slug: 'workshop-laboratorio-ceramico',
      title: 'Laboratorio Cerámico',
      heroImage: 'https://images.unsplash.com/photo-1606675994883-98896ce5ad8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWJvcmF0b3J5JTIwY2VyYW1pY3N8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      content: '<h2>Experimentación cerámica avanzada</h2><p>Para ceramistas que quieren llevar su trabajo al siguiente nivel. Un espacio de investigación y desarrollo de técnicas, materiales y procesos cerámicos.</p><h3>Áreas de experimentación</h3><p><strong>Pastas y arcillas</strong></p><ul><li>Formulación de pastas personalizadas</li><li>Chamotas y aditivos</li><li>Porcelanas coloreadas</li><li>Paperclay y otros cuerpos especiales</li></ul><p><strong>Esmaltes avanzados</strong></p><ul><li>Cristalizaciones y efectos volcánicos</li><li>Óxidos de cobre en reducción</li><li>Raku y técnicas alternativas</li><li>Lusters y terceras cocciones</li></ul><p><strong>Superficies y decoración</strong></p><ul><li>Engobes vitrificados</li><li>Terra sigillata</li><li>Nerikomi y agateado</li><li>Técnicas mixtas</li></ul><h3>Formato del workshop</h3><p>Intensivo de 3 días consecutivos (viernes tarde, sábado y domingo completos)</p><p><strong>Horario:</strong></p><ul><li>Viernes: 16:00 - 20:00</li><li>Sábado: 10:00 - 14:00 y 15:30 - 19:30</li><li>Domingo: 10:00 - 14:00 y 15:00 - 18:00</li></ul><p><strong>Total:</strong> 21 horas de laboratorio intensivo</p><h3>¿Qué incluye?</h3><ul><li>Acceso completo al laboratorio y equipamiento</li><li>Materiales ilimitados para experimentación</li><li>Supervisión y mentoría de ceramista profesional</li><li>Documentación fotográfica de todo el proceso</li><li>15kg de diferentes arcillas</li><li>Múltiples hornadas (oxidación, reducción, raku)</li><li>Manual de experimentación</li><li>Meals: comidas del sábado y domingo</li></ul><p><strong>Precio:</strong> 420€</p><p><strong>Nivel:</strong> Avanzado (se requiere experiencia previa sólida)</p><p><strong>Plazas:</strong> Máximo 4 personas</p><p><strong>Próximas fechas:</strong></p><ul><li>7-9 de febrero 2025</li><li>21-23 de marzo 2025</li><li>16-18 de mayo 2025</li></ul><p><em>Inscripciones limitadas: info@casarosierceramica.com</em></p>',
      visible: true,
      seo: {
        metaTitle: 'Laboratorio Cerámico - Workshop Avanzado Barcelona',
        metaDescription: 'Workshop intensivo de experimentación cerámica. 3 días de investigación en pastas, esmaltes y técnicas avanzadas. Barcelona.',
        keywords: 'laboratorio cerámico, workshop cerámica avanzado, experimentación cerámica, técnicas cerámicas barcelona',
      },
      updatedAt: new Date().toISOString(),
    };
    await kv.set('page:workshop-laboratorio-ceramico', workshopLaboratorioPage);

    const workshopMetodoSegerPage = {
      slug: 'workshop-metodo-seger',
      title: 'Método Seger',
      heroImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBzY2llbmNlfGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
      content: '<h2>Domina la formulación científica de esmaltes</h2><p>Workshop especializado en el Método Seger, la herramienta más poderosa para entender y crear esmaltes cerámicos desde una base científica.</p><h3>¿Qué es el Método Seger?</h3><p>Sistema de cálculo molecular que permite comprender la composición química de los esmaltes y predecir su comportamiento. Desarrollado por Hermann Seger en el siglo XIX, sigue siendo fundamental para ceramistas serios.</p><h3>Programa del curso</h3><p><strong>Día 1: Fundamentos</strong></p><ul><li>Química cerámica: óxidos y su función molecular</li><li>Concepto de equivalente molecular</li><li>Estructura de la fórmula Seger (RO, R2O3, RO2)</li><li>Límites de Seger para diferentes temperaturas</li></ul><p><strong>Día 2: Cálculos y conversiones</strong></p><ul><li>De receta a fórmula Seger (paso a paso)</li><li>De fórmula Seger a receta</li><li>Uso de software especializado</li><li>Ejercicios prácticos de conversión</li></ul><p><strong>Día 3: Formulación creativa</strong></p><ul><li>Diseño de esmaltes desde cero</li><li>Ajuste de fórmulas existentes</li><li>Sustitución de materiales</li><li>Resolución de problemas específicos</li></ul><p><strong>Día 4: Aplicación y testeo</strong></p><ul><li>Preparación de las fórmulas calculadas</li><li>Aplicación en testigos</li><li>Metodología de documentación</li><li>Análisis de resultados (en sesión de seguimiento)</li></ul><h3>Modalidad</h3><p><strong>Presencial en Barcelona:</strong> 4 sesiones de 3 horas (sábados consecutivos)</p><p><strong>Precio:</strong> 220€</p><p><strong>Híbrido (2 presenciales + 2 online):</strong></p><p><strong>Precio:</strong> 190€</p><h3>Incluye</h3><ul><li>Manual completo del Método Seger (80 páginas)</li><li>Plantillas de cálculo en Excel</li><li>Acceso a software GlazeChem</li><li>10 testigos cerámicos</li><li>Materiales para preparar 5 esmaltes</li><li>Biblioteca de fórmulas Seger</li><li>Certificado oficial</li></ul><p><strong>Nivel requerido:</strong> Intermedio/Avanzado (conocimientos previos de cerámica y esmaltes básicos)</p><p><strong>Plazas:</strong> Máximo 8 personas</p><p><strong>Próximas fechas presenciales:</strong></p><ul><li>Enero: 11, 18, 25 de enero y 1 de febrero (sábados 10:00-13:00)</li><li>Marzo: 8, 15, 22, 29 de marzo (sábados 10:00-13:00)</li></ul><p><em>Reserva tu plaza: info@casarosierceramica.com o WhatsApp +34 633788860</em></p>',
      visible: true,
      seo: {
        metaTitle: 'Método Seger - Workshop Formulación Esmaltes Barcelona',
        metaDescription: 'Aprende el Método Seger para formular esmaltes cerámicos. Workshop presencial u online. Química cerámica avanzada en Barcelona.',
        keywords: 'método seger, formulación esmaltes, química cerámica, cálculo molecular esmaltes, curso seger barcelona',
      },
      updatedAt: new Date().toISOString(),
    };
    await kv.set('page:workshop-metodo-seger', workshopMetodoSegerPage);

    // Initialize Menu
    const menu = {
      items: [
        { name: 'Inicio', path: '/', order: 0 },
        {
          name: 'Clases',
          order: 1,
          submenu: [
            { name: 'Iniciación a la cerámica', path: '/clases-iniciacion', order: 0 },
            { name: 'Regular de modelado', path: '/clases-regular-modelado', order: 1 },
            { name: 'Modelado con torno', path: '/clases-torno', order: 2 },
          ],
        },
        {
          name: 'Workshops',
          order: 2,
          submenu: [
            { name: 'Esmaltes online vía zoom', path: '/workshop-esmaltes-online', order: 0 },
            { name: 'Esmaltes Barcelona', path: '/workshop-esmaltes-barcelona', order: 1 },
            { name: 'Laboratorio Cerámico', path: '/workshop-laboratorio-ceramico', order: 2 },
            { name: 'Método Seger', path: '/workshop-metodo-seger', order: 3 },
          ],
        },
        {
          name: 'Reservas Privadas',
          order: 3,
          submenu: [
            { name: 'Taller para grupos', path: '/espacios-privados', order: 0 },
          ],
        },
        { name: 'Tarjeta de regalo', path: '/tarjeta-regalo', order: 4 },
        { name: 'El Estudio', path: '/el-estudio', order: 5 },
        { name: 'Blog', path: '/blog', order: 6 },
        { name: 'Tiendita', path: '/tiendita', order: 7 },
      ],
      updatedAt: new Date().toISOString(),
    };

    await kv.set('menu', menu);

    // Initialize CLASES and WORKSHOPS
    await seedClasses();
    await seedWorkshops();

    return c.json({ 
      success: true, 
      message: 'Contenido inicializado correctamente. Se han creado 3 clases y 4 workshops.' 
    });
  } catch (error) {
    console.error('Error initializing content:', error);
    return c.json({ error: `Error initializing content: ${error}` }, 500);
  }
});

// Initialize only CLASSES
app.post("/make-server-0ba58e95/initialize-classes", verifyAuth, async (c) => {
  try {
    await seedClasses();
    return c.json({ 
      success: true, 
      message: '✅ Se han creado 3 clases de prueba' 
    });
  } catch (error) {
    console.error('Error initializing classes:', error);
    return c.json({ error: `Error initializing classes: ${error}` }, 500);
  }
});

// Initialize only WORKSHOPS
app.post("/make-server-0ba58e95/initialize-workshops", verifyAuth, async (c) => {
  try {
    await seedWorkshops();
    return c.json({ 
      success: true, 
      message: '✅ Se han creado 4 workshops de prueba' 
    });
  } catch (error) {
    console.error('Error initializing workshops:', error);
    return c.json({ error: `Error initializing workshops: ${error}` }, 500);
  }
});

// ==================== HISTORY ENDPOINTS ====================

// Get version history for a content item (requires auth)
app.get("/make-server-0ba58e95/history/:itemId", verifyAuth, async (c) => {
  try {
    const itemId = c.req.param('itemId');
    const versions = await kv.getByPrefix(`history:${itemId}:`);
    
    // Ordenar por fecha (más reciente primero)
    const sortedVersions = versions.sort((a: any, b: any) => {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });
    
    // Filtrar versiones más antiguas que 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentVersions = sortedVersions.filter((v: any) => {
      return new Date(v.savedAt) > thirtyDaysAgo;
    });
    
    return c.json({ versions: recentVersions });
  } catch (error) {
    console.error('Error getting version history:', error);
    return c.json({ error: `Error getting version history: ${error}` }, 500);
  }
});

// Restore a specific version (requires auth)
app.post("/make-server-0ba58e95/history/:itemId/restore/:versionId", verifyAuth, async (c) => {
  try {
    const itemId = c.req.param('itemId');
    const versionId = c.req.param('versionId');
    
    // Obtener la versión a restaurar
    const version = await kv.get(`history:${itemId}:${versionId}`);
    
    if (!version) {
      return c.json({ error: 'Versión no encontrada' }, 404);
    }
    
    // Guardar versión actual antes de restaurar
    const currentItem = await kv.get(`content:${itemId}`);
    if (currentItem) {
      const backupVersionId = `version:${Date.now()}:${Math.random().toString(36).substring(7)}`;
      await kv.set(`history:${itemId}:${backupVersionId}`, {
        ...currentItem,
        versionId: backupVersionId,
        savedAt: new Date().toISOString(),
      });
    }
    
    // Restaurar la versión seleccionada
    const { versionId: _versionId, savedAt: _savedAt, ...itemData } = version;
    const restoredItem = {
      ...itemData,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`content:${itemId}`, restoredItem);
    
    return c.json({ 
      success: true, 
      item: restoredItem,
      message: 'Versión restaurada exitosamente'
    });
  } catch (error) {
    console.error('Error restoring version:', error);
    return c.json({ error: `Error restoring version: ${error}` }, 500);
  }
});

// ==================== CLEANUP TASKS ====================

// Limpiar versiones antiguas (mayores a 30 días)
async function cleanupOldVersions() {
  try {
    const allKeys = await kv.getByPrefix('history:');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let deletedCount = 0;
    
    for (const item of allKeys) {
      if (item.savedAt && new Date(item.savedAt) < thirtyDaysAgo) {
        // Extraer la clave completa del item
        const matches = allKeys.filter((k: any) => 
          k.versionId === item.versionId && k.savedAt === item.savedAt
        );
        
        if (matches.length > 0) {
          // Construir la clave para eliminar
          const itemId = item.id;
          const versionId = item.versionId;
          await kv.del(`history:${itemId}:${versionId}`);
          deletedCount++;
        }
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old versions`);
    }
  } catch (error) {
    console.error('Error cleaning up old versions:', error);
  }
}

// Ejecutar limpieza cada 24 horas
setInterval(cleanupOldVersions, 24 * 60 * 60 * 1000);

// Ejecutar limpieza inicial después de 1 minuto
setTimeout(cleanupOldVersions, 60 * 1000);

Deno.serve(app.fetch);