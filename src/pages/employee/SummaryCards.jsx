import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { walletService } from '../../services/walletService';

export default function SummaryCards({ refreshKey = 0 }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadBalance();
    }
  }, [user, refreshKey]);

  const loadBalance = async () => {
    try {
      const bal = await walletService.getWalletBalance(user.id);
      setBalance(bal);
    } catch (err) {
      console.error('Failed to load balance', err);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const cards = [
    {
      label: 'Health Wallet Balance',
      value: balance !== null ? formatCurrency(balance) : 'Loading...',
      sub: 'Available',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110 6h3.75A2.25 2.25 0 0021 13.5V12zM3 6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v.874c-.58-.302-1.24-.474-1.938-.474H15a4.5 4.5 0 000 9h4.062c.698 0 1.358-.172 1.938-.474v.874A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25V6.75z" />
        </svg>
      ),
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      trend: '+₹3,200 this month',
      trendUp: true,
    },
    {
      label: 'Insurance Coverage',
      value: '₹5,00,000',
      sub: 'Policy',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: 'Family Floater Plan',
      trendUp: null,
    },
    {
      label: 'Pending Claims',
      value: '2',
      sub: 'claims pending',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      trend: '1 needs documents',
      trendUp: false,
    },
    {
      label: 'Verified Clinics Nearby',
      value: '24',
      sub: 'providers',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
        </svg>
      ),
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      trend: 'Within 10 km radius',
      trendUp: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <div className="flex items-start justify-between mb-1">
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
            <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center ${card.iconColor} group-hover:scale-105 transition-transform shrink-0`}>
              {card.icon}
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-0.5">{card.value}</p>
          <p className="text-sm text-gray-500">{card.sub}</p>
          <div className="mt-3 pt-3 border-t border-gray-50">
            <p className={`text-xs font-medium flex items-center gap-1 ${
              card.trendUp === true ? 'text-emerald-600' :
              card.trendUp === false ? 'text-amber-600' :
              'text-gray-400'
            }`}>
              {card.trendUp === true && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              )}
              {card.trendUp === false && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
              {card.trend}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
