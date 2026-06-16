/**
 * Calculate academic details from roll number
 */

const BRANCH_MAPPING = {
  CS: "B.Tech. - Computer Science and Engineering",
  EC: "B.Tech. - Electronics and Communication Engineering",
  EE: "B.Tech. - Electrical and Electronics Engineering",
  IT: "B.Tech. - Information Technology",
  ME: "B.Tech. - Mechanical Engineering",
  CE: "B.Tech. - Civil Engineering",
  AI: "B.Tech. - Artificial Intelligence & Machine Learning (AI & ML)",
  DS: "B.Tech. - Computer Science and Engineering - Data Science",
  AG: "B.Tech. - Agricultural Engineering",
  MN: "B.Tech. - Mining Engineering",
  PT: "B.Tech. - Petroleum Technology",
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

const calculateAcademicInfo = (rollNumber) => {
  try {
    if (!rollNumber || typeof rollNumber !== "string") {
      return getDefaultData(rollNumber);
    }

    const roll = rollNumber.toUpperCase().trim();

    if (roll.length < 10) {
      return getDefaultData(roll);
    }

    // Example: 25B21CS052

    const admissionYearCode = Number(roll.slice(0, 2));
    const admissionYear = 2000 + admissionYearCode;

    const studentCode = roll.slice(2, 5);
    const branchCode = roll.slice(5, 7);

    const branch =
      BRANCH_MAPPING[branchCode] || "Unknown";

    const isLateral = studentCode === "B21";

    const studentType = isLateral ? "lateral" : "regular";
    const totalYears = isLateral ? 3 : 4;
    const startSemester = isLateral ? 3 : 1;

    const batch = `${admissionYear}-${admissionYear + totalYears}`;

    const currentDate = new Date();
    const currentCalendarYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Academic year starts in July
    let academicYearsPassed;

    if (currentMonth >= 6) {
      academicYearsPassed = currentCalendarYear - admissionYear;
    } else {
      academicYearsPassed = currentCalendarYear - admissionYear - 1;
    }

    academicYearsPassed = Math.max(0, academicYearsPassed);

    let currentSemester;

    if (studentType === "regular") {
      currentSemester =
        academicYearsPassed * 2 + (currentMonth >= 6 ? 1 : 2);
    } else {
      currentSemester =
        academicYearsPassed * 2 + (currentMonth >= 6 ? 3 : 4);
    }

    currentSemester = Math.min(
      8,
      Math.max(startSemester, currentSemester)
    );

    const currentYear = Math.ceil(currentSemester / 2);

    return {
      admissionYear,
      studentType,
      totalYears,
      batch,
      branch, // Full branch name
      currentYear,
      currentSemester,
      startSemester,
      rollNumber: roll,
    };
  } catch (error) {
    console.error("Academic calculation error:", error);
    return getDefaultData(rollNumber);
  }
};

module.exports = calculateAcademicInfo;