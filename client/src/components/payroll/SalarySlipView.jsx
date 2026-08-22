import React from 'react';
import { Button } from '../common/Button';
import { Printer, Download, Building2, CheckCircle2, Shield } from 'lucide-react';

export function SalarySlipView({ payslip, onClose }) {
  if (!payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[payslip.month - 1] || payslip.month;

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Action Bar (hidden during printing) */}
      <div className="no-print flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Salary Slip Preview (INR ₹)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Official compensation voucher for {monthName} {payslip.year}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            Print / Save PDF
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Printable Payslip Document Container */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 print-shadow-none print:border-none print:p-0 print:text-black">
        {/* Company Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-slate-700 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-2xl print:border print:border-emerald-600">
              D
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dayflow Technologies Pvt. Ltd.</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tower B, Global Tech Park, Electronic City Phase 1 • Bengaluru, Karnataka 560100</p>
              <p className="text-[11px] text-slate-400">CIN: U72200KA2021PTC148920 • GSTIN: 29AABCD1234E1Z5 • payroll@dayflow.com</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block bg-slate-900 dark:bg-emerald-700 text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider">
              Pay Slip
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 font-mono">{payslip.payslip_number}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pay Period: <strong>{monthName} {payslip.year}</strong></p>
          </div>
        </div>

        {/* Employee Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium">Employee Name</span>
            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{payslip.first_name} {payslip.last_name}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium">Employee ID</span>
            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 font-mono">{payslip.employee_id}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium">Department</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{payslip.department}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium">Designation</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{payslip.designation}</p>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium">Payment Status</span>
            <p className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" /> {payslip.payment_status || 'Paid'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium">Disbursal Date</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{payslip.payment_date || 'End of Month'}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium">Bank & Transfer Mode</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{payslip.bank_name || 'HDFC Bank'} (NEFT/IMPS)</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium">Bank Account</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">{payslip.account_number || '**** **** 4892'}</p>
          </div>
        </div>

        {/* Earnings & Deductions Tables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
          {/* Earnings */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 flex justify-between">
              <span>Earnings</span>
              <span>Amount (INR ₹)</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 px-4 py-2 space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">₹{payslip.basic_pay?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400">House Rent Allowance (HRA)</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">₹{payslip.hra?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400">Special & Conveyance Allowances</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">₹{payslip.allowances?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Gross Earnings</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-mono">₹{payslip.gross_pay?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 flex justify-between">
              <span>Deductions</span>
              <span>Amount (INR ₹)</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 px-4 py-2 space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400">Provident Fund (EPF @ 12%)</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">-₹{payslip.pf_deduction?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400">Professional Tax (PT)</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">-₹{(payslip.other_deductions || 200).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400">Income Tax (TDS)</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">-₹{payslip.tax_deduction?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400">Group Health Insurance</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">-₹{payslip.insurance_deduction?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Total Deductions</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono">-₹{payslip.total_deductions?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight Box */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/30 dark:border-emerald-700/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 my-6">
          <div>
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">Total Net Payable (Take-Home)</span>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Credited directly to employee bank account via NEFT / IMPS transfer</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-emerald-800 dark:text-emerald-300 font-mono">
              ₹{payslip.net_pay?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Footer & Signatory */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-400">
          <div>
            <p className="font-medium text-slate-600 dark:text-slate-400">Note: This is a system-generated compensation voucher and requires no physical seal.</p>
            <p className="text-[10px] mt-1">Generated by Dayflow HRMS (India) • {new Date().toLocaleDateString('en-IN')}</p>
          </div>

          <div className="text-center sm:text-right">
            <div className="font-serif italic font-bold text-slate-800 dark:text-slate-200 text-base mb-1">
              Priya Sharma
            </div>
            <div className="w-48 border-t border-slate-400 ml-auto pt-1">
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Authorized Signatory</p>
              <p className="text-[10px] text-slate-400">Director of People & Culture • Dayflow India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
