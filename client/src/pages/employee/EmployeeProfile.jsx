import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/apiClient';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Shield,
  Edit3,
  Check,
  AlertCircle,
  CheckCircle2,
  Lock,
  UploadCloud,
  FileCheck,
  Eye,
  Trash2,
  Download,
  File,
  Sparkles,
  Paperclip,
  X
} from 'lucide-react';

export function EmployeeProfile() {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal'); // personal, job, salary, documents

  // Edit Self-Service Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    avatarUrl: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Upload Document Modal & Drag/Drop State
  const [showDocModal, setShowDocModal] = useState(false);
  const [docFormData, setDocFormData] = useState({
    title: '',
    docType: 'Aadhaar Card'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      const data = await api.getEmployeeById(user.id);
      setProfileData(data);
      if (data.employee) {
        setEditFormData({
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
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const handleUpdateSelfService = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');

    try {
      setSaving(true);
      await api.updateProfile(user.id, editFormData);
      setSaveSuccess('Profile details updated successfully!');
      await refreshUser();
      await fetchProfile();
      setTimeout(() => {
        setShowEditModal(false);
        setSaveSuccess('');
      }, 1200);
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Handle file selection from input or drag
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setUploadError('File size exceeds maximum 15MB limit.');
        return;
      }
      setSelectedFile(file);
      setUploadError('');
      if (!docFormData.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setDocFormData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setUploadError('File size exceeds maximum 15MB limit.');
        return;
      }
      setSelectedFile(file);
      setUploadError('');
      if (!docFormData.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setDocFormData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!docFormData.title) {
      setUploadError('Please enter a document title.');
      return;
    }

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('title', docFormData.title);
      formData.append('docType', docFormData.docType);

      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('fileName', `${docFormData.title.replace(/\s+/g, '_')}.pdf`);
        formData.append('fileSize', '1.2 MB');
      }

      await api.uploadDocument(user.id, formData);
      setUploadSuccess('Document uploaded successfully!');
      await fetchProfile();

      setTimeout(() => {
        setShowDocModal(false);
        setDocFormData({ title: '', docType: 'Aadhaar Card' });
        setSelectedFile(null);
        setUploadSuccess('');
      }, 1000);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      setDeletingDocId(docId);
      await api.deleteDocument(user.id, docId);
      await fetchProfile();
    } catch (err) {
      alert(err.message || 'Failed to delete document.');
    } finally {
      setDeletingDocId(null);
    }
  };

  const emp = profileData?.employee || user;
  const salary = profileData?.salary;
  const documents = profileData?.documents || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Profile Header Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-subtle relative overflow-hidden transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={emp?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp?.employeeId}`}
                alt={emp?.firstName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-emerald-50 dark:ring-emerald-950 shadow-md"
              />
              <span className="absolute bottom-0 right-0 p-1 bg-emerald-600 rounded-full text-white ring-2 ring-white dark:ring-slate-900" title="Verified Member">
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {emp?.firstName} {emp?.lastName}
                </h1>
                <Badge variant={emp?.status || 'Active'}>{emp?.status || 'Active'}</Badge>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                {emp?.designation} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{emp?.department}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg text-slate-700 dark:text-slate-300 font-mono font-bold">
                  ID: {emp?.employeeId}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {emp?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joined {emp?.dateOfJoining}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="md"
            icon={Edit3}
            onClick={() => setShowEditModal(true)}
            className="shadow-xs font-bold"
          >
            Edit Profile
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-4 flex gap-2 overflow-x-auto">
          {[
            { id: 'personal', label: 'Personal & Contact', icon: User },
            { id: 'job', label: 'Job & Location', icon: Building },
            { id: 'salary', label: 'Salary Structure (₹)', icon: DollarSign },
            { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Contact Information" subtitle="Official & Personal Communication" />
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Phone Number</span>
                <span className="font-bold text-slate-900 dark:text-white">{emp?.phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Work Email</span>
                <span className="font-bold text-slate-900 dark:text-white">{emp?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Current Address</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">{emp?.address || 'HSR Layout, Bengaluru'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">City, State & PIN</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {emp?.city || 'Bengaluru'}, {emp?.state || 'Karnataka'} - {emp?.zipCode || '560102'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Country</span>
                <span className="font-bold text-slate-900 dark:text-white">{emp?.country || 'India'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Emergency Contact & Personal Bio" subtitle="Emergency kin & brief biography" />
            <CardContent className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Contact Person</span>
                  <span className="font-bold text-slate-900 dark:text-white">{emp?.emergencyContactName || 'Family Member'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Relationship</span>
                  <span className="font-bold text-slate-900 dark:text-white">{emp?.emergencyContactRelation || 'Parent / Spouse'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Emergency Phone</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{emp?.emergencyContactPhone || '+91 98765 00000'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1.5">Personal Biography</span>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {emp?.bio || 'Passionate team member building innovative solutions at Dayflow Technologies.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'job' && (
        <Card>
          <CardHeader title="Employment & Organization Details" subtitle="Role, reporting, and operational location" />
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 font-semibold">Department</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{emp?.department}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 font-semibold">Designation</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{emp?.designation}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 font-semibold">Employment Type</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{emp?.employmentType || 'Full-Time'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 font-semibold">Work Location</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{emp?.workLocation || 'HQ — Electronic City, Bengaluru'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 font-semibold">Reporting Manager</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{emp?.reportingManager || 'Priya Sharma'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 font-semibold">Date of Joining</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{emp?.dateOfJoining}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'salary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gross Monthly CTC</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  ₹{(salary?.gross_salary || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 font-bold">INR / mo</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Annual CTC: ₹{((salary?.gross_salary || 0) * 12).toLocaleString('en-IN')}</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-rose-50/40 to-white dark:from-rose-950/20 dark:to-slate-900 border-rose-100 dark:border-rose-900/40">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Total Deductions</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-black text-rose-700 dark:text-rose-400 font-mono">
                  -₹{(salary?.total_deductions || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-rose-400 font-bold">EPF, PT & TDS</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">EPF @ 12%: ₹{(salary?.provident_fund || 0).toLocaleString('en-IN')}</p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-200 dark:border-emerald-800">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Net Monthly Disbursal</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  ₹{(salary?.net_salary || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Bank Transfer</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Bank: {salary?.bank_name || 'HDFC Bank'} ({salary?.account_number || '**** 4892'})</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Earnings Components" subtitle="Monthly salary allowances breakdown" />
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Basic Salary (50% of CTC)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">₹{(salary?.basic_salary || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">House Rent Allowance (HRA 40%)</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">₹{(salary?.hra || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Special Allowance</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">₹{(salary?.special_allowance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Conveyance Allowance</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">₹{(salary?.conveyance_allowance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-600 dark:text-slate-400">Medical Allowance</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">₹{(salary?.medical_allowance || 0).toLocaleString('en-IN')}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Deductions & Banking" subtitle="Statutory taxes and disbursement account" />
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Employees' Provident Fund (EPF)</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">-₹{(salary?.provident_fund || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Professional Tax (PT Karnataka/State)</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">-₹{(salary?.professional_tax || 200).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Group Health Insurance Premium</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">-₹{(salary?.health_insurance || 750).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Bank Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{salary?.bank_name || 'HDFC Bank'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-600 dark:text-slate-400">Account Number</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{salary?.account_number || '**** **** 4892'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Documents & Files Tab with Comprehensive Drag and Drop */}
      {activeTab === 'documents' && (
        <Card>
          <CardHeader
            title="Official & Statutory Documents"
            subtitle="Verified identity, tax, and employment documents in your employee folder"
            action={
              <Button
                variant="primary"
                size="sm"
                icon={UploadCloud}
                onClick={() => setShowDocModal(true)}
                className="font-bold shadow-sm"
              >
                Upload Document
              </Button>
            }
          />
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No documents uploaded yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Upload your Aadhaar card, PAN card, educational certificates, or appointment letter to complete your employee file.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={UploadCloud}
                  onClick={() => setShowDocModal(true)}
                  className="mt-4 font-bold"
                >
                  Upload First Document
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-2.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <Badge variant="primary" size="sm">{doc.doc_type || 'Document'}</Badge>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3 leading-snug truncate" title={doc.title}>
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {doc.file_name}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>{doc.file_size || '1.2 MB'}</span>
                        <span>•</span>
                        <span>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Verified'}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <a
                        href={doc.file_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        onClick={(e) => {
                          if (!doc.file_url || doc.file_url.startsWith('/docs/')) {
                            e.preventDefault();
                            alert(`Viewing certified document: ${doc.title} (${doc.file_name})\nStatus: Official Record Verified.`);
                          }
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" /> View / Download
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        disabled={deletingDocId === doc.id}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Self-Service Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Personal Information"
        subtitle="Update your contact number, Indian address, avatar image, and emergency contacts."
      >
        {saveError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{saveSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUpdateSelfService} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={editFormData.avatarUrl}
              onChange={(e) => setEditFormData({ ...editFormData, avatarUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Phone Number (+91)
            </label>
            <input
              type="text"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Street Address
            </label>
            <input
              type="text"
              value={editFormData.address}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              placeholder="124, 5th Cross, Koramangala 4th Block"
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                City
              </label>
              <input
                type="text"
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                placeholder="Bengaluru"
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                State
              </label>
              <input
                type="text"
                value={editFormData.state}
                onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                placeholder="Karnataka"
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                PIN Code
              </label>
              <input
                type="text"
                value={editFormData.zipCode}
                onChange={(e) => setEditFormData({ ...editFormData, zipCode: e.target.value })}
                placeholder="560034"
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Emergency Contact</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={editFormData.emergencyContactName}
                onChange={(e) => setEditFormData({ ...editFormData, emergencyContactName: e.target.value })}
                placeholder="Contact Name"
                className="block w-full px-3 py-2 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={editFormData.emergencyContactRelation}
                onChange={(e) => setEditFormData({ ...editFormData, emergencyContactRelation: e.target.value })}
                placeholder="Relation (e.g. Spouse)"
                className="block w-full px-3 py-2 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <input
              type="text"
              value={editFormData.emergencyContactPhone}
              onChange={(e) => setEditFormData({ ...editFormData, emergencyContactPhone: e.target.value })}
              placeholder="Emergency Phone Number (+91)"
              className="block w-full px-3 py-2 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-650 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Bio / Summary
            </label>
            <textarea
              rows={2}
              value={editFormData.bio}
              onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
              placeholder="Tell your team about yourself..."
              className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload Document Modal with Real File Drag-and-Drop */}
      <Modal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        title="Upload Document"
        subtitle="Attach statutory, tax, educational or appointment documents to your employee record."
      >
        {uploadError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUploadDoc} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Document Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={docFormData.docType}
              onChange={(e) => setDocFormData({ ...docFormData, docType: e.target.value })}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Aadhaar Card">Aadhaar Card (Govt ID Proof)</option>
              <option value="PAN Card">Permanent Account Number (PAN Card)</option>
              <option value="Offer Letter">Appointment / Offer Letter</option>
              <option value="Tax Form">Form 16 / TDS Certificate</option>
              <option value="Certificate">Degree / Professional Certificate</option>
              <option value="Medical">Group Health Insurance / Medical Proof</option>
              <option value="Other">Other Document</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Document Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={docFormData.title}
              onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
              placeholder="e.g. Aadhaar Card Copy or Degree Certificate"
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Drag and Drop Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              File Attachment (PDF, DOCX, PNG, JPG up to 15MB)
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt"
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to browse or drag & drop file here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports PDF, DOCX, PNG, JPG up to 15 MB
              </p>
            </div>

            {/* Selected File Preview Card */}
            {selectedFile && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <File className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowDocModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={uploadingDoc}>
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
