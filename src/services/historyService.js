import { supabase } from '../lib/supabaseClient';

export const historyService = {
  getMedicalHistory: async (userId) => {
    // Fetch from wallet_transactions, claims, and clinic_invoices
    // And combine them chronologically
    
    const { data: transactions, error: txError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId);
      
    if (txError) throw txError;
    
    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .select('*')
      .eq('user_id', userId);
      
    if (claimsError) throw claimsError;
    
    const { data: invoices, error: invError } = await supabase
      .from('clinic_invoices')
      .select('*')
      .eq('patient_id', userId);
      
    if (invError) throw invError;
    
    // Normalize properties for a unified timeline
    let timeline = [];
    
    if (transactions) {
      timeline = timeline.concat(transactions.map(tx => ({
        id: `tx-${tx.id}`,
        date: tx.created_at,
        provider: tx.provider,
        service: tx.description || 'Wallet Transaction',
        amount: tx.amount,
        type: 'transaction',
        status: 'Completed'
      })));
    }
    
    if (claims) {
      timeline = timeline.concat(claims.map(claim => ({
        id: `claim-${claim.id}`,
        date: claim.created_at,
        provider: claim.hospital,
        service: claim.treatment || 'Claim',
        amount: claim.amount,
        type: 'claim',
        status: claim.status
      })));
    }
    
    if (invoices) {
      timeline = timeline.concat(invoices.map(inv => ({
        id: `inv-${inv.id}`,
        date: inv.created_at,
        provider: 'Clinic', // We could join to get clinic name
        service: inv.treatment || 'Consultation',
        amount: inv.amount,
        type: 'invoice',
        status: 'Billed'
      })));
    }
    
    // Sort descending by date
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return timeline;
  }
};
