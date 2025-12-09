import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface NavigationBlockerProps {
  when: boolean;
  onSave?: () => void | Promise<void>;
  onDiscard?: () => void;
}

export function NavigationBlocker({ when, onSave, onDiscard }: NavigationBlockerProps) {
  const [showDialog, setShowDialog] = useState(false);

  // Handle browser navigation (refresh, close tab, etc.)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (when) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [when]);

  return null;
}
