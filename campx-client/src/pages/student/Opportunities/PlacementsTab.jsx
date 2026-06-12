import React, { useState, useEffect } from 'react';
import { getPlacements } from '../../../services/placementService';
import toast from 'react-hot-toast';
import { Award, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

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
              placeholder="Search company or student..."
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
          </select>
          
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
            value={year}
            onChange={(e) => { setYear(e.target.value); setPage(1); }}
          >
            <option value="">All Years</option>
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {placements.map(record => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{record.studentName}</span>
                      <span className="text-sm text-gray-500">{record.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{record.companyName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      ₹{record.package} LPA
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.placementYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlacementsTab;
