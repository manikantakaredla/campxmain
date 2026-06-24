const calculateAcademicInfo = require('./utils/academicCalculator');

const users = [
  { role: 'student', isFromData: true, rollNumber: '25B11CS089' }
];

const currentYearQuery = 1;

const filtered = users.filter(u => {
  if (u.role !== 'student') return false;
  if (u.currentYear === currentYearQuery) return true;
  if (u.isFromData && u.rollNumber) {
    const academicInfo = calculateAcademicInfo(u.rollNumber);
    console.log("Academic info for", u.rollNumber, ":", academicInfo);
    return academicInfo.currentYear === currentYearQuery;
  }
  return false;
});

console.log("Filtered count:", filtered.length);
