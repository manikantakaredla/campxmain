import React, { useState, useEffect } from 'react';
import { getExperiences } from '../../../services/interviewService';
import toast from 'react-hot-toast';
import { MessageSquare, User, Search, Filter } from 'lucide-react';

const InterviewTab = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchCompany, setSearchCompany] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    const fetchExps = async () => {
      try {
        const { data } = await getExperiences({ company: searchCompany, role: searchRole, difficulty });
        setExperiences(data || []);
      } catch (err) {
        toast.error('Failed to load interview experiences');
      } finally {
        setLoading(false);
      }
    };
    fetchExps();
  }, [searchCompany, searchRole, difficulty]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900">Interview Experiences</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Company..." 
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-40 focus:ring-blue-500 focus:border-blue-500"
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Role..." 
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-40 focus:ring-blue-500 focus:border-blue-500"
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <select 
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-36 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">All Diff...</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 whitespace-nowrap text-sm">
            Share Experience
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>
        </div>
      ) : experiences.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-green-50 p-4 rounded-full mb-4">
            <MessageSquare size={48} className="text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Experiences Shared</h3>
          <p className="text-gray-500 max-w-md">Be the first to share your interview experience and help your juniors prepare better!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map(exp => (
            <div key={exp._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {exp.companyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{exp.companyName}</h3>
                    <p className="text-gray-600">{exp.role} • {exp.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  <User size={14} />
                  <span>{exp.isAnonymous ? 'Anonymous Student' : exp.studentName}</span>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 mt-4">
                <div className="mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${exp.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : exp.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    Difficulty: {exp.difficulty || 'Not Specified'}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">Experience Overview</h4>
                <p className="whitespace-pre-wrap">{exp.experience}</p>
                
                {exp.tips && (
                  <>
                    <h4 className="font-semibold text-gray-900 mt-4">Preparation Tips</h4>
                    <p className="whitespace-pre-wrap">{exp.tips}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewTab;
