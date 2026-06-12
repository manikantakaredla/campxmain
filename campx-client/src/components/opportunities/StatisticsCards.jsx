import React from 'react';
import { TrendingUp, DollarSign, Users, Briefcase, BarChart2 } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-xl font-bold text-gray-900">{value}</h3>
          {value !== 'N/A' && title !== 'Total Placements' && title !== 'Top Recruiters' && (
            <span className="text-xs text-gray-500">LPA</span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-2 truncate max-w-[180px]">{subtitle}</p>
        )}
      </div>
      <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const StatisticsCards = ({ stats }) => {
  if (!stats) return null;

  // Format number with commas for better readability
  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  // Get top 2 recruiters names
  const getTopRecruitersText = () => {
    if (!stats.topRecruiters || stats.topRecruiters.length === 0) return '';
    return stats.topRecruiters.slice(0, 2).map(c => c._id).join(', ');
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      <StatCard 
        title="Highest Package" 
        value={stats.highestPackage ? `${stats.highestPackage}` : 'N/A'}
        icon={TrendingUp}
        colorClass="bg-green-50 text-green-600"
        subtitle={stats.highestPackage ? "Top performer" : undefined}
      />
      <StatCard 
        title="Average Package" 
        value={stats.averagePackage ? `${stats.averagePackage}` : 'N/A'}
        icon={DollarSign}
        colorClass="bg-blue-50 text-blue-600"
      />
      <StatCard 
        title="Median Package" 
        value={stats.medianPackage ? `${stats.medianPackage}` : 'N/A'}
        icon={BarChart2}
        colorClass="bg-indigo-50 text-indigo-600"
      />
      <StatCard 
        title="Total Placements" 
        value={formatNumber(stats.totalPlacements || 0)}
        icon={Users}
        colorClass="bg-purple-50 text-purple-600"
        subtitle={stats.totalPlacements ? "Students placed" : undefined}
      />
      <StatCard 
        title="Recruiting Companies" 
        value={formatNumber(stats.companiesCount || 0)}
        icon={Briefcase}
        colorClass="bg-orange-50 text-orange-600"
        subtitle={getTopRecruitersText()}
      />
    </div>
  );
};

export default StatisticsCards;