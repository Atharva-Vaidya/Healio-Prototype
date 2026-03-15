import { supabase } from '../lib/supabaseClient';

export const adminService = {
  getAdminDashboardData: async () => {
    try {
      // Parallelize count queries for speed
      const [
        { count: userCount },
        { count: clinicCount },
        { count: claimCount },
        { count: txCount },
        { data: allTxs }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('clinics').select('*', { count: 'exact', head: true }),
        supabase.from('claims').select('*', { count: 'exact', head: true }),
        supabase.from('wallet_transactions').select('*', { count: 'exact', head: true }),
        supabase.from('wallet_transactions').select('amount').eq('type', 'debit')
      ]);

      const totalHealthcareSpending = (allTxs || []).reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      // Get sample tables for display
      const [
        { data: topUsers },
        { data: allClinics },
        { data: recentClaims },
        { data: recentTxs }
      ] = await Promise.all([
        supabase.from('users').select('id, name, email, role, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('clinics').select('*').limit(5),
        supabase.from('claims').select('id, hospital, amount, status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('wallet_transactions').select('id, provider, amount, type, created_at').order('created_at', { ascending: false }).limit(5)
      ]);

      return {
        totalUsers: userCount || 0,
        totalClinics: clinicCount || 0,
        totalClaims: claimCount || 0,
        totalTransactions: txCount || 0,
        totalHealthcareSpending,
        
        users: topUsers || [],
        clinics: allClinics || [],
        claims: recentClaims || [],
        transactions: recentTxs || []
      };

    } catch (err) {
      console.error('Failed to load admin data:', err);
      throw err;
    }
  }
};
