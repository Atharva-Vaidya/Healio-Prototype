import { supabase } from '../lib/supabaseClient';

export const activityService = {
  getCompanyActivityFeed: async () => {
    // For a real app, this should only fetch activity for a specific company_id
    // But for this platform demo, we'll fetch global recent activity across all tables
    
    try {
      const [ { data: txs }, { data: claims }, { data: invoices } ] = await Promise.all([
        supabase.from('wallet_transactions').select('*, users!user_id(name)').order('created_at', { ascending: false }).limit(10),
        supabase.from('claims').select('*, users!user_id(name)').order('created_at', { ascending: false }).limit(10),
        supabase.from('clinic_invoices').select('*, users!patient_id(name), clinic_users:clinic_id(name)').order('created_at', { ascending: false }).limit(10)
      ]);
      
      let feed = [];
      
      if (txs) {
        feed = feed.concat(txs.map(tx => ({
          id: `tx-${tx.id}`,
          date: tx.created_at,
          user: tx.users?.name || 'Unknown User',
          action: tx.type === 'credit' ? 'Wallet Top-up' : 'Wallet Deduction',
          details: `${tx.provider} - ₹${tx.amount}`,
          type: 'transaction'
        })));
      }
      
      if (claims) {
        feed = feed.concat(claims.map(claim => ({
          id: `claim-${claim.id}`,
          date: claim.created_at,
          user: claim.users?.name || 'Unknown User',
          action: `Claim ${claim.status}`,
          details: `${claim.treatment || 'Treatment'} at ${claim.hospital} - ₹${claim.amount}`,
          type: 'claim'
        })));
      }
      
      if (invoices) {
        feed = feed.concat(invoices.map(inv => ({
          id: `inv-${inv.id}`,
          date: inv.created_at,
          user: inv.users?.name || 'Unknown User',
          action: 'Clinic Invoice Generated',
          details: `Billed by ${inv.clinic_users?.name || 'Clinic'} for ${inv.treatment} - ₹${inv.amount}`,
          type: 'invoice'
        })));
      }
      
      // Sort descending by date
      feed.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return feed.slice(0, 15); // Return top 15 most recent activities
      
    } catch (err) {
      console.error('Failed to get activity feed', err);
      return [];
    }
  }
};
