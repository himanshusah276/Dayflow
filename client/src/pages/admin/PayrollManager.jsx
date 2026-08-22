import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { SalarySlipView } from '../../components/payroll/SalarySlipView';
import {
  DollarSign,
  Play,
  Download,
  Edit,
  Eye,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function PayrollManager() {
  const [activeTab, setActiveTab] = useState('structures'); // 'structures' or 'slips'
  const [structures, setStructures] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [slipMonth, setSlipMonth] = useState('All');
  const [slipYear, setSlipYear] = useState('2026');

  // Edit Structure Modal
  const [showEditStructModal, setShowEditStructModal] = useState(false);
  const [selectedStruct, setSelectedStruct] = useState(null);
  const [structFormData, setStructFormData] = useState({
    basicSalary: 0,
    hra: 0,
    conveyanceAllowance: 0,
    specialAllowance: 0,
    medicalAllowance: 0,
    providentFund: 0,
    professionalTax: 0,
    healthInsurance: 0,
    bankName: '',
    accountNumber: '',
    currency: 'USD'
  });
  const [savingStruct, setSavingStruct] = useState(false);

  // Generate Payroll Run Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genPayDate, setGenPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState(null);

  // Payslip Preview Modal
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [structData, slipData] = await Promise.all([
        api.getAllSalaryStructures({ department, search }),
        api.getAllPayslips({ month: slipMonth, year: slipYear, department, search }),
      ]);
      setStructures(structData.structures || []);
      setPayslips(slipData.payslips || []);
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [department, search, slipMonth, slipYear]);

  const handleExportRegister = async () => {
    try {
      setExporting(true);
      await api.downloadPayrollReport({
        month: slipMonth,
        year: slipYear,
      });
    } catch (err) {
      alert(err.message || 'Failed to export payroll register');
    } finally {
      setExporting(false);
    }
  };

  const openEditStructModal = (st) => {
    setSelectedStruct(st);
    setStructFormData({
      basicSalary: st.basic_salary || 0,
      hra: st.hra || 0,
      conveyanceAllowance: st.conveyance_allowance || 0,
      specialAllowance: st.special_allowance || 0,
      medicalAllowance: st.medical_allowance || 0,
      providentFund: st.provident_fund || 0,
      professionalTax: st.professional_tax || 0,
      healthInsurance: st.health_insurance || 0,
      bankName: st.bank_name || '',
      accountNumber: st.account_number || '',
      currency: st.currency || 'USD'
    });
    setShowEditStructModal(true);
  };

  const handleStructSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStruct) return;

    try {
      setSavingStruct(true);
      await api.updateSalaryStructure(selectedStruct.user_id, structFormData);
      setShowEditStructModal(false);
      setSelectedStruct(null);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update salary structure');
    } finally {
      setSavingStruct(false);
    }
  };

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    setGenResult(null);

    try {
      setGenerating(true);
      const data = await api.generateMonthlyPayroll({
        month: genMonth,
        year: genYear,
        paymentDate: genPayDate,
      });

      confetti({ particleCount: 80, spread: 70 });
      setGenResult(data.message);
      setTimeout(() => {
        setShowGenerateModal(false);
        setGenResult(null);
        setActiveTab('slips');
        fetchData();
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to run payroll');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenSlip = async (id) => {
    try {
      const data = await api.getPayslipById(id);
      setSelectedPayslip(data.payslip);
      setShowSlipModal(true);
    } catch (err) {
      alert(err.message || 'Failed to open payslip');
    }
  };

  const totalGrossCost = structures.reduce((acc, s) => acc + (s.gross_salary || 0), 0);
  const totalNetCost = structures.reduce((acc, s) => acc + (s.net_salary || 0), 0);
  const totalDeductionsCost = structures.reduce((acc, s) => acc + (s.total_deductions || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Payroll & Compensation Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure employee compensation structures, disburse monthly payroll runs, and issue salary slips
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={FileSpreadsheet}
            isLoading={exporting}
            onClick={handleExportRegister}
            className="shadow-xs font-semibold"
          >
            Export Payroll Register
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Play}
            onClick={() => setShowGenerateModal(true)}
            className="font-bold shadow-md shadow-emerald-600/30"
          >
            Run Monthly Payroll
          </Button>
        </div>
      </div>

      {/* KPI Cost Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-slate-50 to-white border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Monthly Gross Cost</span>
          <p className="text-3xl font-black text-slate-900 mt-1 font-mono">${totalGrossCost.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all {structures.length} active employees</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-rose-50/50 to-white border-rose-100">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Total Taxes & Deductions</span>
          <p className="text-3xl font-black text-rose-700 mt-1 font-mono">-${totalDeductionsCost.toLocaleString()}</p>
          <p className="text-[11px] text-rose-600/80 mt-1">TDS, PF, and Medical Insurance withholding</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50/70 to-white border-emerald-200">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Net Disbursal</span>
          <p className="text-3xl font-black text-emerald-700 mt-1 font-mono">${totalNetCost.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">Transferred via ACH / Direct Deposit</p>
        </Card>
      </div>

      {/* Tab Switcher & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('structures')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'structures'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Salary Structures ({structures.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('slips')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'slips'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Generated Payslips ({payslips.length})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-1 sm:justify-end items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tab Content: Salary Structures */}
      {activeTab === 'structures' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Basic Salary</th>
                  <th className="px-6 py-3.5">HRA</th>
                  <th className="px-6 py-3.5">Allowances</th>
                  <th className="px-6 py-3.5">Gross Pay</th>
                  <th className="px-6 py-3.5">Deductions</th>
                  <th className="px-6 py-3.5">Net Pay</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {structures.map((st) => {
                  const allowances = (st.conveyance_allowance || 0) + (st.special_allowance || 0) + (st.medical_allowance || 0);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.employee_id}`}
                            alt={st.first_name}
                            className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{st.first_name} {st.last_name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{st.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{st.department}</td>
                      <td className="px-6 py-4 font-mono">${st.basic_salary?.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono">${st.hra?.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono">${allowances.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 font-mono">${st.gross_salary?.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-rose-600">-${st.total_deductions?.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-emerald-700 font-mono text-sm">${st.net_salary?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit}
                          onClick={() => openEditStructModal(st)}
                        >
                          Modify
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab Content: Generated Payslips Archive */}
      {activeTab === 'slips' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Payslip Number</th>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Period</th>
                  <th className="px-6 py-3.5">Gross Pay</th>
                  <th className="px-6 py-3.5">Deductions</th>
                  <th className="px-6 py-3.5">Net Pay</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payslips.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                      No payslips found. Click "Run Monthly Payroll" to generate payslips.
                    </td>
                  </tr>
                ) : (
                  payslips.map((slip) => (
                    <tr key={slip.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{slip.payslip_number}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{slip.first_name} {slip.last_name}</p>
                        <p className="text-[11px] text-slate-400">{slip.department} • {slip.employee_id}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{monthNames[slip.month - 1]} {slip.year}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-800">${slip.gross_pay?.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-rose-600">-${slip.total_deductions?.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-emerald-700 font-mono text-sm">${slip.net_pay?.toLocaleString()}</td>
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
                          View Voucher
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Salary Structure Modal */}
      <Modal
        isOpen={showEditStructModal}
        onClose={() => setShowEditStructModal(false)}
        maxWidth="max-w-2xl"
        title="Modify Compensation Structure"
        subtitle={`Adjust monthly earnings and statutory deductions for ${selectedStruct?.first_name} ${selectedStruct?.last_name}`}
      >
        <form onSubmit={handleStructSubmit} className="space-y-4">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Earnings Components ($)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Basic Salary</label>
                <input
                  type="number"
                  value={structFormData.basicSalary}
                  onChange={(e) => setStructFormData({ ...structFormData, basicSalary: e.target.value })}
                  className="block w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">House Rent Allowance (HRA)</label>
                <input
                  type="number"
                  value={structFormData.hra}
                  onChange={(e) => setStructFormData({ ...structFormData, hra: e.target.value })}
                  className="block w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Conveyance Allowance</label>
                <input
                  type="number"
                  value={structFormData.conveyanceAllowance}
                  onChange={(e) => setStructFormData({ ...structFormData, conveyanceAllowance: e.target.value })}
                  className="block w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Special Allowance</label>
                <input
                  type="number"
                  value={structFormData.specialAllowance}
                  onChange={(e) => setStructFormData({ ...structFormData, specialAllowance: e.target.value })}
                  className="block w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2">Deduction Components ($)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Provident Fund</label>
                <input
                  type="number"
                  value={structFormData.providentFund}
                  onChange={(e) => setStructFormData({ ...structFormData, providentFund: e.target.value })}
                  className="block w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tax / TDS</label>
                <input
                  type="number"
                  value={structFormData.professionalTax}
                  onChange={(e) => setStructFormData({ ...structFormData, professionalTax: e.target.value })}
                  className="block w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Health Insurance</label>
                <input
                  type="number"
                  value={structFormData.healthInsurance}
                  onChange={(e) => setStructFormData({ ...structFormData, healthInsurance: e.target.value })}
                  className="block w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Bank Name</label>
              <input
                type="text"
                value={structFormData.bankName}
                onChange={(e) => setStructFormData({ ...structFormData, bankName: e.target.value })}
                placeholder="Chase Bank"
                className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Account Number</label>
              <input
                type="text"
                value={structFormData.accountNumber}
                onChange={(e) => setStructFormData({ ...structFormData, accountNumber: e.target.value })}
                placeholder="**** **** 1234"
                className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowEditStructModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingStruct}>
              Save Structure
            </Button>
          </div>
        </form>
      </Modal>

      {/* Run Monthly Payroll Generator Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Execute Monthly Payroll Run"
        subtitle="Process and generate payslips for all active employees for the selected period"
      >
        {genResult && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{genResult}</span>
          </div>
        )}

        <form onSubmit={handleGeneratePayroll} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Pay Month</label>
              <select
                value={genMonth}
                onChange={(e) => setGenMonth(parseInt(e.target.value, 10))}
                className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Pay Year</label>
              <select
                value={genYear}
                onChange={(e) => setGenYear(parseInt(e.target.value, 10))}
                className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Disbursal Date</label>
            <input
              type="date"
              value={genPayDate}
              onChange={(e) => setGenPayDate(e.target.value)}
              className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">Summary Before Execution:</p>
            <p className="mt-1">• Will compute and create payslips for <strong>{structures.length} active employees</strong>.</p>
            <p>• Automatically applies basic, HRA, allowances, and statutory taxes.</p>
            <p>• Sends real-time in-app notifications to all employees.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={generating}>
              Run Payroll
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payslip View Modal */}
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
