import { supabase } from '../lib/supabaseClient';

// Helper to generate random dates within the last 6 months
const getRandomDate = () => {
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const providers = [
  'Apollo Clinic Pune',
  'Ruby Hall Clinic',
  'Dr Lal PathLabs',
  'CityCare Diagnostics'
];

const treatments = [
  'General Consultation',
  'Complete Blood Count (CBC)',
  'MRI Scan',
  'Physical Therapy',
  'Dental Cleaning',
  'Cardiology Assessment',
  'X-Ray'
];

export const demoDataService = {
  generateDemoData: async () => {
    try {
      // 1. Ensure Clinics Exist
      const { data: existingClinics } = await supabase.from('clinics').select('id, name');
      let clinicList = existingClinics || [];
      
      const missingProviders = providers.filter(p => !clinicList.find(c => c.name === p));
      
      if (missingProviders.length > 0) {
        const newClinics = missingProviders.map(name => ({
          name,
          location: 'Pune, Maharashtra',
          rating: (Math.random() * (5 - 4) + 4).toFixed(1),
          verified: true
        }));
        const { data: insertedClinics } = await supabase.from('clinics').insert(newClinics).select();
        if (insertedClinics) {
          clinicList = [...clinicList, ...insertedClinics];
        }
      }

      // 2. Generate 10 Employees
      const employeesToInsert = Array.from({ length: 10 }).map((_, i) => ({
        email: `demo.employee${Math.floor(Math.random() * 10000)}@healio.com`,
        name: `Demo Employee ${i + 1}`,
        role: 'employee',
        account_type: 'corporate',
        wallet_balance: 20000,
      }));

      const { data: insertedEmployees, error: empError } = await supabase
        .from('users')
        .insert(employeesToInsert)
        .select();

      if (empError) throw empError;

      // 3. Generate Transactions, Claims, Invoices, Notifications for each employee
      const transactions = [];
      const claims = [];
      const invoices = [];
      const notifications = [];

      insertedEmployees.forEach(emp => {
        // 5 transactions per employee (50 total)
        Array.from({ length: 5 }).forEach(() => {
          const provider = providers[Math.floor(Math.random() * providers.length)];
          const amount = Math.floor(Math.random() * 3000) + 500;
          transactions.push({
            user_id: emp.id,
            amount: amount,
            type: 'debit',
            provider: provider,
            description: treatments[Math.floor(Math.random() * treatments.length)],
            created_at: getRandomDate()
          });
        });

        // 2 claims per employee (20 total)
        Array.from({ length: 2 }).forEach(() => {
          const provider = providers[Math.floor(Math.random() * providers.length)];
          claims.push({
            user_id: emp.id,
            amount: Math.floor(Math.random() * 100000) + 10000,
            status: Math.random() > 0.3 ? 'approved' : 'pending',
            hospital: provider,
            treatment: treatments[Math.floor(Math.random() * treatments.length)],
            created_at: getRandomDate()
          });
        });

        // Assign some clinic invoices
        if (clinicList.length > 0) {
          const randomClinic = clinicList[Math.floor(Math.random() * clinicList.length)];
          invoices.push({
            clinic_id: randomClinic.id,
            patient_id: emp.id,
            amount: Math.floor(Math.random() * 2000) + 500,
            treatment: 'Diagnostic Checkup',
            created_at: getRandomDate()
          });
        }

        // Add intro notifications
        notifications.push({
          user_id: emp.id,
          title: 'Welcome to Healio!',
          message: 'Your corporate health wallet has been funded with ₹20,000.',
          type: 'info',
          is_read: false,
          created_at: new Date().toISOString()
        });
      });

      // Execute bulk inserts
      await Promise.all([
        supabase.from('wallet_transactions').insert(transactions),
        supabase.from('claims').insert(claims),
        supabase.from('clinic_invoices').insert(invoices),
        supabase.from('notifications').insert(notifications)
      ]);

      return true;
    } catch (err) {
      console.error('Demo data generation failed:', err);
      throw err;
    }
  }
};
