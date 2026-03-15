import { supabase } from '../lib/supabaseClient';

export const accountService = {
  convertToIndividualPlan: async (userId) => {
    // 1. set account_type → individual
    // 2. set company_id → null
    const { error: updateError } = await supabase
      .from('users')
      .update({
        account_type: 'individual',
        company_id: null,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating account type:', updateError);
      throw updateError;
    }

    // 3. create a row in subscriptions table
    const { data: subscription, error: insertError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_type: 'basic',
          status: 'active',
          monthly_price: 999, // Base price for individual plan
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating subscription:', insertError);
      throw insertError;
    }

    return subscription;
  },
};
