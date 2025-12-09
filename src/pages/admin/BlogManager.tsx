import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { blogAPI } from '../../utils/api';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { RichTextEditor } from '../../components/RichTextEditor';
import { ImageUploader } from '../../components/ImageUploader';
import { slugify } from '../../utils/slugify';
import { NavigationBlocker } from '../../components/NavigationBlocker';

export function BlogManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [initialPostSnapshot, setInitialPostSnapshot] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Detectar cambios no guardados
  useEffect(() => {
    if (editingPost) {
      const currentSnapshot = JSON.stringify(editingPost);
      setHasUnsavedChanges(currentSnapshot !== initialPostSnapshot);
    }
  }, [editingPost, initialPostSnapshot]);

  // Prevenir cierre de ventana con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getPosts();
      setPosts(response.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPost({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      author: 'Casa Rosier',
      published: false,
      featuredImage: '',
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: '',
      },
    });
    setSlugManuallyEdited(false);
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setInitialPostSnapshot(JSON.stringify(post));
    setSlugManuallyEdited(!!post.slug);
  };

  const handleTitleChange = (title: string) => {
    const newPost = { ...editingPost, title };
    
    // Auto-generar slug si no se ha editado manualmente
    if (!slugManuallyEdited) {
      newPost.slug = slugify(title);
    }
    
    setEditingPost(newPost);
  };

  const handleSlugChange = (slug: string) => {
    setEditingPost({ ...editingPost, slug });
    setSlugManuallyEdited(true);
  };

  const handleSave = async () => {
    if (!editingPost) return;

    try {
      await blogAPI.savePost(editingPost);
      setEditingPost(null);
      loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error al guardar');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('¿Eliminar este post?')) return;

    try {
      await blogAPI.deletePost(slug);
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (editingPost) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl mb-8">{editingPost.slug ? 'Editar' : 'Crear'} Post</h1>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Título</label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Slug</label>
                <input
                  type="text"
                  value={editingPost.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Extracto</label>
                <textarea
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Contenido (Markdown soportado)</label>
                <RichTextEditor
                  value={editingPost.content}
                  onChange={(value) => setEditingPost({ ...editingPost, content: value })}
                />
              </div>

              <div>
                <ImageUploader
                  currentImage={editingPost.featuredImage}
                  onImageSelect={(url) => setEditingPost({ ...editingPost, featuredImage: url })}
                  label="Imagen destacada"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Autor</label>
                <input
                  type="text"
                  value={editingPost.author}
                  onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={editingPost.published}
                  onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="published" className="text-sm">
                  Publicar en el sitio web
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setEditingPost(null)}
              className="px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              onClick={handleSave}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Guardar
            </motion.button>
          </div>
        </div>

        {/* Bloqueador de navegación */}
        <NavigationBlocker
          when={hasUnsavedChanges}
          onSave={async () => {
            await handleSave();
          }}
          onDiscard={() => {
            setHasUnsavedChanges(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Blog</h1>
          <p className="text-foreground/60">Crea y administra artículos</p>
        </div>
        <motion.button
          onClick={handleCreate}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Nuevo post
        </motion.button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-foreground/60 mb-4">No hay posts todavía</p>
          <button onClick={handleCreate} className="text-primary hover:underline">
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div key={post.slug} className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6">
              {post.featuredImage && (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl">{post.title}</h3>
                  {post.published ? (
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Publicado
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                      Borrador
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/60">{post.excerpt}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5 text-foreground/70" />
                </button>
                <button
                  onClick={() => handleDelete(post.slug)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}