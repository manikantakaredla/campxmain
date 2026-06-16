/**
 * Centralized academic hierarchy logic derived from settings.branchConfigs
 */

export const getBranches = (settings) => {
  if (!settings?.branchConfigs) return [];
  return settings.branchConfigs.map(c => c.branch);
};

export const getBranchConfig = (settings, branch) => {
  if (!settings?.branchConfigs || !branch) return null;
  return settings.branchConfigs.find(c => c.branch === branch);
};

export const getYears = () => {
  // Years are strictly fixed to 1-4 per requirements
  return ["1", "2", "3", "4"];
};

export const getSections = (settings, branch, year) => {
  if (!year) return [];
  const config = getBranchConfig(settings, branch);
  if (!config || !config.years) return [];
  return config.years[year.toString()] || [];
};

export const validateAcademicPath = (settings, branch, currentYear, section) => {
  if (!branch || !currentYear || !section) return false;
  
  const config = getBranchConfig(settings, branch);
  if (!config) return false;
  
  if (!getYears().includes(currentYear.toString())) return false;
  
  const sections = config.years[currentYear.toString()] || [];
  return sections.includes(section);
};
