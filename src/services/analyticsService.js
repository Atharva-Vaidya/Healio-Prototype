import { supabase } from '../lib/supabaseClient';

export const analyticsService = {
  getHREmployeeAnalytics: async () => {
    // Analytics: Total Employees, Total Health Budget, Total Wallet Spending, Pending Claims
    // Fetch all employees in the company (assuming company_id exists or all employees for now)
    
    // 1. Employees
    const { data: employees, error: empError } = await supabase
      .from('users')
      .select('id, name, email, wallet_balance')
      .eq('role', 'employee');
      
    if (empError) throw empError;
    
    // 2. Pending Claims
    const { count: pendingClaims, error: claimsError } = await supabase
      .from('claims')
      .select('id', { count: 'exact' })
      .eq('status', 'pending');
      
    if (claimsError) throw claimsError;
    
    // 3. Wallet Transactions (Debits)
    const { data: transactions, error: txError } = await supabase
      .from('wallet_transactions')
      .select('amount, user_id, type')
      .eq('type', 'debit');

    if (txError) throw txError;
    
    const totalEmployees = employees ? employees.length : 0;
    
    // Estimate total health budget (e.g. initial budget per employee is 20,000)
    // Here we can sum up their current wallet balance + total spent
    let totalSpending = 0;
    if (transactions) {
      totalSpending = transactions.reduce((acc, tx) => acc + Number(tx.amount), 0);
    }
    
    let currentBalanceSum = 0;
    if (employees) {
      currentBalanceSum = employees.reduce((acc, emp) => acc + Number(emp.wallet_balance), 0);
    }
    
    const totalHealthBudget = currentBalanceSum + totalSpending;

    // For employee table rows: 
    // We need: Employee Name, Wallet Balance, Claims Submitted, Last Transaction
    
    // Enhance employee data with claims count and last tx
    const { data: allClaims } = await supabase.from('claims').select('user_id');
    const enrichedEmployees = employees.map(emp => {
      const empClaims = allClaims?.filter(c => c.user_id === emp.id).length || 0;
      const empTxs = transactions?.filter(t => t.user_id === emp.id) || [];
      const lastTx = empTxs.length > 0 ? empTxs[0] : null; // simplified assumption
      return {
        ...emp,
        claims_submitted: empClaims,
        last_transaction: lastTx ? 'Recent' : 'N/A'
      };
    });

    return {
      totalEmployees,
      totalHealthBudget,
      totalSpending,
      pendingClaims: pendingClaims || 0,
      employees: enrichedEmployees
    };
  },

  getEmployeeInsights: async (userId) => {
    // Fetch employee's specific transactions and claims
    const [ { data: txs }, { data: claims } ] = await Promise.all([
      supabase.from('wallet_transactions').select('*').eq('user_id', userId),
      supabase.from('claims').select('*').eq('user_id', userId)
    ]);

    const allTxs = txs || [];
    const allClaims = claims || [];

    // 1. Total medical spend this year
    const currentYear = new Date().getFullYear();
    const yearlySpend = allTxs
      .filter(tx => tx.type === 'debit' && new Date(tx.created_at).getFullYear() === currentYear)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    // 2. Most visited provider
    const providerCounts = {};
    allTxs.forEach(tx => {
      providerCounts[tx.provider] = (providerCounts[tx.provider] || 0) + 1;
    });
    let mostVisitedProvider = 'None yet';
    let maxVisits = 0;
    for (const [provider, count] of Object.entries(providerCounts)) {
      if (count > maxVisits) {
        maxVisits = count;
        mostVisitedProvider = provider;
      }
    }

    // 3. Diagnostics tests count (approximate based on description matching)
    const diagnosticWords = ['lab', 'test', 'blood', 'x-ray', 'scan', 'mri', 'diagnostic'];
    const diagnosticsCount = allTxs.filter(tx => {
      const desc = (tx.description || '').toLowerCase();
      const prov = (tx.provider || '').toLowerCase();
      return diagnosticWords.some(word => desc.includes(word) || prov.includes(word));
    }).length;

    // 4. Number of consultations
    const consultationsCount = allTxs.length - diagnosticsCount;

    // 5. Preventive Health Indicator
    // If no diagnostics in last 6 months -> suggest checkup
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentDiagnostics = allTxs.filter(tx => {
      const txDate = new Date(tx.created_at);
      const desc = (tx.description || '').toLowerCase();
      return txDate >= sixMonthsAgo && diagnosticWords.some(word => desc.includes(word));
    }).length;

    let preventiveRecommendation = null;
    if (recentDiagnostics === 0) {
      preventiveRecommendation = "Recommended: Annual Health Checkup (No diagnostic tests detected in the last 6 months).";
    }

    return {
      yearlySpend,
      mostVisitedProvider,
      diagnosticsCount,
      consultationsCount,
      preventiveRecommendation
    };
  },

  getHRAnalyticsCharts: async () => {
    // Generate aggregated dataset for HR dashboard charts
    const { data: txs } = await supabase.from('wallet_transactions').select('*').eq('type', 'debit');
    const allTxs = txs || [];

    // 1. Monthly healthcare spending
    const monthlySpendingMap = {};
    // Setup last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      monthlySpendingMap[monthStr] = 0;
    }

    allTxs.forEach(tx => {
      const date = new Date(tx.created_at);
      const monthStr = date.toLocaleString('default', { month: 'short' });
      if (monthlySpendingMap[monthStr] !== undefined) {
        monthlySpendingMap[monthStr] += Number(tx.amount);
      }
    });

    const monthlySpending = Object.keys(monthlySpendingMap).map(month => ({
      month,
      spend: monthlySpendingMap[month]
    }));

    // 2. Top medical categories (heuristics)
    let labSpend = 0;
    let pharmacySpend = 0;
    let consultationSpend = 0;
    let hospitalSpend = 0;

    allTxs.forEach(tx => {
      const desc = (tx.description || '').toLowerCase();
      const prov = (tx.provider || '').toLowerCase();
      const amount = Number(tx.amount);

      if (desc.includes('lab') || desc.includes('test') || prov.includes('path')) {
        labSpend += amount;
      } else if (desc.includes('medicine') || prov.includes('pharmacy')) {
        pharmacySpend += amount;
      } else if (desc.includes('surgery') || prov.includes('hospital')) {
        hospitalSpend += amount;
      } else {
        consultationSpend += amount;
      }
    });

    const categorySpending = [
      { category: 'Consultations', value: consultationSpend },
      { category: 'Diagnostics & Labs', value: labSpend },
      { category: 'Pharmacy', value: pharmacySpend },
      { category: 'Hospitalization', value: hospitalSpend },
    ].filter(item => item.value > 0);

    return {
      monthlySpending,
      categorySpending
    };
  }
};
