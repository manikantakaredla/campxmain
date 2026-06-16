/**
 * UI display utilities for academic fields.
 * RULE: Storage Value != Display Value
 * These functions are ONLY for display abbreviations and should never be saved to the database.
 */

export const getBranchDisplayName = (fullBranchName) => {
  if (!fullBranchName) return '';
  const n = fullBranchName.toUpperCase();
  
  if (n.includes('COMPUTER SCIENCE AND ENGINEERING - DATA SCIENCE') || n.includes('DATA SCIENCE')) return 'DS';
  if (n.includes('COMPUTER SCIENCE')) return 'CSE';
  if (n.includes('ELECTRONICS AND COMMUNICATION')) return 'ECE';
  if (n.includes('ELECTRICAL AND ELECTRONICS')) return 'EEE';
  if (n.includes('ARTIFICIAL INTELLIGENCE') || n.includes('AI & ML') || n.includes('AI ML')) return 'AIML';
  if (n.includes('MECHANICAL')) return 'MECH';
  if (n.includes('CIVIL')) return 'CIVIL';
  if (n.includes('AGRICULTURAL')) return 'AGRI';
  if (n.includes('INFORMATION TECHNOLOGY')) return 'IT';
  if (n.includes('MINING')) return 'MINING';
  if (n.includes('PETROLEUM')) return 'PETRO';
  
  return fullBranchName; // fallback if no abbreviation matches
};
