import { createClient } from '@supabase/supabase-js';

const isServer = typeof window === 'undefined';

const getCredentials = () => {
  const supabaseUrl = isServer
    ? (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "")
    : ((import.meta as any).env.VITE_SUPABASE_URL || "");

  const supabaseAnonKey = isServer
    ? (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "")
    : ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || "");
    
  return { supabaseUrl, supabaseAnonKey };
};

export const isSupabaseConfigured = (): boolean => {
  const { supabaseUrl, supabaseAnonKey } = getCredentials();
  return !!(supabaseUrl && supabaseAnonKey);
};

let clientInstance: any = null;

export const getSupabaseClient = () => {
  if (clientInstance) return clientInstance;
  
  const { supabaseUrl, supabaseAnonKey } = getCredentials();
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Silent dummy client proxy that returns empty data gracefully without throwing or log noise
    const dummyClient = {
      from: (table: string) => {
        const queryBuilder: any = {};
        const chainMethod = () => {
          return queryBuilder;
        };
        const executeMethod = async () => {
          return { data: null, error: null };
        };
        
        queryBuilder.select = chainMethod;
        queryBuilder.order = chainMethod;
        queryBuilder.eq = chainMethod;
        queryBuilder.single = executeMethod;
        queryBuilder.maybeSingle = executeMethod;
        queryBuilder.upsert = executeMethod;
        queryBuilder.update = chainMethod;
        queryBuilder.delete = chainMethod;
        
        return new Proxy(queryBuilder, {
          get: (target, prop) => {
            if (prop in target) return target[prop];
            if (prop === 'then') return undefined;
            return chainMethod;
          }
        });
      }
    };
    return dummyClient;
  }
  
  clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  return clientInstance;
};

// Export a transparent proxy as 'supabase' so that all existing code (supabase.from(...)) behaves naturally
export const supabase = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
}) as any;

