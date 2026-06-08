/**
 * Calculate academic details from roll number
 */

const branchMapping = {
  CS: "CSE",
  EC: "ECE",
  EE: "EEE",
  ME: "MECH",
  CE: "Civil",
  IT: "IT",
  AI: "ATML",
  DS: "DS",
  CY: "CS",
  BT: "BT",
};

const calculateAcademicInfo = (rollNumber) => {
  try {
    if (!rollNumber || typeof rollNumber !== "string") {
      return getDefaultData(rollNumber);
    }

    const roll = rollNumber.toUpperCase().trim();

    if (roll.length < 10) {
      return getDefaultData(roll);
    }

    const admissionYearCode = parseInt(roll.substring(0, 2), 10);
    const admissionYear = 2000 + admissionYearCode;

    const studentCode = roll.substring(2, 5);
    const branchCode = roll.substring(5, 7);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const branch = branchMapping[branchCode] || "Unknown";

    let studentType = "regular";
    let totalYears = 4;
    let startSemester = 1;

    if (studentCode === "B21") {
      studentType = "lateral";
      totalYears = 3;
      startSemester = 3;
    }

    const batch = `${admissionYear}-${admissionYear + totalYears}`;

    // Academic year starts in July
    let academicYearsPassed;

    if (currentMonth >= 6) {
      // Jul-Dec
      academicYearsPassed = currentYear - admissionYear;
    } else {
      // Jan-Jun
      academicYearsPassed = currentYear - admissionYear - 1;
    }

    if (academicYearsPassed < 0) {
      academicYearsPassed = 0;
    }

    let currentSemester;

    if (studentType === "regular") {
      if (currentMonth >= 6) {
        // Jul-Dec
        currentSemester = (academicYearsPassed * 2) + 1;
      } else {
        // Jan-Jun
        currentSemester = (academicYearsPassed * 2) + 2;
      }
    } else {
      if (currentMonth >= 6) {
        // Jul-Dec
        currentSemester = (academicYearsPassed * 2) + 3;
      } else {
        // Jan-Jun
        currentSemester = (academicYearsPassed * 2) + 4;
      }
    }

    currentSemester = Math.min(8, Math.max(startSemester, currentSemester));

    const currentYearNum = Math.ceil(currentSemester / 2);

    return {
      admissionYear,
      studentType,
      totalYears,
      batch,
      branch,
      currentYear: currentYearNum,
      currentSemester,
      startSemester,
      rollNumber: roll,
    };

  } catch (error) {
    console.error("Academic calculation error:", error);
    return getDefaultData(rollNumber);
  }
};

const getDefaultData = (rollNumber = "") => ({
  admissionYear: null,
  studentType: "regular",
  totalYears: 4,
  batch: null,
  branch: "Unknown",
  currentYear: 1,
  currentSemester: 1,
  startSemester: 1,
  rollNumber,
});

module.exports = calculateAcademicInfo;