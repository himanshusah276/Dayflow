import React, { useState, useEffect } from 'react';
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
  Eye
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

  // Upload Document Modal
  const [showDocModal, setShowDocModal] = useState(false);
  const [docFormData, setDocFormData] = useState({
    title: '',
    docType: 'ID Proof',
    fileName: 'document.pdf',
    fileSize: '1.2 MB'
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);

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
      setSaveSuccess('Personal profile details updated successfully!');
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

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docFormData.title) return;

    try {
      setUploadingDoc(true);
      await api.uploadDocument(user.id, docFormData);
      await fetchProfile();
      setShowDocModal(false);
      setDocFormData({
        title: '',
        docType: 'ID Proof',
        fileName: 'document.pdf',
        fileSize: '1.2 MB'
      });
    } catch (err) {
      alert(err.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const emp = profileData?.employee || user;
  const salary = profileData?.salary;
  const documents = profileData?.documents || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Profile Header Hero */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={emp?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp?.employeeId}`}
                alt={emp?.firstName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-emerald-50 shadow-md"
              />
              <span className="absolute bottom-0 right-0 p-1 bg-emerald-600 rounded-full text-white ring-2 ring-white" title="Verified Member">
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {emp?.firstName} {emp?.lastName}
                </h1>
                <Badge variant={emp?.status || 'Active'}>{emp?.status || 'Active'}</Badge>
              </div>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                {emp?.designation} • <span className="text-emerald-700">{emp?.department}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg text-slate-700 font-mono">
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
            className="shadow-xs font-semibold"
          >
            Edit Contact & Details
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 border-t border-slate-100 pt-4 flex gap-2 overflow-x-auto">
          {[
            { id: 'personal', label: 'Personal & Contact', icon: User },
            { id: 'job', label: 'Job & Organization', icon: Building },
            { id: 'salary', label: 'Salary Structure', icon: DollarSign },
            { id: 'documents', label: 'Documents & Files', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Personal & Contact Details */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader
              title="Personal Information"
              subtitle="Your identity details & self-service bio"
            />
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium">Full Legal Name</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{emp?.firstName} {emp?.lastName}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Gender</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{emp?.gender || 'Not specified'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium">Date of Birth</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{emp?.dateOfBirth || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Role Access</span>
                  <p className="font-semibold text-emerald-700 text-sm mt-0.5 capitalize">{emp?.role?.replace('_', ' ')}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium">About / Bio</span>
                <p className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {emp?.bio || 'No bio added yet. Click "Edit Contact & Details" to add a bio.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Contact & Emergency Information"
              subtitle="Editable self-service address and emergency contacts"
              action={
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Self-Editable
                </span>
              }
            />
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium">Phone Number</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{emp?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Work Email</span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5 truncate">{emp?.email}</p>
                </div>
              </div>

              <div className="pb-3 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Residential Address</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">
                  {emp?.address ? `${emp.address}, ${emp.city || ''} ${emp.state || ''} ${emp.zipCode || ''} ${emp.country || ''}` : 'No address added'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Emergency Contact</span>
                <div className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-900">{emp?.emergencyContactName || 'None listed'}</p>
                  <p className="text-slate-600">Relation: {emp?.emergencyContactRelation || '—'}</p>
                  <p className="text-slate-600">Phone: {emp?.emergencyContactPhone || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Job & Organization Details (Protected / HR managed) */}
      {activeTab === 'job' && (
        <Card>
          <CardHeader
            title="Job & Employment Terms"
            subtitle="Official organizational employment terms (managed by HR)"
            action={
              <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> HR Controlled
              </div>
            }
          />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 font-medium">Department</span>
                <p className="text-base font-bold text-slate-900 mt-1">{emp?.department}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 font-medium">Designation / Title</span>
                <p className="text-base font-bold text-slate-900 mt-1">{emp?.designation}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 font-medium">Employment Type</span>
                <p className="text-base font-bold text-slate-900 mt-1">{emp?.employmentType || 'Full-Time'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 font-medium">Date of Joining</span>
                <p className="text-base font-bold text-slate-900 mt-1">{emp?.dateOfJoining}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 font-medium">Reporting Manager</span>
                <p className="text-base font-bold text-slate-900 mt-1">{emp?.reportingManager || 'HR Manager'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-400 font-medium">Primary Work Location</span>
                <p className="text-base font-bold text-slate-900 mt-1">{emp?.workLocation || 'Headquarters (San Francisco)'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Salary Structure (Read-Only) */}
      {activeTab === 'salary' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Salary Compensation Breakdown"
              subtitle="Read-only view of your compensation structure & monthly allowances"
              action={
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <Lock className="w-3.5 h-3.5" /> Read-Only View
                </div>
              }
            />
            <CardContent>
              {salary ? (
                <div className="space-y-6">
                  {/* High level highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">Monthly Gross Pay</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">
                        ${salary.gross_salary?.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                      <span className="text-xs text-rose-600 font-medium">Total Deductions</span>
                      <p className="text-2xl font-black text-rose-700 mt-1">
                        -${salary.total_deductions?.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <span className="text-xs text-emerald-800 font-bold">Net In-Hand Salary</span>
                      <p className="text-2xl font-black text-emerald-700 mt-1">
                        ${salary.net_salary?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Table */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Earnings */}
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/80">
                      <h4 className="font-bold text-slate-900 text-sm mb-3 text-emerald-800">
                        Earnings & Allowances
                      </h4>
                      <div className="space-y-2.5 divide-y divide-slate-100">
                        <div className="flex justify-between pt-1">
                          <span className="text-slate-600">Basic Salary</span>
                          <span className="font-bold text-slate-900">${salary.basic_salary?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="text-slate-600">House Rent Allowance (HRA)</span>
                          <span className="font-bold text-slate-900">${salary.hra?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="text-slate-600">Conveyance Allowance</span>
                          <span className="font-bold text-slate-900">${salary.conveyance_allowance?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="text-slate-600">Special Allowance</span>
                          <span className="font-bold text-slate-900">${salary.special_allowance?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="text-slate-600">Medical Allowance</span>
                          <span className="font-bold text-slate-900">${salary.medical_allowance?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions & Bank */}
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/80">
                      <h4 className="font-bold text-slate-900 text-sm mb-3 text-rose-800">
                        Statutory Deductions & Taxes
                      </h4>
                      <div className="space-y-2.5 divide-y divide-slate-100">
                        <div className="flex justify-between pt-1">
                          <span className="text-slate-600">Provident Fund (PF)</span>
                          <span className="font-bold text-rose-600">-${salary.provident_fund?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="text-slate-600">Professional Tax / TDS</span>
                          <span className="font-bold text-rose-600">-${salary.professional_tax?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="text-slate-600">Health Insurance Premium</span>
                          <span className="font-bold text-rose-600">-${salary.health_insurance?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 font-semibold">
                          <span className="text-slate-700">Bank Disbursal</span>
                          <span className="text-slate-900">{salary.bank_name || 'Direct Deposit'} ({salary.account_number || '****'})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Salary structure not configured yet by HR.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: Documents */}
      {activeTab === 'documents' && (
        <Card>
          <CardHeader
            title="Uploaded Employee Documents"
            subtitle="Identification, contracts, and tax documents"
            action={
              <Button
                variant="primary"
                size="sm"
                icon={UploadCloud}
                onClick={() => setShowDocModal(true)}
              >
                Upload Document
              </Button>
            }
          />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.length === 0 ? (
                <div className="col-span-full p-8 text-center text-xs text-slate-400">
                  No documents uploaded yet.
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:shadow-card transition-all flex items-start gap-3"
                  >
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{doc.doc_type} • {doc.file_size}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                      <a
                        href={doc.file_url || '#'}
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Viewing document: ${doc.title} (${doc.file_name})`);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 mt-2"
                      >
                        <Eye className="w-3 h-3" /> View Document
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Self-Service Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Personal Information"
        subtitle="You can edit your contact, address, avatar, and emergency details."
      >
        {saveError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUpdateSelfService} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={editFormData.avatarUrl}
              onChange={(e) => setEditFormData({ ...editFormData, avatarUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              placeholder="+1 (415) 555-0101"
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Street Address
            </label>
            <input
              type="text"
              value={editFormData.address}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              placeholder="123 Main Street, Apt 4B"
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                City
              </label>
              <input
                type="text"
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                placeholder="San Francisco"
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                State
              </label>
              <input
                type="text"
                value={editFormData.state}
                onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                placeholder="CA"
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Zip Code
              </label>
              <input
                type="text"
                value={editFormData.zipCode}
                onChange={(e) => setEditFormData({ ...editFormData, zipCode: e.target.value })}
                placeholder="94105"
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-800">Emergency Contact</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={editFormData.emergencyContactName}
                onChange={(e) => setEditFormData({ ...editFormData, emergencyContactName: e.target.value })}
                placeholder="Contact Name"
                className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={editFormData.emergencyContactRelation}
                onChange={(e) => setEditFormData({ ...editFormData, emergencyContactRelation: e.target.value })}
                placeholder="Relation (e.g. Spouse)"
                className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <input
              type="text"
              value={editFormData.emergencyContactPhone}
              onChange={(e) => setEditFormData({ ...editFormData, emergencyContactPhone: e.target.value })}
              placeholder="Emergency Phone Number"
              className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Bio / Summary
            </label>
            <textarea
              rows={2}
              value={editFormData.bio}
              onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
              placeholder="Tell your team about yourself..."
              className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

      {/* Upload Document Modal */}
      <Modal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        title="Upload Document"
        subtitle="Attach a certified document to your employee file."
      >
        <form onSubmit={handleUploadDoc} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Document Title
            </label>
            <input
              type="text"
              value={docFormData.title}
              onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
              placeholder="e.g. State Driver License or Degree Certificate"
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Document Category
            </label>
            <select
              value={docFormData.docType}
              onChange={(e) => setDocFormData({ ...docFormData, docType: e.target.value })}
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ID Proof">Government ID Proof</option>
              <option value="Offer Letter">Offer Letter / Contract</option>
              <option value="Tax Form">Tax / W-4 Form</option>
              <option value="Certificate">Degree / Professional Certificate</option>
              <option value="Medical">Medical / Fitness Certificate</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
