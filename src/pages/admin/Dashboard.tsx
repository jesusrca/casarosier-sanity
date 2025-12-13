import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  FileText, 
  BookOpen, 
  Mail, 
  Users, 
  Eye, 
  Clock,
  TrendingUp,
  Calendar,
  Plus,
  ArrowRight,
  MailOpen,
  FileImage
} from 'lucide-react';
import { contentAPI, blogAPI, messagesAPI, userAPI, pagesAPI } from '../../utils/api';
import { notify } from '../../utils/notifications';

interface DashboardStats {
  totalClasses: number;
  visibleClasses: number;
  totalWorkshops: number;
  totalBlogPosts: number;
  publishedPosts: number;
  unreadMessages: number;
  totalMessages: number;
  totalUsers: number;
  totalPages: number;
}

interface RecentActivity {
  type: 'class' | 'workshop' | 'blog' | 'message';
  title: string;
  date: string;
  status?: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    visibleClasses: 0,
    totalWorkshops: 0,
    totalBlogPosts: 0,
    publishedPosts: 0,
    unreadMessages: 0,
    totalMessages: 0,
    totalUsers: 0,
    totalPages: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar todas las métricas en paralelo
      const [contentRes, blogRes, messagesRes, usersRes, pagesRes] = await Promise.allSettled([
        contentAPI.getAllItems(),
        blogAPI.getPosts(),
        messagesAPI.getMessages(),
        userAPI.getAllUsers().catch(() => ({ users: [] })), // No todos tienen acceso a users
        pagesAPI.getAllPages(),
      ]);

      // Procesar contenido (clases y workshops)
      if (contentRes.status === 'fulfilled') {
        const items = contentRes.value.items || [];
        const classes = items.filter((item: any) => item.type === 'class');
        const workshops = items.filter((item: any) => item.type === 'workshop');
        
        setStats(prev => ({
          ...prev,
          totalClasses: classes.length,
          visibleClasses: classes.filter((c: any) => c.visible).length,
          totalWorkshops: workshops.length,
        }));

        // Agregar a actividad reciente
        const recentContent = items
          .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
          .slice(0, 3)
          .map((item: any) => ({
            type: item.type,
            title: item.title,
            date: item.updatedAt || item.createdAt,
            status: item.visible ? 'Visible' : 'Oculto',
          }));
        
        setRecentActivity(prev => [...prev, ...recentContent]);
      }

      // Procesar blog
      if (blogRes.status === 'fulfilled') {
        const posts = blogRes.value.posts || [];
        setStats(prev => ({
          ...prev,
          totalBlogPosts: posts.length,
          publishedPosts: posts.filter((p: any) => p.published).length,
        }));
      }

      // Procesar mensajes
      if (messagesRes.status === 'fulfilled') {
        const messages = messagesRes.value.messages || [];
        setStats(prev => ({
          ...prev,
          totalMessages: messages.length,
          unreadMessages: messages.filter((m: any) => m.status === 'unread').length,
        }));

        // Agregar mensajes recientes
        const recentMessages = messages
          .slice(0, 2)
          .map((msg: any) => ({
            type: 'message' as const,
            title: `${msg.name}: ${msg.subject}`,
            date: msg.createdAt,
            status: msg.status,
          }));
        
        setRecentActivity(prev => [...prev, ...recentMessages]);
      }

      // Procesar usuarios
      if (usersRes.status === 'fulfilled') {
        const users = usersRes.value.users || [];
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
        }));
      }

      // Procesar páginas
      if (pagesRes.status === 'fulfilled') {
        const pages = pagesRes.value.pages || [];
        setStats(prev => ({
          ...prev,
          totalPages: pages.length,
        }));
      }

      // Ordenar actividad reciente por fecha
      setRecentActivity(prev => 
        prev.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
      );

    } catch (error) {
      notify.error('Error al cargar las métricas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Clases',
      value: stats.totalClasses,
      subtitle: `${stats.visibleClasses} visibles`,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/admin/dashboard/content',
    },
    {
      title: 'Workshops',
      value: stats.totalWorkshops,
      subtitle: 'Total publicados',
      icon: BookOpen,
      color: 'bg-purple-500',
      link: '/admin/dashboard/content',
    },
    {
      title: 'Blog Posts',
      value: stats.totalBlogPosts,
      subtitle: `${stats.publishedPosts} publicados`,
      icon: BookOpen,
      color: 'bg-green-500',
      link: '/admin/dashboard/blog',
    },
    {
      title: 'Mensajes',
      value: stats.totalMessages,
      subtitle: `${stats.unreadMessages} sin leer`,
      icon: Mail,
      color: 'bg-orange-500',
      link: '/admin/dashboard/messages',
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : undefined,
    },
    {
      title: 'Páginas',
      value: stats.totalPages,
      subtitle: 'Páginas personalizadas',
      icon: FileImage,
      color: 'bg-indigo-500',
      link: '/admin/dashboard/pages',
    },
    {
      title: 'Usuarios',
      value: stats.totalUsers,
      subtitle: 'Administradores',
      icon: Users,
      color: 'bg-pink-500',
      link: '/admin/dashboard/users',
    },
  ];

  const quickActions = [
    {
      title: 'Nueva Clase',
      description: 'Crear una nueva clase de cerámica',
      icon: Plus,
      link: '/admin/dashboard/content',
      color: 'bg-primary',
    },
    {
      title: 'Nuevo Post',
      description: 'Publicar un nuevo artículo en el blog',
      icon: Plus,
      link: '/admin/dashboard/blog',
      color: 'bg-secondary',
    },
    {
      title: 'Nueva Página',
      description: 'Crear una página personalizada',
      icon: Plus,
      link: '/admin/dashboard/pages',
      color: 'bg-accent',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'class':
      case 'workshop':
        return FileText;
      case 'blog':
        return BookOpen;
      case 'message':
        return Mail;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'text-blue-600';
      case 'workshop':
        return 'text-purple-600';
      case 'blog':
        return 'text-green-600';
      case 'message':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/60">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl mb-2">Dashboard</h1>
        <p className="text-foreground/60">
          Bienvenido al panel de administración de Casa Rosier
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
              >
                {/* Badge */}
                {stat.badge && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {stat.badge}
                  </div>
                )}

                {/* Icon */}
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Stats */}
                <div className="mb-2">
                  <div className="text-3xl mb-1">{stat.value}</div>
                  <div className="text-sm text-foreground/60">{stat.title}</div>
                </div>

                {/* Subtitle */}
                <div className="text-xs text-foreground/50 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.subtitle}
                </div>

                {/* Hover effect */}
                <div className="absolute bottom-0 right-0 transform translate-x-2 translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-foreground/20" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-left">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.link}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow group"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base mb-1 group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-foreground/60">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 text-left">Actividad Reciente</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-foreground/60">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay actividad reciente</p>
            </div>
          ) : (
            <div className="divide-y divide-foreground/10">
              {recentActivity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-4 hover:bg-foreground/5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate mb-1">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-foreground/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(activity.date)}
                          </span>
                          {activity.status && (
                            <span className={`px-2 py-0.5 rounded-full ${
                              activity.status === 'Visible' || activity.status === 'read'
                                ? 'bg-green-100 text-green-700'
                                : activity.status === 'unread'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {activity.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
