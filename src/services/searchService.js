import { supabase } from '../lib/supabaseClient';

export const searchService = {
  globalSearch: async (queryStr) => {
    if (!queryStr || queryStr.length < 2) return [];

    try {
      // Parallelize searches across multiple core tables
      const [
        { data: clinics },
        { data: txs },
        { data: claims }
      ] = await Promise.all([
        supabase.from('clinics').select('id, name, location').ilike('name', `%${queryStr}%`).limit(3),
        supabase.from('wallet_transactions').select('id, provider, description, amount').or(`provider.ilike.%${queryStr}%,description.ilike.%${queryStr}%`).limit(3),
        supabase.from('claims').select('id, hospital, treatment, status').or(`hospital.ilike.%${queryStr}%,treatment.ilike.%${queryStr}%`).limit(3)
      ]);

      let results = [];
      
      if (clinics && clinics.length > 0) {
        results.push({ 
          category: 'Verified Clinics', 
          items: clinics.map(c => ({ id: c.id, title: c.name, subtitle: c.location, type: 'clinic' })) 
        });
      }
      
      if (txs && txs.length > 0) {
        results.push({ 
          category: 'Wallet Transactions', 
          items: txs.map(t => ({ id: t.id, title: t.provider, subtitle: `${t.description || 'Health Service'} - ₹${t.amount}`, type: 'transaction' })) 
        });
      }
      
      if (claims && claims.length > 0) {
        results.push({ 
          category: 'Insurance Claims', 
          items: claims.map(c => ({ id: c.id, title: c.hospital, subtitle: `${c.treatment} (${c.status.toUpperCase()})`, type: 'claim' })) 
        });
      }

      return results;
    } catch (err) {
      console.error('Smart Search error:', err);
      return [];
    }
  }
};
