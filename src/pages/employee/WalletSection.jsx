import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { walletService } from '../../services/walletService';
import { aiService } from '../../services/aiService';

export default function WalletSection({ onTransactionSuccess }) {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [balance, setBalance] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  
  const MAX_ALLOCATION = 25000;

  useEffect(() => {
    if (user?.id) {
      loadBalance();
    }
  }, [user]);

  const loadBalance = async () => {
    try {
      const bal = await walletService.getWalletBalance(user.id);
      setBalance(bal);
    } catch (err) {
      console.error('Failed to load balance', err);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await processFile(file);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      await processFile(file);
    }
  };

  const processFile = async (file) => {
    setUploadMessage({ type: '', text: '' });
    setIsExtracting(true);
    setExtractedData(null);
    try {
      const data = await aiService.extractBillDetails(file);
      setExtractedData(data);
    } catch (err) {
      setUploadMessage({ type: 'error', text: 'Error extracting bill details.' });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile || !extractedData) {
      setUploadMessage({ type: 'error', text: 'Please select a file and wait for extraction.' });
      return;
    }

    if (extractedData.amount > balance) {
      setUploadMessage({ type: 'error', text: 'Insufficient wallet balance for this bill.' });
      return;
    }

    setIsUploading(true);
    setUploadMessage({ type: '', text: '' });

    try {
      await walletService.submitWalletTransaction(
        user.id,
        extractedData.amount,
        extractedData.provider,
        extractedData.description,
        selectedFile
      );

      setUploadMessage({ type: 'success', text: 'Bill uploaded successfully!' });
      setSelectedFile(null);
      setExtractedData(null);
      await loadBalance();
      
      if (onTransactionSuccess) {
        onTransactionSuccess();
      }
    } catch (err) {
      setUploadMessage({ type: 'error', text: err.message || 'Failed to upload bill.' });
    } finally {
      setIsUploading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const displayBalance = balance !== null ? balance : 18450; // Fallback to dummy
  const percentRemaining = ((displayBalance / MAX_ALLOCATION) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">Health Wallet</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage your health wallet balance and medical bills</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
          Active
        </span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

            <p className="text-teal-100 text-xs font-medium uppercase tracking-wider mb-1">Available Balance</p>
            <p className="text-3xl font-bold mb-1">{balance !== null ? formatCurrency(balance) : 'Loading...'}</p>
            <p className="text-teal-200 text-sm mb-6">of {formatCurrency(MAX_ALLOCATION)} allocated</p>

            {/* Progress bar */}
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${percentRemaining}%` }}></div>
            </div>
            <p className="text-teal-100 text-[11px]">{percentRemaining}% remaining this quarter</p>

            <div className="flex gap-3 mt-5">
              <button className="flex-1 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-sm font-semibold transition-all cursor-pointer text-center">
                View Transactions
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Upload Medical Bill</p>
              {uploadMessage.text && (
                <p className={`text-xs font-medium ${uploadMessage.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {uploadMessage.text}
                </p>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png" 
            />
            
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
                isDragging
                  ? 'border-teal-400 bg-teal-50/50'
                  : selectedFile 
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-gray-200 bg-gray-50/50 hover:border-teal-300 hover:bg-teal-50/30'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${selectedFile ? 'bg-emerald-100' : 'bg-teal-50'}`}>
                {selectedFile ? (
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {isDragging ? 'Drop your file here' : selectedFile ? selectedFile.name : 'Drag & drop your bill'}
              </p>
              <p className="text-xs text-gray-400 mb-3">
                {selectedFile ? 'File ready to upload' : 'or click to browse files'}
              </p>
              {!selectedFile && <p className="text-[11px] text-gray-300">Supports PDF, JPG, PNG (max 10MB)</p>}
            </div>

            {isExtracting ? (
              <div className="mt-4 p-5 bg-teal-50 border border-teal-100 rounded-xl text-center animate-pulse">
                <svg className="animate-spin w-6 h-6 text-teal-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm font-bold text-teal-800">AI Extracting Bill Details...</p>
                <p className="text-xs text-teal-600 mt-1">Analyzing provider, treatment, and amount</p>
              </div>
            ) : extractedData ? (
              <form onSubmit={handleUpload} className="mt-4 p-5 bg-white border border-gray-200 shadow-sm rounded-xl space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Data Extracted
                  </h3>
                  <button type="button" onClick={() => { setSelectedFile(null); setExtractedData(null); }} className="text-xs text-gray-500 hover:text-red-500 font-semibold cursor-pointer">
                    Discard
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Provider</label>
                    <input type="text" value={extractedData.provider} onChange={e => setExtractedData({...extractedData, provider: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Treatment / Service</label>
                    <input type="text" value={extractedData.description} onChange={e => setExtractedData({...extractedData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Amount (₹)</label>
                      <input type="number" value={extractedData.amount} onChange={e => setExtractedData({...extractedData, amount: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none font-bold text-emerald-700" required />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                      <input type="date" value={extractedData.date} onChange={e => setExtractedData({...extractedData, date: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none" required />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 italic">Please verify the extracted information before submitting. AI confidence: {extractedData.confidence}%</p>

                <button 
                  type="submit"
                  disabled={isUploading}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 ${
                    isUploading 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 shadow-teal-500/15 hover:shadow-lg cursor-pointer'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading & Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Confirm Details & Submit Claim
                    </>
                  )}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
