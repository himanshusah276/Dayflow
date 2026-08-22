import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { SalarySlipView } from '../../components/payroll/SalarySlipView';
import {
  DollarSign,
  Receipt,
  Download,
  Eye,
  Calendar,
  Lock,
  Building,
  CheckCircle2,
  Printer
} from 'lucide-react';

export function EmployeePayslips() {
  const [payslips, setPayslips] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slipData, structData] = await Promise.all([
        api.getMyPayslips(),
        api.getMySalaryStructure(),
      ]);
      setPayslips(slipData.payslips || []);
      setSalaryStructure(structData.structure || null);
    } catch (err) {
      console.error('Failed to load payslips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenSlip = async (id) => {
    try {
      const data = await api.getPayslipById(id);
      setSelectedPayslip(data.payslip);
      setShowSlipModal(true);
    } catch (err) {
      alert(err.message || 'Failed to open payslip');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Salary & Payslips (₹ INR)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your monthly salary slips, statutory EPF/PT deductions, and official compensation vouchers
          </p>
        </div>
      </div>

      {/* Salary Overview Summary Cards */}
      {salaryStructure && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Gross CTC</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                ₹{salaryStructure.gross_salary?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 font-bold">INR / mo</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Basic: ₹{salaryStructure.basic_salary?.toLocaleString('en-IN')} • HRA: ₹{salaryStructure.hra?.toLocaleString('en-IN')}
            </p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-rose-50/40 to-white dark:from-rose-950/20 dark:to-slate-900 border-rose-100 dark:border-rose-900/40">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Monthly Deductions</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-rose-700 dark:text-rose-400 font-mono">
                -₹{salaryStructure.total_deductions?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-rose-400 font-bold">EPF, PT & TDS</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              EPF: ₹{salaryStructure.provident_fund?.toLocaleString('en-IN')} • PT: ₹{(salaryStructure.professional_tax || 200).toLocaleString('en-IN')}
            </p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-200 dark:border-emerald-800">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Net Monthly Take-Home</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                ₹{salaryStructure.net_salary?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">NEFT / IMPS</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Bank: {salaryStructure.bank_name || 'HDFC Bank'} ({salaryStructure.account_number || '**** 4892'})
            </p>
          </Card>
        </div>
      )}

      {/* Monthly Payslips Table */}
      <Card>
        <CardHeader
          title="Generated Monthly Salary Slips"
          subtitle="Click on any salary slip to preview or print official company compensation voucher"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Payslip Number</th>
                <th className="px-6 py-3.5">Pay Period</th>
                <th className="px-6 py-3.5">Gross Pay</th>
                <th className="px-6 py-3.5">Deductions</th>
                <th className="px-6 py-3.5">Net Take-Home</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading payslips...</td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    No generated payslips available yet.
                  </td>
                </tr>
              ) : (
                payslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {slip.payslip_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {monthNames[slip.month - 1]} {slip.year}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      ₹{slip.gross_pay?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-rose-600 dark:text-rose-400 font-semibold font-mono">
                      -₹{slip.total_deductions?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700 dark:text-emerald-400 text-sm font-mono">
                      ₹{slip.net_pay?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={slip.payment_status || 'Paid'}>{slip.payment_status || 'Paid'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleOpenSlip(slip.id)}
                      >
                        View Slip
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Salary Slip Modal */}
      <Modal
        isOpen={showSlipModal}
        onClose={() => setShowSlipModal(false)}
        maxWidth="max-w-3xl"
        showClose={false}
      >
        <SalarySlipView
          payslip={selectedPayslip}
          onClose={() => setShowSlipModal(false)}
        />
      </Modal>
    </div>
  );
}
