import React, { useState, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import api from '../../services/api';
import debounce from 'lodash/debounce';

const StudentSearchSelect = ({ value, onChange, placeholder = "Search students...", isMulti = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchStudents = async (query) => {
    if (!query || query.length < 2) {
      setStudents([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/announcements/search-students?q=${query}`);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(searchStudents, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm]);

  const handleSelect = (student) => {
    const exists = value.some(v => v.userId === student._id);
    if (!exists) {
      onChange([...value, {
        userId: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber
      }]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemove = (userId) => {
    onChange(value.filter(v => v.userId !== userId));
  };

  return (
    <div className="relative">
      <div className="border border-gray-300 rounded-lg p-2 min-h-[42px] bg-white">
        <div className="flex flex-wrap gap-1">
          {value.map(recipient => (
            <span key={recipient.userId} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
              {recipient.name} ({recipient.rollNumber})
              <button type="button" onClick={() => handleRemove(recipient.userId)} className="hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            className="flex-1 outline-none text-sm min-w-[150px]"
            placeholder={value.length === 0 ? placeholder : ""}
          />
        </div>
      </div>
      
      {showDropdown && (searchTerm.length >= 2 || students.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">Loading...</div>
          ) : students.length === 0 ? (
            <div className="p-3 text-center text-gray-500">No students found</div>
          ) : (
            students.map(student => (
              <div
                key={student._id}
                onClick={() => handleSelect(student)}
                className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={14} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.rollNumber} • {student.branch} • {student.currentYear} Year</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentSearchSelect;