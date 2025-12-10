import { AlertCircle, Lock, User } from 'lucide-react';

interface Lock {
  resourceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  lockedAt: string;
  lastHeartbeat: string;
}

interface EditLockBannerProps {
  lock: Lock;
  onTakeControl: () => void;
  isTakingControl?: boolean;
}

export function EditLockBanner({ lock, onTakeControl, isTakingControl }: EditLockBannerProps) {
  const lockedTime = new Date(lock.lockedAt);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - lockedTime.getTime()) / 60000);
  
  const timeString = minutesAgo < 1 
    ? 'hace un momento' 
    : minutesAgo === 1 
    ? 'hace 1 minuto' 
    : `hace ${minutesAgo} minutos`;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Esta página está siendo editada por otro usuario
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4" />
              <span>
                <strong>{lock.userName}</strong> ({lock.userEmail})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Bloqueado {timeString}</span>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={onTakeControl}
              disabled={isTakingControl}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTakingControl ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Tomando control...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Tomar control de la edición
                </>
              )}
            </button>
            <p className="mt-2 text-xs text-yellow-600">
              Al tomar control, el otro usuario perderá acceso de edición y sus cambios no guardados se perderán.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
