import React from 'react';
import { Building2, MapPin, DollarSign, Clock, Calendar, CheckCircle2, Bookmark, BookmarkCheck } from 'lucide-react';

const OpportunityCard = ({ 
  opportunity, 
  onSave, 
  onApply, 
  onViewDetails, 
  isSaved, 
  applicationStatus 
}) => {
  const isEligible = true; // In real app, calculate based on student profile

  return (
    <div className="bg-white rounded-3xl md:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 md:p-5 flex-grow">
        <div className="flex justify-between items-start mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            {opportunity.companyLogo ? (
              <img src={opportunity.companyLogo} alt={opportunity.companyName} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border border-gray-100" />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg md:text-xl border border-blue-100">
                {opportunity.companyName.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate max-w-[160px] md:max-w-[200px]">{opportunity.companyName}</h3>
              <p className="text-xs md:text-sm text-gray-500">{opportunity.type}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {opportunity.priority === 'Critical' && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Critical</span>
            )}
            {opportunity.status === 'Closed' ? (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Closed</span>
            ) : (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${isEligible ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {isEligible ? 'Eligible' : 'Not Eligible'}
              </span>
            )}
          </div>
        </div>

        <h4 className="font-bold text-base md:text-lg text-gray-900 mb-3 md:mb-4 line-clamp-2">{opportunity.title}</h4>

        <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <DollarSign size={14} className="text-gray-400" />
            <span>{opportunity.package || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <MapPin size={14} className="text-gray-400" />
            <span>{opportunity.location || 'Remote/TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <Calendar size={14} className="text-gray-400" />
            <span>Event: {opportunity.eventDate ? new Date(opportunity.eventDate).toLocaleDateString() : 'TBA'}</span>
          </div>
          {opportunity.registrationDeadline && (
            <div className="flex items-center gap-2 text-xs md:text-sm text-red-600 font-medium">
              <Clock size={14} />
              <span>Deadline: {new Date(opportunity.registrationDeadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {applicationStatus && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
            <CheckCircle2 size={18} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Status: {applicationStatus}</span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-3 md:p-4 bg-gray-50 flex justify-between gap-2 md:gap-3">
        <button 
          onClick={() => onViewDetails(opportunity)}
          className="flex-1 py-1.5 md:py-2 px-2 md:px-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm"
        >
          View Details
        </button>
        <button 
          onClick={() => onApply(opportunity)}
          disabled={opportunity.status === 'Closed' || applicationStatus}
          className={`flex-1 py-1.5 md:py-2 px-2 md:px-4 font-medium rounded-lg transition-colors text-xs md:text-sm ${
            opportunity.status === 'Closed' || applicationStatus 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
        >
          {applicationStatus ? 'Applied' : 'Apply Now'}
        </button>
        <button 
          onClick={() => onSave(opportunity)}
          className={`p-1.5 md:p-2 rounded-lg border transition-colors ${
            isSaved ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          {isSaved ? <BookmarkCheck size={18} className="md:w-5 md:h-5" /> : <Bookmark size={18} className="md:w-5 md:h-5" />}
        </button>
      </div>
    </div>
  );
};

export default OpportunityCard;
