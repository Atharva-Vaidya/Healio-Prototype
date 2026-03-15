import { supabase } from '../lib/supabaseClient';

export const clinicService = {
  getVerifiedClinics: async () => {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('verified', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching verified clinics:', error);
      throw error;
    }
    return data;
  },

  generateInvoice: async (clinicId, clinicName, patientEmail, treatment, description, amount) => {
    // 1. Find patient user by email
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('id, wallet_balance')
      .eq('email', patientEmail)
      .single();

    if (patientError || !patient) {
      throw new Error('Patient not found with that email.');
    }

    const patientId = patient.id;
    const currentBalance = Number(patient.wallet_balance);
    const invoiceAmount = Number(amount);

    if (currentBalance < invoiceAmount) {
      throw new Error('Patient has insufficient health wallet balance.');
    }

    // 2. Insert into wallet_transactions
    const { error: txError } = await supabase
      .from('wallet_transactions')
      .insert([{
        user_id: patientId,
        provider: clinicName,
        description: description || treatment,
        amount: invoiceAmount,
        type: 'debit',
      }]);

    if (txError) throw txError;

    // 3. Deduct amount from patient
    const { error: updateError } = await supabase
      .from('users')
      .update({ wallet_balance: currentBalance - invoiceAmount })
      .eq('id', patientId);

    if (updateError) throw updateError;

    // 4. Store treatment record in clinic_invoices
    const { error: invError } = await supabase
      .from('clinic_invoices')
      .insert([{
        clinic_id: clinicId,
        patient_id: patientId,
        treatment: treatment,
        description: description,
        amount: invoiceAmount,
      }]);

    if (invError) throw invError;

    return true;
  },

  getClinicInvoices: async (clinicId) => {
    const { data, error } = await supabase
      .from('clinic_invoices')
      .select(`
        *,
        users:patient_id (name, email)
      `)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
