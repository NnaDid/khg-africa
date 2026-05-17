import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export function useRealtime(table: string, callback?: (payload: any) => void) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      const { data: initialData } = await supabase.from(table).select('*');
      if (initialData) setData(initialData);
    };
    fetchData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          console.log('Realtime change received:', payload);
          if (callback) callback(payload);
          
          // Optimistic update local state
          setData((current) => {
            if (payload.eventType === 'INSERT') return [...current, payload.new];
            if (payload.eventType === 'UPDATE') {
               return current.map(item => item.id === payload.new.id ? payload.new : item);
            }
            if (payload.eventType === 'DELETE') {
               return current.filter(item => item.id === payload.old.id);
            }
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);

  return data;
}
