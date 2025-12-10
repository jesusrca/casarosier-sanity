import { useState, useEffect, useCallback, useRef } from 'react';
import { locksAPI } from '../utils/api';

interface Lock {
  resourceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  lockedAt: string;
  lastHeartbeat: string;
}

interface UseLockReturn {
  isLocked: boolean;
  lockOwner: Lock | null;
  hasLock: boolean;
  isLoading: boolean;
  error: string | null;
  acquireLock: () => Promise<boolean>;
  releaseLock: () => Promise<void>;
  takeoverLock: () => Promise<boolean>;
}

export function usePageLock(resourceId: string): UseLockReturn {
  const [isLocked, setIsLocked] = useState(false);
  const [lockOwner, setLockOwner] = useState<Lock | null>(null);
  const [hasLock, setHasLock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Check lock status
  const checkLockStatus = useCallback(async () => {
    // Don't check if resourceId is empty
    if (!resourceId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await locksAPI.checkLock(resourceId);
      
      if (!isMountedRef.current) return;

      if (response.locked) {
        setIsLocked(true);
        setLockOwner(response.lock);
        // Check if we own this lock (compare userId would be better but we don't have it client-side easily)
        setHasLock(false); // Will be set to true if we successfully acquire
      } else {
        setIsLocked(false);
        setLockOwner(null);
        setHasLock(false);
      }
    } catch (err: any) {
      console.error('Error checking lock:', err);
      if (isMountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [resourceId]);

  // Acquire lock
  const acquireLock = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const response = await locksAPI.acquireLock(resourceId);
      
      if (!isMountedRef.current) return false;

      if (response.success) {
        setIsLocked(true);
        setLockOwner(response.lock);
        setHasLock(true);
        
        // Start heartbeat
        startHeartbeat();
        
        return true;
      } else {
        // Lock is held by another user
        setIsLocked(true);
        setLockOwner(response.lock);
        setHasLock(false);
        return false;
      }
    } catch (err: any) {
      console.error('Error acquiring lock:', err);
      setError(err.message);
      
      // If 409 Conflict, another user has the lock
      if (err.message.includes('409') || err.message.includes('locked')) {
        await checkLockStatus();
      }
      
      return false;
    }
  }, [resourceId]);

  // Release lock
  const releaseLock = useCallback(async () => {
    try {
      await locksAPI.releaseLock(resourceId);
      
      if (!isMountedRef.current) return;

      setIsLocked(false);
      setLockOwner(null);
      setHasLock(false);
      
      // Stop heartbeat
      stopHeartbeat();
    } catch (err: any) {
      console.error('Error releasing lock:', err);
      // Even if release fails, clean up local state
      setIsLocked(false);
      setLockOwner(null);
      setHasLock(false);
      stopHeartbeat();
    }
  }, [resourceId]);

  // Takeover lock
  const takeoverLock = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const response = await locksAPI.takeoverLock(resourceId);
      
      if (!isMountedRef.current) return false;

      if (response.success) {
        setIsLocked(true);
        setLockOwner(response.lock);
        setHasLock(true);
        
        // Start heartbeat
        startHeartbeat();
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('Error taking over lock:', err);
      setError(err.message);
      return false;
    }
  }, [resourceId]);

  // Start heartbeat to keep lock alive
  const startHeartbeat = useCallback(() => {
    stopHeartbeat(); // Clear any existing interval
    
    heartbeatIntervalRef.current = setInterval(async () => {
      try {
        await locksAPI.sendHeartbeat(resourceId);
      } catch (err) {
        console.error('Heartbeat failed:', err);
        // Lock might have been lost
        if (isMountedRef.current) {
          await checkLockStatus();
        }
      }
    }, 30000); // Send heartbeat every 30 seconds
  }, [resourceId, checkLockStatus]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Initial check on mount
  useEffect(() => {
    isMountedRef.current = true;
    checkLockStatus();

    return () => {
      isMountedRef.current = false;
    };
  }, [checkLockStatus]);

  // Cleanup on unmount - release lock if we have it
  useEffect(() => {
    return () => {
      stopHeartbeat();
      
      // Release lock when component unmounts (if we own it)
      if (hasLock) {
        locksAPI.releaseLock(resourceId).catch(err => {
          console.error('Failed to release lock on unmount:', err);
        });
      }
    };
  }, [hasLock, resourceId, stopHeartbeat]);

  return {
    isLocked,
    lockOwner,
    hasLock,
    isLoading,
    error,
    acquireLock,
    releaseLock,
    takeoverLock,
  };
}