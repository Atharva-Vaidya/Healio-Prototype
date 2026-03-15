import { supabase } from '../lib/supabaseClient';

export const notificationService = {
  createNotification: async (userId, title, message, type = 'info') => {
    try {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title,
          message,
          type
        }]);
        
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to create notification', err);
      return null;
    }
  },

  getUserNotifications: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to get notifications', err);
      return [];
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to mark notification rad', err);
      return false;
    }
  },
  
  markAllAsRead: async (userId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
        
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to mark all as read', err);
      return false;
    }
  }
};
