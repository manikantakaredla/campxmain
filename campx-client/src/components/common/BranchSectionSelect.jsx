import React from 'react';

const branches = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AI&DS", "CSBS"];
const sections = ["A", "B", "C", "D"];

const BranchSectionSelect = ({ value, onChange }) => {
  const handleBranchToggle = (branch) => {
    const exists = value.find(v => v.branch === branch);
    if (exists) {
      onChange(value.filter(v => v.branch !== branch));
    } else {
      onChange([...value, { branch, sections: [] }]);
    }
  };

  const handleSectionToggle = (branch, section) => {
    const branchIndex = value.findIndex(v => v.branch === branch);
    if (branchIndex === -1) return;
    
    const updated = [...value];
    const currentSections = updated[branchIndex].sections;
    
    if (currentSections.includes(section)) {
      updated[branchIndex].sections = currentSections.filter(s => s !== section);
    } else {
      updated[branchIndex].sections = [...currentSections, section];
    }
    
    if (updated[branchIndex].sections.length === 0) {
      onChange(value.filter(v => v.branch !== branch));
    } else {
      onChange(updated);
    }
  };

  const handleSelectAllSections = (branch) => {
    const branchIndex = value.findIndex(v => v.branch === branch);
    if (branchIndex === -1) {
      onChange([...value, { branch, sections: [...sections] }]);
    } else {
      const updated = [...value];
      if (updated[branchIndex].sections.length === sections.length) {
        onChange(value.filter(v => v.branch !== branch));
      } else {
        updated[branchIndex].sections = [...sections];
        onChange(updated);
      }
    }
  };

  return (
    <div className="space-y-3">
      {branches.map(branch => {
        const branchData = value.find(v => v.branch === branch);
        const selectedSections = branchData?.sections || [];
        const isAllSelected = selectedSections.length === sections.length;
        
        return (
          <div key={branch} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!branchData}
                  onChange={() => handleBranchToggle(branch)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="font-medium text-gray-800">{branch}</span>
              </label>
              {branchData && selectedSections.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleSelectAllSections(branch)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {isAllSelected ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>
            
            {branchData && (
              <div className="flex flex-wrap gap-3 ml-6">
                {sections.map(section => (
                  <label key={section} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section)}
                      onChange={() => handleSectionToggle(branch, section)}
                      className="w-3.5 h-3.5 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Section {section}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BranchSectionSelect;