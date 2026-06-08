const csv = require("csv-parser");
const XLSX = require("xlsx");
const stream = require("stream");

const parseCSVBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    bufferStream
      .pipe(csv())
      .on("data", (data) => {
        console.log("CSV row received:", data);
        results.push(data);
      })
      .on("end", () => {
        console.log("CSV parsing complete. Total rows:", results.length);
        resolve(results);
      })
      .on("error", (error) => {
        console.error("CSV parse error:", error);
        reject(error);
      });
  });
};

const parseExcelBuffer = (buffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log("Excel parsing complete. Total rows:", data.length);
    return data;
  } catch (error) {
    console.error("Excel parse error:", error);
    throw new Error("Failed to parse Excel file: " + error.message);
  }
};

const parseFile = async (buffer, mimetype, originalname) => {
  console.log("Parsing file:", { mimetype, originalname });
  
  if (mimetype === "text/csv" || originalname?.endsWith('.csv')) {
    return await parseCSVBuffer(buffer);
  } 
  else if (
    mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimetype === "application/vnd.ms-excel" ||
    originalname?.endsWith('.xlsx') ||
    originalname?.endsWith('.xls')
  ) {
    return parseExcelBuffer(buffer);
  } 
  else {
    throw new Error("Unsupported file format. Please upload CSV or Excel file");
  }
};

module.exports = { parseFile, parseCSVBuffer, parseExcelBuffer };