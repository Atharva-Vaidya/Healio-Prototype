import { supabase } from '../lib/supabaseClient';

export const claimsService = {
  submitClaim: async (userId, hospital, treatment, amount) => {
    const { data, error } = await supabase
      .from('claims')
      .insert([
        {
          user_id: userId,
          hospital,
          treatment,
          amount,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error submitting claim:', error);
      throw error;
    }
    return data;
  },

  getUserClaims: async (userId) => {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching claims:', error);
      throw error;
    }
    return data;
  }
};
