import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { CurrencyCode } from '../../types/crm';
import { 
  Building2, 
  Settings, 
  FileSpreadsheet, 
  Percent, 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  Check, 
  Save, 
  RefreshCw, 
  Download, 
  Wallet, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export const AccountantSettingsView: React.FC = () => {
  const { 
    currentUser, 
    updateUser, 
    currency, 
    setCurrency, 
    themeMode, 
    addNotification 
  } = useCrm();

  const isLight = themeMode === 'light';

  // Accounting Preferences State
  const [accountingBasis, setAccountingBasis] = useState<'cash' | 'accrual'>('cash');
  const [fiscalYearStart, setFiscalYearStart] = useState('January');
  const [vatRate, setVatRate] = useState<number>(7.5);
  const [whtRate, setWhtRate] = useState<number>(5.0);
  const [tinNumber, setTinNumber] = useState('24981023-0001');

  // Audit Thresholds
  const [codThreshold, setCodThreshold] = useState<number>(350000);
  const [expenseAlertThreshold, setExpenseAlertThreshold] = useState<number>(100000);
  const [dailyDigestEmail, setDailyDigestEmail] = useState(true);
  const [remittanceAlerts, setRemittanceAlerts] = useState(true);

  // Export Preferences
  const [defaultExportFormat, setDefaultExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv');
  const [includeSignatureBlock, setIncludeSignatureBlock] = useState(true);

  // Professional Credentials
  const [accountantName, setAccountantName] = useState(currentUser?.name || 'Kemi Adeleke, FCA');
  const [accountantEmail, setAccountantEmail] = useState(currentUser?.email || 'kemi.finance@apexbrands.ng');
  const [accountantPhone, setAccountantPhone] = useState(currentUser?.phone || '+234 803 445 1199');
  const [licenseNumber, setLicenseNumber] = useState('ICAN/MBR/2018/09421');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      updateUser(currentUser.id, {
        name: accountantName,
        email: accountantEmail,
        phone: accountantPhone
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    if (addNotification) {
      addNotification({
        title: 'Accounting Settings Saved',
        message: 'Your financial preferences, tax rates, and alert thresholds have been saved.',
        type: 'success'
      });
    }
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto ${isLight ? 'text-slate-900' : 'text-white'}`}>
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-emerald-400" />
              <span>Accounting Office</span>
            </span>
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Financial Controller Configuration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Accountant Preferences & Compliance Settings
          </h1>
          <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Configure your personalized bookkeeping standards, VAT and withholding tax calculations, unreconciled COD alert thresholds, and export formats.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Section 1: Accounting Methodology & Reporting Standards */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090d16] border-slate-800'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Accounting Standards & Methodology</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Define revenue recognition principles for COD e-commerce operations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Accounting Basis */}
            <div>
              <label className="font-semibold block mb-1.5">Revenue Recognition Method</label>
              <select
                value={accountingBasis}
                onChange={(e) => setAccountingBasis(e.target.value as any)}
                className={`w-full rounded-lg px-3 py-2 border text-xs focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <option value="cash">Cash Basis (Recognize upon courier COD remittance receipt - Recommended)</option>
                <option value="accrual">Accrual Basis (Recognize upon order delivery completion)</option>
              </select>
              <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Controls whether income is tallied on physical delivery or after courier bank settlement.
              </p>
            </div>

            {/* Fiscal Year Start */}
            <div>
              <label className="font-semibold block mb-1.5">Fiscal Year Commencement</label>
              <select
                value={fiscalYearStart}
                onChange={(e) => setFiscalYearStart(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 border text-xs focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <option value="January">January 1st (Calendar & Fiscal Year aligned)</option>
                <option value="April">April 1st (Q2 Cycle)</option>
                <option value="July">July 1st (Mid-year Cycle)</option>
                <option value="October">October 1st (Q4 Cycle)</option>
              </select>
              <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Used for annual P&L cumulative statements and corporate tax preparation.
              </p>
            </div>

            {/* Default Currency */}
            <div>
              <label className="font-semibold block mb-1.5">Primary Reporting Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className={`w-full rounded-lg px-3 py-2 border text-xs focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <option value="NGN">₦ NGN - Nigerian Naira</option>
                <option value="USD">$ USD - US Dollar</option>
                <option value="GHS">GH₵ GHS - Ghanaian Cedi</option>
                <option value="KES">KSh KES - Kenyan Shilling</option>
                <option value="ZAR">R ZAR - South African Rand</option>
                <option value="GBP">£ GBP - British Pound</option>
                <option value="EUR">€ EUR - Euro</option>
              </select>
            </div>

            {/* Default Export Format */}
            <div>
              <label className="font-semibold block mb-1.5">Preferred Audit Export Format</label>
              <div className="flex items-center gap-2 pt-1">
                {(['csv', 'xlsx', 'pdf'] as const).map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setDefaultExportFormat(fmt)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition uppercase ${
                      defaultExportFormat === fmt
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : (isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white')
                    }`}
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Tax & Compliance Configurations */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090d16] border-slate-800'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-4">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Tax & Compliance Rates</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Automated rate calculation for vendor expenses and invoice breakdowns
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1.5">Value Added Tax (VAT) Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={vatRate}
                onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                className={`w-full rounded-lg px-3 py-2 border text-xs focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
              <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Default standard: 7.5% (Nigeria FIRS statutory rate)
              </p>
            </div>

            <div>
              <label className="font-semibold block mb-1.5">Withholding Tax (WHT) (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={whtRate}
                onChange={(e) => setWhtRate(parseFloat(e.target.value) || 0)}
                className={`w-full rounded-lg px-3 py-2 border text-xs focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
              <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Applicable to contractor, media buyer, and logistics contracts
              </p>
            </div>

            <div>
              <label className="font-semibold block mb-1.5">Corporate Tax ID / TIN</label>
              <input
                type="text"
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 border text-xs font-mono focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
              <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Appended to all official exported financial statements
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Reconciliation & Alert Thresholds */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090d16] border-slate-800'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Audit Alert Thresholds & Safeguards</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Set automatic warnings when courier balances or expense figures breach risk tolerance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1.5">Unremitted Courier Balance Warning Level (₦)</label>
              <input
                type="number"
                step="10000"
                value={codThreshold}
                onChange={(e) => setCodThreshold(parseInt(e.target.value, 10) || 0)}
                className={`w-full rounded-lg px-3 py-2 border text-xs font-mono focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
              <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Flag couriers in red when their undeposited cash exceeds this threshold.
              </p>
            </div>

            <div>
              <label className="font-semibold block mb-1.5">High Expense Review Level (₦)</label>
              <input
                type="number"
                step="10000"
                value={expenseAlertThreshold}
                onChange={(e) => setExpenseAlertThreshold(parseInt(e.target.value, 10) || 0)}
                className={`w-full rounded-lg px-3 py-2 border text-xs font-mono focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
              <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Any expense entry logged above this amount requires dual-verification.
              </p>
            </div>

            <div className="sm:col-span-2 space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dailyDigestEmail}
                  onChange={(e) => setDailyDigestEmail(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span className="font-medium">Send Daily Morning Cashflow & Remittance Digest</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remittanceAlerts}
                  onChange={(e) => setRemittanceAlerts(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span className="font-medium">Alert me immediately on new courier deposit slip submissions</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSignatureBlock}
                  onChange={(e) => setIncludeSignatureBlock(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span className="font-medium">Append Head Accountant certification & signature block on exported P&L PDF reports</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Professional Credentials & Sign-off Details */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090d16] border-slate-800'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-4">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Accountant Profile & Professional Sign-off</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Official reviewer details for financial audit reports and ledger signatures
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1.5">Official Name</label>
              <input
                type="text"
                value={accountantName}
                onChange={(e) => setAccountantName(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 border text-xs focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <label className="font-semibold block mb-1.5">Professional Certification License #</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 border text-xs font-mono focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <label className="font-semibold block mb-1.5">Finance Department Email</label>
              <input
                type="email"
                value={accountantEmail}
                onChange={(e) => setAccountantEmail(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 border text-xs focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <label className="font-semibold block mb-1.5">Official Telephone / WhatsApp</label>
              <input
                type="tel"
                value={accountantPhone}
                onChange={(e) => setAccountantPhone(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 border text-xs focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Accounting Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
