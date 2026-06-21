import React, { useState, useEffect } from 'react';
import { getPlacements } from '../../../services/placementService';
import PlacementDetailsModal from '../../../components/opportunities/PlacementDetailsModal';
import toast from 'react-hot-toast';
import { Award, Search, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const PlacementsTab = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [offerType, setOfferType] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Details Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        setLoading(true);
        const { data, pagination } = await getPlacements({ search, department, year, offerType, sort, page, limit: 10 });
        setPlacements(data || []);
        if (pagination) setTotalPages(pagination.pages || 1);
      } catch (err) {
        toast.error('Failed to load placements');
      } finally {
        setLoading(false);
      }
    };
    fetchPlacements();
  }, [search, department, year, offerType, sort, page]);

  const handleOpenDetails = (record) => {
    setSelectedRecord(record);
    setIsDetailsOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900">Previous Placements</h2>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search company, student, roll, or LinkedIn..."
              className="block w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
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
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
            value={year}
            onChange={(e) => { setYear(e.target.value); setPage(1); }}
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
            value={offerType}
            onChange={(e) => { setOfferType(e.target.value); setPage(1); }}
          >
            <option value="">All Offers</option>
            <option value="Placement">Placement</option>
            <option value="Internship">Internship</option>
            <option value="PPO">PPO</option>
          </select>
          
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="">Sort By...</option>
            <option value="highest">Highest Package</option>
            <option value="lowest">Lowest Package</option>
            <option value="latest">Latest Year</option>
            <option value="oldest">Oldest Year</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-gray-100 animate-pulse rounded-xl border border-gray-200"></div>
      ) : placements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-orange-50 p-4 rounded-full mb-4">
            <Award size={48} className="text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Records Found</h3>
          <p className="text-gray-500 max-w-md">No placement records matched your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Package</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">LinkedIn</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {placements.map(record => (
                  <tr 
                    key={record._id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleOpenDetails(record)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{record.studentName}</span>
                        <span className="text-xs font-mono text-gray-500">{record.rollNumber} • {record.department || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{record.companyName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.role || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                        ₹{record.package} LPA
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.placementYear}</td>
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
                className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 hover:shadow-md transition-shadow cursor-pointer"
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

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
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
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <PlacementDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedRecord(null); }}
        record={selectedRecord}
      />
    </div>
  );
};

export default PlacementsTab;
