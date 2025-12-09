// Helper function to retry operations when Supabase is temporarily unavailable
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a temporary Cloudflare/Supabase error
      const errorMessage = error?.message || String(error);
      const isTemporaryError = 
        errorMessage.includes('<!DOCTYPE') ||
        errorMessage.includes('Cloudflare') ||
        errorMessage.includes('Temporarily unavailable') ||
        errorMessage.includes('1105');
      
      if (isTemporaryError && attempt < maxRetries - 1) {
        console.log(`Attempt ${attempt + 1} failed (temporary error), retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      
      // If it's not a temporary error or we've exhausted retries, throw
      throw error;
    }
  }
  
  throw lastError;
}

// Wrapper for kv operations with retry logic
export function withRetry<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: any[]) => {
    return retryOperation(() => fn(...args));
  }) as T;
}
