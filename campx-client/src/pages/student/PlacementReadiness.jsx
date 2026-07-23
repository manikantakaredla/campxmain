import React from 'react';
import { Target, CheckCircle2, AlertCircle, AlertTriangle, ArrowRight, BookOpen, Code, FileText, MessageSquare, Briefcase, Award, TrendingUp } from 'lucide-react';

const PlacementReadiness = () => {
  const readinessData = [
    { category: 'Aptitude', weight: '20%', status: 'success', score: '85%', icon: <BookOpen size={20} /> },
    { category: 'DSA', weight: '25%', status: 'warning', score: '70%', icon: <Code size={20} /> },
    { category: 'Core Subjects', weight: '15%', status: 'success', score: '90%', icon: <Target size={20} /> },
    { category: 'Resume', weight: '10%', status: 'success', score: 'Complete', icon: <FileText size={20} /> },
    { category: 'Communication', weight: '10%', status: 'warning', score: 'Average', icon: <MessageSquare size={20} /> },
    { category: 'Projects', weight: '10%', status: 'success', score: 'Good', icon: <Briefcase size={20} /> },
    { category: 'Certifications', weight: '5%', status: 'success', score: 'Complete', icon: <Award size={20} /> },
    { category: 'Coding Profile', weight: '5%', status: 'danger', score: 'Needs Improvement', icon: <TrendingUp size={20} /> },
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return <CheckCircle2 className="text-green-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={24} />;
      case 'danger': return <AlertCircle className="text-red-500" size={24} />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placement Readiness Profile</h1>
          <p className="text-gray-600 mt-1">Track your progress and identify areas for improvement before placement season.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Overall Score</span>
            <span className="text-2xl font-bold text-blue-600">78%</span>
          </div>
          <div className="h-10 w-px bg-gray-200"></div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Eligibility</span>
            <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
              <CheckCircle2 size={16} /> Tier 1 & 2
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Readiness Breakdown</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-sm font-medium text-gray-500">Category</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-500 text-center">Weight</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-500">Action Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {readinessData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="font-medium text-gray-800">{item.category}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-sm font-medium">
                      {item.weight}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={`px-2.5 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
                        {item.score}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 group">
                      View Details 
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Recommended Next Steps</h3>
          <ul className="space-y-3 mt-4">
            <li className="flex gap-3 text-blue-800">
              <div className="mt-1"><ArrowRight size={16} /></div>
              <span>Solve 50 more LeetCode Medium problems to boost your <strong>DSA</strong> score.</span>
            </li>
            <li className="flex gap-3 text-blue-800">
              <div className="mt-1"><ArrowRight size={16} /></div>
              <span>Update your Codeforces/CodeChef handles in your <strong>Coding Profile</strong>.</span>
            </li>
            <li className="flex gap-3 text-blue-800">
              <div className="mt-1"><ArrowRight size={16} /></div>
              <span>Schedule a mock interview to improve your <strong>Communication</strong> rating.</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Mock Interview History</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
              <div>
                <p className="font-semibold text-gray-800">Technical Interview (SDE)</p>
                <p className="text-sm text-gray-500">Conducted on Oct 12, 2023</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">Cleared</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
              <div>
                <p className="font-semibold text-gray-800">HR & Behavioral</p>
                <p className="text-sm text-gray-500">Conducted on Nov 05, 2023</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200">Feedback Given</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementReadiness;
