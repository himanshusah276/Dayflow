import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  UserCheck,
  Shield,
  LayoutGrid,
  List,
  AlertCircle,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';

export function EmployeeDirectory() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    role: 'employee',
    firstName: '',
    lastName: '',
    phone: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    dateOfJoining: new Date().toISOString().split('T')[0],
    employmentType: 'Full-Time',
    basicSalary: 65000,
    reportingManager: 'Priya Sharma',
    workLocation: 'HQ — Electronic City, Bengaluru'
  });
  const [addingEmp, setAddingEmp] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Employee Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEmp, setSavingEmp] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await api.getEmployees({
        search,
        department,
        status,
      });
      setEmployees(data.employees || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department, status]);

  // If redirected with an ID, open edit modal automatically
  useEffect(() => {
    if (highlightId && employees.length > 0) {
      const target = employees.find(e => e.id === parseInt(highlightId, 10));
      if (target) {
        openEditModal(target);
      }
    }
  }, [highlightId, employees]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');

    try {
      setAddingEmp(true);
      await api.createEmployee(addFormData);
      setShowAddModal(false);
      setAddFormData({
        employeeId: '',
        email: '',
        password: '',
        role: 'employee',
        firstName: '',
        lastName: '',
        phone: '',
        department: 'Engineering',
        designation: 'Software Engineer',
        dateOfJoining: new Date().toISOString().split('T')[0],
        employmentType: 'Full-Time',
        basicSalary: 65000,
        reportingManager: 'Priya Sharma',
        workLocation: 'HQ — Electronic City, Bengaluru'
      });
      await fetchEmployees();
    } catch (err) {
      setAddError(err.message || 'Failed to create employee');
    } finally {
      setAddingEmp(false);
    }
  };

  const openEditModal = async (emp) => {
    try {
      const data = await api.getEmployeeById(emp.id);
      setSelectedEmp(data.employee);
      setEditFormData({
        firstName: data.employee.firstName || '',
        lastName: data.employee.lastName || '',
        department: data.employee.department || 'Engineering',
        designation: data.employee.designation || '',
        dateOfJoining: data.employee.dateOfJoining || '',
        employmentType: data.employee.employmentType || 'Full-Time',
        status: data.employee.status || 'Active',
        role: data.employee.role || 'employee',
        reportingManager: data.employee.reportingManager || '',
        workLocation: data.employee.workLocation || '',
        phone: data.employee.phone || '',
        address: data.employee.address || '',
        city: data.employee.city || '',
        state: data.employee.state || '',
        zipCode: data.employee.zipCode || '',
        emergencyContactName: data.employee.emergencyContactName || '',
        emergencyContactPhone: data.employee.emergencyContactPhone || '',
        emergencyContactRelation: data.employee.emergencyContactRelation || '',
        avatarUrl: data.employee.avatarUrl || '',
        bio: data.employee.bio || ''
      });
      setShowEditModal(true);
    } catch (err) {
      alert(err.message || 'Failed to fetch employee details');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    try {
      setSavingEmp(true);
      await api.updateProfile(selectedEmp.id, editFormData);
      setShowEditModal(false);
      setSelectedEmp(null);
      await fetchEmployees();
    } catch (err) {
      setEditError(err.message || 'Failed to update employee');
    } finally {
      setSavingEmp(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete/terminate ${name}? This will remove all their profile, attendance, and leave records.`)) {
      try {
        await api.deleteEmployee(id);
        await fetchEmployees();
      } catch (err) {
        alert(err.message || 'Failed to delete employee');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Employee Directory & Roster
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage company employees, job titles, roles, compensation structures, and access terms across India
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setShowAddModal(true)}
          className="font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
        >
          Add New Employee
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email, employee ID, or designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Infrastructure">Infrastructure</option>
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Employees Grid / Table View */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading employee directory...</div>
      ) : employees.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No employees match your search</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting your filters or adding a new employee.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {employees.map((emp) => (
            <Card key={emp.id} hover className="overflow-hidden p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.employee_id}`}
                      alt={emp.first_name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-xs"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {emp.first_name} {emp.last_name}
                      </h4>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">{emp.designation}</p>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{emp.employee_id}</span>
                    </div>
                  </div>
                  <Badge variant={emp.status || 'Active'} size="sm">{emp.status || 'Active'}</Badge>
                </div>

                <div className="space-y-2 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Department</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{emp.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Role Access</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{emp.role?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Monthly Gross (₹)</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">₹{emp.gross_salary?.toLocaleString('en-IN') || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Work Email</span>
                    <span className="truncate max-w-[150px] font-medium text-slate-700 dark:text-slate-300">{emp.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => openEditModal(emp)}
                  className="flex-1 text-xs"
                >
                  Edit Profile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(emp.id, `${emp.first_name} ${emp.last_name}`)}
                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2 cursor-pointer"
                  title="Delete/Terminate Employee"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Designation</th>
                  <th className="px-6 py-3.5">Gross CTC (₹)</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.employee_id}`}
                          alt={emp.first_name}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-750"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{emp.first_name} {emp.last_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{emp.employee_id} • {emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{emp.department}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{emp.designation}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">₹{emp.gross_salary?.toLocaleString('en-IN') || '—'}</td>
                    <td className="px-6 py-4 capitalize text-slate-600 dark:text-slate-400">{emp.role?.replace('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <Badge variant={emp.status || 'Active'}>{emp.status || 'Active'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit}
                        onClick={() => openEditModal(emp)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(emp.id, `${emp.first_name} ${emp.last_name}`)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        maxWidth="max-w-2xl"
        title="Add New Employee"
        subtitle="Create an employee record, login credentials, and initial compensation structure (₹ INR)"
      >
        {addError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{addError}</span>
          </div>
        )}

        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={addFormData.firstName}
                onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })}
                placeholder="e.g. Rahul"
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={addFormData.lastName}
                onChange={(e) => setAddFormData({ ...addFormData, lastName: e.target.value })}
                placeholder="e.g. Sharma"
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Employee ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={addFormData.employeeId}
                onChange={(e) => setAddFormData({ ...addFormData, employeeId: e.target.value })}
                placeholder="EMP-110"
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                placeholder="rahul@dayflow.com"
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={addFormData.department}
                onChange={(e) => setAddFormData({ ...addFormData, department: e.target.value })}
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={addFormData.designation}
                onChange={(e) => setAddFormData({ ...addFormData, designation: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Role Access
              </label>
              <select
                value={addFormData.role}
                onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="employee">Employee</option>
                <option value="hr_admin">HR Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Basic Salary (₹ / mo)
              </label>
              <input
                type="number"
                value={addFormData.basicSalary}
                onChange={(e) => setAddFormData({ ...addFormData, basicSalary: parseFloat(e.target.value) || 0 })}
                placeholder="65000"
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Date of Joining
              </label>
              <input
                type="date"
                value={addFormData.dateOfJoining}
                onChange={(e) => setAddFormData({ ...addFormData, dateOfJoining: e.target.value })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={addingEmp}>
              Add Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Full Employee Record Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="max-w-3xl"
        title={`Edit Employee Record: ${selectedEmp?.firstName} ${selectedEmp?.lastName}`}
        subtitle={`Admin full-control editor for ${selectedEmp?.employeeId} (${selectedEmp?.email})`}
      >
        {editError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{editError}</span>
          </div>
        )}

        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={editFormData.firstName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={editFormData.lastName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <select
                value={editFormData.department || 'Engineering'}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Designation
              </label>
              <input
                type="text"
                value={editFormData.designation || ''}
                onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Employment Status
              </label>
              <select
                value={editFormData.status || 'Active'}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Role Access Level
              </label>
              <select
                value={editFormData.role || 'employee'}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="employee">Employee</option>
                <option value="hr_admin">HR Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Employment Type
              </label>
              <select
                value={editFormData.employmentType || 'Full-Time'}
                onChange={(e) => setEditFormData({ ...editFormData, employmentType: e.target.value })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Date of Joining
              </label>
              <input
                type="date"
                value={editFormData.dateOfJoining || ''}
                onChange={(e) => setEditFormData({ ...editFormData, dateOfJoining: e.target.value })}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Reporting Manager
              </label>
              <input
                type="text"
                value={editFormData.reportingManager || ''}
                onChange={(e) => setEditFormData({ ...editFormData, reportingManager: e.target.value })}
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Work Location
              </label>
              <input
                type="text"
                value={editFormData.workLocation || ''}
                onChange={(e) => setEditFormData({ ...editFormData, workLocation: e.target.value })}
                className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingEmp}>
              Save All Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
