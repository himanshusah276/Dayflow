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
    currency: 'INR'
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
      currency: st.currency || 'INR'
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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Payroll & Compensation Operations (₹ INR)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure employee compensation structures, disburse monthly payroll runs in INR, and issue salary slips
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={FileSpreadsheet}
            isLoading={exporting}
            onClick={handleExportRegister}
            className="shadow-xs font-bold cursor-pointer"
          >
            Export Payroll Register
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Play}
            onClick={() => setShowGenerateModal(true)}
            className="font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            Run Monthly Payroll
          </Button>
        </div>
      </div>

      {/* KPI Cost Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Monthly Gross CTC</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">₹{totalGrossCost.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all {structures.length} active employees</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-950/20 dark:to-slate-900 border-rose-100 dark:border-rose-900/40">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Total Taxes & Statutory Deductions</span>
          <p className="text-3xl font-black text-rose-700 dark:text-rose-400 mt-1 font-mono">-₹{totalDeductionsCost.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">TDS, EPF, PT, and Health Insurance withholding</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50/70 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-200 dark:border-emerald-800">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Total Net Disbursal</span>
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">₹{totalNetCost.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-bold">Transferred via NEFT / IMPS Direct Deposit</p>
        </Card>
      </div>

      {/* Tab Switcher & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('structures')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'structures'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Salary Structures ({structures.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('slips')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'slips'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                className="w-full pl-10 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <thead className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {structures.map((st) => {
                  const allowances = (st.conveyance_allowance || 0) + (st.special_allowance || 0) + (st.medical_allowance || 0);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.employee_id}`}
                            alt={st.first_name}
                            className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs">{st.first_name} {st.last_name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{st.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{st.department}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">₹{st.basic_salary?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">₹{st.hra?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">₹{allowances.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">₹{st.gross_salary?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 font-mono text-rose-600 dark:text-rose-400">-₹{st.total_deductions?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm">₹{st.net_salary?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit}
                          onClick={() => openEditStructModal(st)}
                        >
                          Modify Structure
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

      {/* Tab Content: Generated Payslips */}
      {activeTab === 'slips' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Payslip #</th>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Pay Period</th>
                  <th className="px-6 py-3.5">Gross Pay</th>
                  <th className="px-6 py-3.5">Deductions</th>
                  <th className="px-6 py-3.5">Net Pay</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {slip.payslip_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {slip.first_name} {slip.last_name}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {monthNames[slip.month - 1]} {slip.year}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      ₹{slip.gross_pay?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-rose-600 dark:text-rose-400 font-mono">
                      -₹{slip.total_deductions?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
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
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Structure Modal */}
      <Modal
        isOpen={showEditStructModal}
        onClose={() => setShowEditStructModal(false)}
        maxWidth="max-w-2xl"
        title={`Edit Compensation Structure: ${selectedStruct?.first_name} ${selectedStruct?.last_name}`}
        subtitle="Set Indian statutory compensation components, EPF, PT, and bank account"
      >
        <form onSubmit={handleStructSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Basic Salary (₹ / mo)
              </label>
              <input
                type="number"
                value={structFormData.basicSalary}
                onChange={(e) => setStructFormData({ ...structFormData, basicSalary: parseFloat(e.target.value) || 0 })}
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                House Rent Allowance (HRA ₹)
              </label>
              <input
                type="number"
                value={structFormData.hra}
                onChange={(e) => setStructFormData({ ...structFormData, hra: parseFloat(e.target.value) || 0 })}
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Conveyance (₹)
              </label>
              <input
                type="number"
                value={structFormData.conveyanceAllowance}
                onChange={(e) => setStructFormData({ ...structFormData, conveyanceAllowance: parseFloat(e.target.value) || 0 })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Special Allow (₹)
              </label>
              <input
                type="number"
                value={structFormData.specialAllowance}
                onChange={(e) => setStructFormData({ ...structFormData, specialAllowance: parseFloat(e.target.value) || 0 })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Medical (₹)
              </label>
              <input
                type="number"
                value={structFormData.medicalAllowance}
                onChange={(e) => setStructFormData({ ...structFormData, medicalAllowance: parseFloat(e.target.value) || 0 })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                EPF Ded (12% ₹)
              </label>
              <input
                type="number"
                value={structFormData.providentFund}
                onChange={(e) => setStructFormData({ ...structFormData, providentFund: parseFloat(e.target.value) || 0 })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                PT (₹200)
              </label>
              <input
                type="number"
                value={structFormData.professionalTax}
                onChange={(e) => setStructFormData({ ...structFormData, professionalTax: parseFloat(e.target.value) || 0 })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Health Ins (₹)
              </label>
              <input
                type="number"
                value={structFormData.healthInsurance}
                onChange={(e) => setStructFormData({ ...structFormData, healthInsurance: parseFloat(e.target.value) || 0 })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Bank Name
              </label>
              <input
                type="text"
                value={structFormData.bankName}
                onChange={(e) => setStructFormData({ ...structFormData, bankName: e.target.value })}
                placeholder="HDFC Bank"
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                value={structFormData.accountNumber}
                onChange={(e) => setStructFormData({ ...structFormData, accountNumber: e.target.value })}
                placeholder="50100482910291"
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
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

      {/* Generate Payroll Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Execute Monthly Payroll Disbursal"
        subtitle="Calculates gross pay, statutory taxes, and auto-generates salary slip vouchers for all active team members"
      >
        <form onSubmit={handleGeneratePayroll} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Payroll Month
              </label>
              <select
                value={genMonth}
                onChange={(e) => setGenMonth(parseInt(e.target.value, 10))}
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                {monthNames.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Year
              </label>
              <input
                type="number"
                value={genYear}
                onChange={(e) => setGenYear(parseInt(e.target.value, 10))}
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Date
            </label>
            <input
              type="date"
              value={genPayDate}
              onChange={(e) => setGenPayDate(e.target.value)}
              className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={generating}>
              Run Payroll & Issue Slips
            </Button>
          </div>
        </form>
      </Modal>

      {/* Salary Slip Voucher Modal */}
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
