import { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import SummaryCards from './SummaryCards';
import WalletSection from './WalletSection';
import ClinicsSection from './ClinicsSection';
import TransactionsTable from './TransactionsTable';
import ClaimsTable from './ClaimsTable';
import HealthInsights from './HealthInsights';
import HealthReportExport from '../../components/HealthReportExport';
import PresentationTooltip from '../../components/PresentationTooltip';
import { useAuth } from '../../utils/AuthContext';
import { accountService } from '../../services/accountService';

export default function EmployeeDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [refreshWallet, setRefreshWallet] = useState(0);
  const { user } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTransition = async () => {
    if (confirm("Are you sure you want to leave your corporate plan and switch to an individual subscription?")) {
      setIsTransitioning(true);
      try {
        await accountService.convertToIndividualPlan(user.id);
        alert("Successfully transitioned to an individual plan!");
        window.location.reload();
      } catch (err) {
        alert("Failed to transition: " + err.message);
      } finally {
        setIsTransitioning(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/90 font-sans">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="lg:ml-64">
        {/* Top Navbar */}
        <DashboardNavbar
          title="Employee Dashboard"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          
          {/* Transition Banner */}
          {user?.account_type === 'corporate' && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
              <div>
                <h3 className="text-sm font-bold text-blue-900">Corporate Health Plan</h3>
                <p className="text-xs text-blue-700 mt-0.5">You are currently covered under your employer's Healio plan.</p>
              </div>
              <button 
                onClick={handleTransition}
                disabled={isTransitioning}
                className={`shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isTransitioning ? 'Processing...' : 'Resign / Transition to Individual'}
              </button>
            </div>
          )}

          {user?.account_type === 'individual' && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
              <div>
                <h3 className="text-sm font-bold text-purple-900">Individual Subscription</h3>
                <p className="text-xs text-purple-700 mt-0.5">You are managing your own basic health plan independently.</p>
              </div>
              <span className="shrink-0 px-3 py-1 bg-purple-200 text-purple-800 text-xs font-bold rounded-full uppercase tracking-widest">
                Active
              </span>
            </div>
          )}

          <div className="flex justify-end mb-4 block sm:hidden">
            <HealthReportExport />
          </div>

          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-xl font-bold text-gray-800 hidden sm:block">Dashboard Overview</h2>
            <div className="hidden sm:block">
              <HealthReportExport />
            </div>
          </div>

          {/* Summary Cards */}
          <PresentationTooltip title="Real-Time Summaries" description="Metrics pulled directly from real user transaction records and global policies, dynamically refreshing upon any state change." position="bottom" className="w-full">
            <SummaryCards refreshKey={refreshWallet} />
          </PresentationTooltip>

          {/* AI Health Insights */}
          {user?.account_type === 'corporate' && (
            <PresentationTooltip title="Health Heuristics" description="This unique intelligent card scans an employee's medical history to detect patterns and generate preventive care alerts directly on their dashboard." position="bottom" className="w-full">
              <HealthInsights />
            </PresentationTooltip>
          )}

          {/* Conditional Health Wallet vs Subscription Manager */}
          {user?.account_type === 'corporate' ? (
            <PresentationTooltip title="AI OCR Wallet Processing" description="When an employee drops a bill here, AI automatically parses the document, standardizing the provider name and amount before it enters the database." position="top" className="w-full">
              <WalletSection onTransactionSuccess={() => setRefreshWallet(prev => prev + 1)} />
            </PresentationTooltip>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-6 md:p-8 text-center">
              <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Manage Individual Subscription</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                Your corporate health wallet is no longer active. Upgrade your plan or customize your coverage to continue enjoying Healio's premium benefits.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer">
                  Upgrade Plan
                </button>
                <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl text-sm transition-all cursor-pointer">
                  Billing History
                </button>
              </div>
            </div>
          )}

          {/* Two-column layout: Claims + Clinics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <ClaimsTable />
            <ClinicsSection />
          </div>

          {/* Transactions */}
          <PresentationTooltip title="Fraud Detection System" description="Each individual transaction is scanned against Healio's verified network pool. Non-matches are automatically flagged with a risk-level tag for HR auditing." position="top" className="w-full">
            <TransactionsTable refreshKey={refreshWallet} />
          </PresentationTooltip>
        </main>
      </div>
    </div>
  );
}
