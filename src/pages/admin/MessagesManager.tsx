import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { messagesAPI } from '../../utils/api';
import { Mail, MailOpen, Trash2, Archive, Clock, User, Phone, AtSign } from 'lucide-react';

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
}

export function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getMessages();
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      alert('Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (message: Message) => {
    try {
      await messagesAPI.updateStatus(message.id, 'read');
      loadMessages();
      if (selectedMessage?.id === message.id) {
        setSelectedMessage({ ...message, status: 'read' });
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleArchive = async (message: Message) => {
    try {
      await messagesAPI.updateStatus(message.id, 'archived');
      loadMessages();
      if (selectedMessage?.id === message.id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error archiving message:', error);
    }
  };

  const handleDelete = async (message: Message) => {
    if (!confirm('¿Eliminar este mensaje permanentemente?')) return;

    try {
      await messagesAPI.deleteMessage(message.id);
      loadMessages();
      if (selectedMessage?.id === message.id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      handleMarkAsRead(message);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return msg.status !== 'archived';
    return msg.status === filter;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Mensajes de Contacto</h1>
        <p className="text-foreground/60">
          Gestiona los mensajes recibidos desde el formulario de contacto
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lista de mensajes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Filtros */}
            <div className="border-b border-foreground/10 p-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-foreground/5 hover:bg-foreground/10'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                    filter === 'unread'
                      ? 'bg-primary text-white'
                      : 'bg-foreground/5 hover:bg-foreground/10'
                  }`}
                >
                  No leídos
                  {unreadCount > 0 && (
                    <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setFilter('archived')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filter === 'archived'
                      ? 'bg-primary text-white'
                      : 'bg-foreground/5 hover:bg-foreground/10'
                  }`}
                >
                  Archivados
                </button>
              </div>
            </div>

            {/* Lista */}
            <div className="divide-y divide-foreground/10 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-foreground/60">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No hay mensajes</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <motion.button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`w-full p-4 text-left hover:bg-foreground/5 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-primary/5' : ''
                    } ${message.status === 'unread' ? 'border-l-4 border-primary' : ''}`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {message.status === 'unread' ? (
                          <Mail className="w-4 h-4 text-primary" />
                        ) : (
                          <MailOpen className="w-4 h-4 text-foreground/40" />
                        )}
                        <span className={`text-sm ${message.status === 'unread' ? 'font-medium' : ''}`}>
                          {message.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-foreground/60">
                        <Clock className="w-3 h-3" />
                        {new Date(message.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                    </div>
                    <p className={`text-sm mb-1 ${message.status === 'unread' ? 'font-medium' : 'text-foreground/60'}`}>
                      {message.subject}
                    </p>
                    <p className="text-xs text-foreground/60 line-clamp-2">
                      {message.message}
                    </p>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detalle del mensaje */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header */}
              <div className="border-b border-foreground/10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl">{selectedMessage.subject}</h2>
                  <div className="flex gap-2">
                    {selectedMessage.status !== 'archived' && (
                      <motion.button
                        onClick={() => handleArchive(selectedMessage)}
                        className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Archivar"
                      >
                        <Archive className="w-5 h-5" />
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => handleDelete(selectedMessage)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Info del remitente */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-foreground/80">
                    <User className="w-4 h-4" />
                    <span>{selectedMessage.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/80">
                    <AtSign className="w-4 h-4" />
                    <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2 text-foreground/80">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${selectedMessage.phone}`} className="text-primary hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-foreground/60 text-xs">
                    <Clock className="w-4 h-4" />
                    {new Date(selectedMessage.createdAt).toLocaleString('es-ES', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>

              {/* Mensaje */}
              <div className="p-6">
                <div className="bg-foreground/5 rounded-lg p-6 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="border-t border-foreground/10 p-6 bg-foreground/5">
                <div className="flex gap-3">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Responder por Email
                  </a>
                  {selectedMessage.phone && (
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Llamar
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md h-full flex items-center justify-center p-12">
              <div className="text-center text-foreground/40">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p className="text-lg">Selecciona un mensaje para ver los detalles</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
