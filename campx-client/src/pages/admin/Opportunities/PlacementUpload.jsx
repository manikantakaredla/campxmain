import React, { useState, useEffect, useRef } from 'react';
import { 
  uploadPlacements, 
  downloadTemplate, 
  getPlacements, 
  deletePlacement 
} from '../../../services/placementService';
import UploadSummary from '../../../components/opportunities/UploadSummary';
import PlacementFormModal from '../../../components/opportunities/PlacementFormModal';
import PlacementDetailsModal from '../../../components/opportunities/PlacementDetailsModal';
import toast from 'react-hot-toast';
import { 
  UploadCloud, 
  FileDown, 
  FileSpreadsheet, 
  Loader2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  GraduationCap,
  Download
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const PlacementUpload = () => {
  // Tabs
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'upload'

  // Uploader State
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState(null);
  const fileInputRef = useRef(null);

  // Placements List State
  const [placements, setPlacements] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [offerType, setOfferType] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const toastId = toast.loading('Preparing CSV export...');
      const res = await getPlacements({ limit: 10000 });
      const records = res.data || [];
      
      if (records.length === 0) {
        toast.dismiss(toastId);
        toast.error('No placement records to export');
        setExporting(false);
        return;
      }
      
      // Headers
      const headers = [
        'Student Name',
        'Roll Number',
        'Company',
        'Package',
        'Job Role',
        'Placement Date',
        'LinkedIn URL',
        'Offer Type',
        'Offer Status',
        'Email',
        'Mobile Number',
        'Gender',
        'Department',
        'Batch',
        'College'
      ];
      
      const rows = records.map(r => [
        `"${(r.studentName || '').replace(/"/g, '""')}"`,
        `"${(r.rollNumber || '').replace(/"/g, '""')}"`,
        `"${(r.companyName || '').replace(/"/g, '""')}"`,
        r.package,
        `"${(r.role || '').replace(/"/g, '""')}"`,
        r.offerDate ? new Date(r.offerDate).toISOString().split('T')[0] : 'N/A',
        `"${(r.linkedinUrl || '').replace(/"/g, '""')}"`,
        `"${(r.offerType || '').replace(/"/g, '""')}"`,
        `"${(r.offerStatus || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${(r.mobileNumber || '').replace(/"/g, '""')}"`,
        `"${(r.gender || '').replace(/"/g, '""')}"`,
        `"${(r.department || '').replace(/"/g, '""')}"`,
        `"${(r.batch || '').replace(/"/g, '""')}"`,
        `"${(r.college || '').replace(/"/g, '""')}"`
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `campx_placements_export_${new Date().getFullYear()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.dismiss(toastId);
      toast.success('Placements data exported successfully!');
    } catch (err) {
      toast.error('Failed to export placements data');
    } finally {
      setExporting(false);
    }
  };

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Fetch Placements
  const fetchPlacements = async () => {
    try {
      setLoadingList(true);
      const res = await getPlacements({ 
        search, 
        department, 
        year, 
        offerType, 
        sort, 
        page, 
        limit: 10 
      });
      setPlacements(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages || 1);
        setTotalRecords(res.pagination.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load placement records');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchPlacements();
    }
  }, [activeTab, search, department, year, offerType, sort, page]);

  // Bulk Upload drag-and-drop helpers
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
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error('Please upload a valid CSV or Excel file.');
      return;
    }
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await uploadPlacements(formData);
      setSummary(res.summary || res);
      toast.success('Upload processed successfully!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteRecord = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the placement record for ${name}?`)) return;
    try {
      await deletePlacement(id);
      toast.success('Placement record deleted successfully.');
      fetchPlacements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
    }
  };

  const handleOpenEdit = (record, e) => {
    e.stopPropagation();
    setSelectedRecord(record);
    setIsFormOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedRecord(null);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (record) => {
    setSelectedRecord(record);
    setIsDetailsOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Placement Records</h1>
          <p className="text-gray-600">Manage, upload, and view student placements and internships.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'list' && (
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 size={18} className="animate-spin text-gray-500" />
                ) : (
                  <Download size={18} className="text-gray-500" />
                )}
                <span>Export Report</span>
              </button>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm"
              >
                <Plus size={18} />
                <span>Add Placement</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('list')}
          className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 -mb-px ${
            activeTab === 'list'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Manage Placements ({totalRecords})
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 -mb-px ${
            activeTab === 'upload'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Bulk Upload Excel / CSV
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'list' ? (
        <div className="space-y-6">
          {/* Advanced Search & Filtering bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col xl:flex-row gap-4 items-stretch xl:items-center">
            
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search name, roll, company, role, LinkedIn URL..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select
                value={department}
                onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>

              <select
                value={year}
                onChange={(e) => { setYear(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>

              <select
                value={offerType}
                onChange={(e) => { setOfferType(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Offer Types</option>
                <option value="Placement">Placement</option>
                <option value="Internship">Internship</option>
                <option value="PPO">PPO</option>
              </select>

              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Sort By...</option>
                <option value="highest">Highest Package</option>
                <option value="lowest">Lowest Package</option>
                <option value="latest">Latest Year</option>
                <option value="oldest">Oldest Year</option>
              </select>
            </div>
          </div>

          {/* Loader */}
          {loadingList ? (
            <div className="h-96 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center animate-pulse">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-sm font-semibold text-gray-500">Loading records...</span>
              </div>
            </div>
          ) : placements.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              <div className="bg-blue-50 p-4 rounded-full mb-4 text-blue-600">
                <GraduationCap size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Placement Records</h3>
              <p className="text-gray-500 max-w-md">No student placement records match your query. Add records manually or upload them in bulk.</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Package</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Year</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">LinkedIn</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {placements.map(record => (
                      <tr 
                        key={record._id} 
                        className="hover:bg-gray-50/75 cursor-pointer transition-colors"
                        onClick={() => handleOpenDetails(record)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">{record.studentName}</span>
                            <span className="text-xs font-mono text-gray-500">{record.rollNumber} • {record.department || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                          {record.companyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.role || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                            ₹{record.package} LPA
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.placementYear}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.linkedinUrl ? (
                            <a
                              href={record.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open LinkedIn Profile"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg px-2.5 py-1 transition-colors"
                            >
                              <FaLinkedin size={14} />
                              <span>Profile</span>
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 italic">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleOpenEdit(record, e)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Record"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record._id, record.studentName)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {placements.map(record => (
                  <div 
                    key={record._id} 
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOpenDetails(record)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{record.studentName}</h4>
                        <p className="text-xs font-mono text-gray-500">{record.rollNumber} • {record.department || 'N/A'}</p>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded">
                        ₹{record.package} LPA
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-600">
                      <div>
                        <span className="block text-[10px] text-gray-400 font-semibold uppercase">Company</span>
                        <span className="font-semibold text-gray-900">{record.companyName}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-semibold uppercase">Job Role</span>
                        <span className="font-semibold text-gray-900">{record.role || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-semibold uppercase">Year</span>
                        <span className="font-medium text-gray-900">{record.placementYear}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-semibold uppercase">Offer Type</span>
                        <span className="font-medium text-gray-900">{record.offerType || 'Placement'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                      <div>
                        {record.linkedinUrl ? (
                          <a
                            href={record.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open LinkedIn Profile"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg px-2 py-1 transition-colors"
                          >
                            <FaLinkedin size={14} />
                            <span>LinkedIn Profile</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No LinkedIn</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleOpenEdit(record, e)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 border border-blue-200 px-2 py-1 bg-white hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record._id, record.studentName)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-red-600 border border-red-200 px-2 py-1 bg-white hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 border border-gray-300 rounded-lg bg-white disabled:opacity-50 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 border border-gray-300 rounded-lg bg-white disabled:opacity-50 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      ) : (
        /* Tab: Bulk Upload */
        <div className="space-y-6">
          {summary ? (
            <UploadSummary summary={summary} onReset={() => setSummary(null)} />
          ) : (
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm animate-in fade-in duration-300">
              
              {/* Guidelines */}
              <div className="flex flex-col md:flex-row items-start justify-between bg-blue-50 border border-blue-100 p-4 md:p-6 rounded-2xl md:rounded-xl mb-8 gap-4 md:gap-0">
                <div>
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                    <FileSpreadsheet size={18} className="text-blue-600" /> Bulk Upload Guidelines
                  </h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Make sure the Excel / CSV file matches the template headers. Required columns: <br className="hidden md:block"/>
                    <span className="font-mono bg-white px-2.5 py-1 rounded-lg text-blue-900 mt-2 inline-block shadow-sm">
                      Student Name, Roll Number, Company, Package, Job Role, Placement Date, LinkedIn URL
                    </span>
                  </p>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="w-full md:w-auto flex justify-center items-center gap-2 bg-white text-blue-700 px-5 py-3 md:py-2 rounded-xl md:rounded-lg border border-blue-200 hover:bg-blue-100 font-medium shadow-sm transition-all"
                >
                  <FileDown size={18} /> Download Sample Template
                </button>
              </div>

              {/* Drag & Drop */}
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-colors cursor-pointer ${
                  isDragging ? 'border-blue-500 bg-blue-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".csv, .xlsx, .xls"
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                      <FileSpreadsheet size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{file.name}</h3>
                    <p className="text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="mt-4 text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Click or drag file here to upload</h3>
                    <p className="text-gray-500 mb-4">Supports .csv, .xls, and .xlsx formats up to 5MB</p>
                    <span className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm pointer-events-none">
                      Select File
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg shadow-sm transition-all ${
                    !file || isUploading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? (
                    <><Loader2 size={20} className="animate-spin" /> Processing file...</>
                  ) : (
                    <><UploadCloud size={20} /> Upload Records</>
                  )}
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Creation/Edit Form Modal */}
      <PlacementFormModal 
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedRecord(null); }}
        record={selectedRecord}
        onRefresh={fetchPlacements}
      />

      {/* Details Modal */}
      <PlacementDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedRecord(null); }}
        record={selectedRecord}
      />
    </div>
  );
};

export default PlacementUpload;
