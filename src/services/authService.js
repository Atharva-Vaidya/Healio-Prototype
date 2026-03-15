import { supabase } from '../lib/supabaseClient';

export const authService = {
  getCurrentUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    return data;
  }
};
