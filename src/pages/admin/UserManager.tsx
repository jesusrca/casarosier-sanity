import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { userAPI } from '../../utils/api';
import { Plus, Edit, Trash2, Eye, EyeOff, Shield, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  active: boolean;
  createdAt: string;
}

const ROLES = [
  { value: 'super_admin', label: 'Super Admin', description: 'Acceso total incluyendo gestión de usuarios' },
  { value: 'admin', label: 'Administrador', description: 'Puede gestionar todo el contenido' },
  { value: 'editor', label: 'Editor', description: 'Puede crear y editar contenido' },
  { value: 'viewer', label: 'Visualizador', description: 'Solo puede ver el contenido' },
];

export function UserManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<Partial<AdminUser> | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    // Solo cargar usuarios si el usuario actual es super admin
    if (currentUserRole === 'super_admin') {
      loadUsers();
    } else if (currentUserRole && currentUserRole !== 'super_admin') {
      // Si no es super admin, redirigir al dashboard
      setLoading(false);
    }
  }, [currentUserRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const response = await userAPI.getCurrentUser();
      setCurrentUserRole(response.user?.role || '');
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const handleCreate = () => {
    setEditingUser({
      email: '',
      name: '',
      role: 'editor',
      active: true,
    });
    setPassword('');
    setConfirmPassword('');
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSave = async () => {
    if (!editingUser) return;

    // Validaciones
    if (!editingUser.email || !editingUser.name || !editingUser.role) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!editingUser.id && !password) {
      alert('La contraseña es requerida para nuevos usuarios');
      return;
    }

    if (password && password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (password && password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const userData = {
        ...editingUser,
        ...(password ? { password } : {}),
      };

      if (editingUser.id) {
        await userAPI.updateUser(editingUser.id, userData);
      } else {
        await userAPI.createUser(userData);
      }

      setEditingUser(null);
      setPassword('');
      setConfirmPassword('');
      loadUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.message || 'Error al guardar el usuario');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    try {
      await userAPI.deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar el usuario');
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      await userAPI.updateUser(user.id, { ...user, active: !user.active });
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'editor':
        return 'bg-green-100 text-green-700';
      case 'viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    return ROLES.find(r => r.value === role)?.label || role;
  };

  const canManageUsers = currentUserRole === 'super_admin';

  if (!canManageUsers && !loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Shield className="w-16 h-16 text-foreground/40 mx-auto mb-4" />
        <h2 className="text-2xl mb-2">Acceso Denegado</h2>
        <p className="text-foreground/60">
          Solo los Super Administradores pueden gestionar usuarios
        </p>
      </div>
    );
  }

  if (editingUser) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl mb-8">{editingUser.id ? 'Editar' : 'Crear'} Usuario</h1>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Email *</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={!!editingUser.id}
                />
                {editingUser.id && (
                  <p className="text-xs text-foreground/60 mt-1">
                    El email no se puede cambiar después de crear el usuario
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2">Contraseña {!editingUser.id && '*'}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser.id ? 'Dejar vacío para mantener la actual' : 'Mínimo 6 caracteres'}
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Confirmar Contraseña {!editingUser.id && '*'}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={editingUser.id ? 'Dejar vacío para mantener la actual' : 'Repite la contraseña'}
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Nivel de Administración *</label>
                <select
                  value={editingUser.role || 'editor'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <div className="mt-3 space-y-2">
                  {ROLES.map((role) => (
                    <div
                      key={role.value}
                      className={`p-3 rounded-lg text-sm ${
                        editingUser.role === role.value
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-foreground/5'
                      }`}
                    >
                      <div className="font-medium">{role.label}</div>
                      <div className="text-foreground/60 text-xs mt-1">{role.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={editingUser.active !== false}
                  onChange={(e) => setEditingUser({ ...editingUser, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm">
                  Usuario activo (puede iniciar sesión)
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setEditingUser(null);
                setPassword('');
                setConfirmPassword('');
              }}
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
              Guardar Usuario
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Usuarios</h1>
          <p className="text-foreground/60">Gestiona los usuarios con acceso al panel de administración</p>
        </div>
        <motion.button
          onClick={handleCreate}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </motion.button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <User className="w-16 h-16 text-foreground/40 mx-auto mb-4" />
          <p className="text-foreground/60 mb-4">No hay usuarios todavía</p>
          <button onClick={handleCreate} className="text-primary hover:underline">
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl">{user.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                  {user.active ? (
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Activo
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/60">{user.email}</p>
                <p className="text-xs text-foreground/40 mt-1">
                  Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(user)}
                  className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                  title={user.active ? 'Desactivar' : 'Activar'}
                >
                  {user.active ? (
                    <EyeOff className="w-5 h-5 text-foreground/70" />
                  ) : (
                    <Eye className="w-5 h-5 text-foreground/70" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(user)}
                  className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5 text-foreground/70" />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={user.role === 'super_admin' && users.filter(u => u.role === 'super_admin').length === 1}
                  title={
                    user.role === 'super_admin' && users.filter(u => u.role === 'super_admin').length === 1
                      ? 'No se puede eliminar el último Super Admin'
                      : 'Eliminar usuario'
                  }
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