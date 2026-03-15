import { supabase } from '../lib/supabaseClient';

export const walletService = {
  getWalletBalance: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
    return data.wallet_balance;
  },

  getWalletTransactions: async (userId) => {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wallet transactions:', error);
      throw error;
    }
    return data;
  },

  submitWalletTransaction: async (userId, amount, provider, description, file) => {
    let fileUrl = null;

    // 1. Upload bill to Supabase Storage if file is provided
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `bills/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-bills')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading bill:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('medical-bills')
        .getPublicUrl(filePath);
      fileUrl = data.publicUrl;
    }

    // 2. Fetch current balance
    const currentBalance = await walletService.getWalletBalance(userId);

    if (currentBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // 3. Deduct amount from user's wallet_balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ wallet_balance: currentBalance - amount })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating wallet balance:', updateError);
      throw updateError;
    }

    // 4. Insert transaction record
    const { data: newTransaction, error: insertError } = await supabase
      .from('wallet_transactions')
      .insert([
        {
          user_id: userId,
          provider,
          description,
          amount,
          type: 'debit',
          bill_file_url: fileUrl,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting transaction:', insertError);
      // In a real app we would rollback the balance update here, or use a DB function/RPC
      throw insertError;
    }

    return newTransaction;
  },
};
