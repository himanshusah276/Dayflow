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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Salary & Payslips
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your monthly salary slips, compensation structure, and tax deduction vouchers
          </p>
        </div>
      </div>

      {/* Salary Overview Summary Cards */}
      {salaryStructure && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-gradient-to-br from-slate-50 to-white border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Gross Pay</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900">
                ${salaryStructure.gross_salary?.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono">USD / month</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Basic: ${salaryStructure.basic_salary?.toLocaleString()} • HRA: ${salaryStructure.hra?.toLocaleString()}
            </p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-rose-50/40 to-white border-rose-100">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Total Monthly Deductions</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-rose-700">
                -${salaryStructure.total_deductions?.toLocaleString()}
              </span>
              <span className="text-xs text-rose-400 font-medium font-mono">Tax, PF & Health</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              PF: ${salaryStructure.provident_fund?.toLocaleString()} • Tax: ${salaryStructure.professional_tax?.toLocaleString()}
            </p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Net Disbursed Take-Home</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-emerald-700 font-mono">
                ${salaryStructure.net_salary?.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-600 font-bold">Direct Deposit</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Bank: {salaryStructure.bank_name || 'Direct Deposit'} ({salaryStructure.account_number || '****'})
            </p>
          </Card>
        </div>
      )}

      {/* Monthly Payslips Table */}
      <Card>
        <CardHeader
          title="Generated Monthly Salary Slips"
          subtitle="Click on any salary slip to preview or print official company voucher"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Payslip Number</th>
                <th className="px-6 py-3.5">Pay Period</th>
                <th className="px-6 py-3.5">Gross Pay</th>
                <th className="px-6 py-3.5">Deductions</th>
                <th className="px-6 py-3.5">Net Pay</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                  <tr key={slip.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {slip.payslip_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {monthNames[slip.month - 1]} {slip.year}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      ${slip.gross_pay?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-rose-600 font-semibold">
                      -${slip.total_deductions?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700 text-sm">
                      ${slip.net_pay?.toLocaleString()}
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
                        View & Print
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
