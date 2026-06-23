const validateStudentRow = (row, index) => {
  const errors = [];
  
  if (!row.name || row.name.trim() === "") {
    errors.push({ row: index + 2, identifier: row.roll, message: "Name is required" });
  }
  
  if (!row.roll || row.roll.trim() === "") {
    errors.push({ row: index + 2, identifier: row.name, message: "Roll number is required" });
  } else if (!/^[A-Za-z0-9]+$/.test(row.roll)) {
    errors.push({ row: index + 2, identifier: row.roll, message: "Invalid roll number format" });
  }
  


  if (!row.section || row.section.trim() === "") {
    errors.push({ row: index + 2, identifier: row.roll, message: "Section is required" });
  }
  
  if (!row.email || row.email.trim() === "") {
    errors.push({ row: index + 2, identifier: row.roll, message: "Email is required" });
  } else if (!row.email.endsWith("@adityauniversity.in")) {
    errors.push({ row: index + 2, identifier: row.roll, message: "Email must end with @adityauniversity.in" });
  }
  
  if (!row.course || row.course.trim() === "") {
    errors.push({ row: index + 2, identifier: row.roll, message: "Course is required" });
  }
  
  if (!row.ph_no || row.ph_no.trim() === "") {
    errors.push({ row: index + 2, identifier: row.roll, message: "Phone number is required" });
  } else if (!/^[0-9]{10}$/.test(row.ph_no)) {
    errors.push({ row: index + 2, identifier: row.roll, message: "Phone number must be 10 digits" });
  }
  
  return errors;
};

const validateFacultyRow = (row, index) => {
  const errors = [];
  
  if (!row.empid || row.empid.trim() === "") {
    errors.push({ row: index + 2, identifier: row.name, message: "Employee ID is required" });
  }
  
  if (!row.name || row.name.trim() === "") {
    errors.push({ row: index + 2, identifier: row.empid, message: "Name is required" });
  }

  if (!row.email || row.email.trim() === "") {
    errors.push({ row: index + 2, identifier: row.empid, message: "Email is required" });
  } else if (!row.email.endsWith("@adityauniversity.in")) {
    errors.push({ row: index + 2, identifier: row.empid, message: "Email must end with @adityauniversity.in" });
  }
  
  if (!row.dept || row.dept.trim() === "") {
    errors.push({ row: index + 2, identifier: row.empid, message: "Department is required" });
  }
  
  if (!row.designation || row.designation.trim() === "") {
    errors.push({ row: index + 2, identifier: row.empid, message: "Designation is required" });
  }
  
  if (!row.staff_role || row.staff_role.trim() === "") {
    errors.push({ row: index + 2, identifier: row.empid, message: "Staff role is required" });
  } else {
    const validRoles = ["faculty", "hod", "deputyhod", "dean", "principal"];
    if (!validRoles.includes(row.staff_role.toLowerCase())) {
      errors.push({ row: index + 2, identifier: row.empid, message: `Staff role must be one of: ${validRoles.join(", ")}` });
    }
  }
  
  return errors;
};

module.exports = { validateStudentRow, validateFacultyRow };