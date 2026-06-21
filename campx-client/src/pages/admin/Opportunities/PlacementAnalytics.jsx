import React, { useState, useEffect } from 'react';
import { getPlacementStatistics, getSalaryTrends, getPlacements } from '../../../services/placementService';
import StatisticsCards from '../../../components/opportunities/StatisticsCards';
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  Building2, 
  Download, 
  PieChart,
  Users,
  Award,
  Loader2
} from 'lucide-react';

const PlacementAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const toastId = toast.loading('Preparing report export...');
      const res = await getPlacements({ limit: 10000 });
      const records = res.data || [];
      
      if (records.length === 0) {
        toast.dismiss(toastId);
        toast.error('No placement records to export');
        setExporting(false);
        return;
      }
      
      // Headers matching user requirements
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
      link.setAttribute("download", `campx_placements_report_${new Date().getFullYear()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.dismiss(toastId);
      toast.success('Report exported successfully!');
    } catch (err) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, trendsRes] = await Promise.all([
          getPlacementStatistics(),
          getSalaryTrends()
        ]);
        setStats({ ...statsRes.data, salaryTrends: trendsRes.data });
      } catch (err) {
        toast.error('Failed to load placement statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-5">
          <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-50 animate-pulse rounded-xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="h-72 bg-gray-100 animate-pulse rounded-xl"></div>
            <div className="h-72 bg-gray-100 animate-pulse rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
        <PieChart className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-1">No Data Available</h3>
      <p className="text-sm text-gray-500">Placement statistics will appear here once available.</p>
    </div>
  );

  const maxRecruiterCount = Math.max(...(stats.topRecruiters?.map(r => r.count) || [1]));
  const maxTrendCount = Math.max(...(stats.salaryTrends?.map(t => t.averagePackage) || [1]));
  const maxDeptCount = Math.max(...(stats.departmentWise?.map(d => d.count) || [1]));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Placement Analytics</h1>
              <p className="text-sm text-gray-500">Track and analyze campus placement performance</p>
            </div>
            <button 
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-55"
            >
              {exporting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6">
          <StatisticsCards stats={{
            highestPackage: stats.highestPackage,
            averagePackage: stats.averagePackage,
            medianPackage: stats.medianPackage,
            totalPlacements: stats.totalPlacements,
            companiesCount: stats.companiesCount,
            topRecruiters: stats.topRecruiters
          }} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Top Recruiters Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <Building2 size={16} className="text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Top Recruiters</h3>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {stats.topRecruiters?.length || 0} companies
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {stats.topRecruiters?.map((recruiter, idx) => {
                  const percentage = (recruiter.count / maxRecruiterCount) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-gray-700 truncate flex-1">
                          {recruiter._id || 'Unknown Company'}
                        </span>
                        <span className="text-xs font-semibold text-gray-900 ml-2">
                          {recruiter.count}
                        </span>
                      </div>
                      <div className="relative w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-700" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Salary Trends Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-50 rounded-lg">
                    <TrendingUp size={16} className="text-green-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Salary Trends</h3>
                </div>
                <span className="text-xs text-gray-500">Yearly average</span>
              </div>
            </div>
            <div className="p-4">
              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end gap-2 justify-between pb-6">
                  {stats.salaryTrends?.map((trend, idx) => {
                    const year = 2024 - (stats.salaryTrends.length - 1 - idx);
                    const percentage = (trend.averagePackage / maxTrendCount) * 100;
                    const heightPercentage = Math.max(percentage, 8);
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group">
                        <div className="relative w-full flex justify-center mb-1">
                          <div className="absolute -top-7 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            ₹{trend.averagePackage}L
                          </div>
                        </div>
                        <div 
                          className="w-full bg-green-500 rounded group-hover:bg-green-600 transition-all cursor-pointer"
                          style={{ 
                            height: `${heightPercentage}%`,
                            minHeight: '28px'
                          }}
                        />
                        <span className="text-xs font-medium text-gray-600 mt-2">{year}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Department Wise Placement Card */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <PieChart size={16} className="text-purple-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Department-wise Placements</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-gray-400" />
                  <span className="text-xs text-gray-500">Student distribution</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(stats.departmentWise || []).map((dept, idx) => {
                  const percentage = (dept.count / maxDeptCount) * 100;
                  const totalPercentage = stats.totalPlacements ? 
                    Math.round((dept.count / stats.totalPlacements) * 100) : 0;
                  
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-700">{dept._id || 'Unknown'}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-gray-900">{dept.count}</span>
                          <span className="text-xs text-gray-400">({totalPercentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all duration-700" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Summary Section */}
        <div className="mt-5 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <Award size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-blue-900 mb-0.5">Quick Insights</h4>
              <p className="text-xs text-blue-700">
                Avg: <span className="font-semibold">₹{stats.averagePackage}L</span> • 
                Highest: <span className="font-semibold">₹{stats.highestPackage}L</span> • 
                Total: <span className="font-semibold">{stats.totalPlacements}</span> students
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlacementAnalytics;