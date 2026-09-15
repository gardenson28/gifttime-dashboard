// public/sample-survey.csv를 실제 엑셀 파일(.xlsx)로 변환해 public/sample-survey.xlsx로 저장한다.
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const Papa = require("papaparse");

const csvPath = path.join(__dirname, "..", "public", "sample-survey.csv");
const xlsxPath = path.join(__dirname, "..", "public", "sample-survey.xlsx");

const csvText = fs.readFileSync(csvPath, "utf-8");
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

const worksheet = XLSX.utils.json_to_sheet(parsed.data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "설문응답");
XLSX.writeFile(workbook, xlsxPath);

console.log(`converted ${parsed.data.length} rows -> ${xlsxPath}`);
