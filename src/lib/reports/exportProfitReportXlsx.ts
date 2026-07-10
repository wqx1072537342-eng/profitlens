import {
  REPORT_DISCLAIMER,
  escapeSpreadsheetFormula,
  type ProfitReportExportRow,
} from "./exportProfitReportCsv";
import type { Json } from "@/lib/supabase/types";

type CellValue = string | number | null | undefined;
type Worksheet = {
  name: string;
  rows: readonly (readonly CellValue[])[];
};

interface WarningExportRow {
  code: string;
  message: string;
  filePath: string;
  field: string;
  row: string;
}

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function jsonToStringArray(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function jsonToWarnings(value: Json): WarningExportRow[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, Json | undefined> => {
      return Boolean(item) && typeof item === "object" && !Array.isArray(item);
    })
    .map((item) => ({
      code: typeof item.code === "string" ? item.code : "WARNING",
      field: typeof item.field === "string" ? item.field : "",
      filePath: typeof item.filePath === "string" ? item.filePath : "",
      message: typeof item.message === "string" ? item.message : "Review this CSV row.",
      row: typeof item.row === "number" ? String(item.row) : "",
    }));
}

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function sheetNameEscape(value: string): string {
  return xmlEscape(value.slice(0, 31));
}

function columnName(index: number): string {
  let value = index;
  let name = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }

  return name;
}

function cellXml(value: CellValue, rowIndex: number, columnIndex: number): string {
  const ref = `${columnName(columnIndex)}${rowIndex}`;

  if (typeof value === "number") {
    return `<c r="${ref}"><v>${Number.isFinite(value) ? value : 0}</v></c>`;
  }

  const stringValue = escapeSpreadsheetFormula(value ?? "");
  return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(stringValue)}</t></is></c>`;
}

function worksheetXml(rows: Worksheet["rows"]): string {
  const rowXml = rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cells = row
        .map((cell, cellIndex) => cellXml(cell, rowNumber, cellIndex + 1))
        .join("");
      return `<row r="${rowNumber}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowXml}</sheetData></worksheet>`;
}

function workbookXml(sheets: readonly Worksheet[]): string {
  const sheetXml = sheets
    .map(
      (sheet, index) =>
        `<sheet name="${sheetNameEscape(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheetXml}</sheets></workbook>`;
}

function workbookRelsXml(sheets: readonly Worksheet[]): string {
  const sheetRelationships = sheets
    .map(
      (_sheet, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
    )
    .join("");
  const stylesRelationship = `<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetRelationships}${stylesRelationship}</Relationships>`;
}

function contentTypesXml(sheets: readonly Worksheet[]): string {
  const worksheetOverrides = sheets
    .map(
      (_sheet, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${worksheetOverrides}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;
}

function rootRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
}

function stylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`;
}

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function uint16(value: number): Buffer {
  const buffer = Buffer.allocUnsafe(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function uint32(value: number): Buffer {
  const buffer = Buffer.allocUnsafe(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function createZip(files: readonly { path: string; content: string | Buffer }[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.path, "utf8");
    const content =
      typeof file.content === "string" ? Buffer.from(file.content, "utf8") : file.content;
    const checksum = crc32(content);
    const localHeader = Buffer.concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(checksum),
      uint32(content.length),
      uint32(content.length),
      uint16(name.length),
      uint16(0),
      name,
    ]);

    localParts.push(localHeader, content);
    centralParts.push(
      Buffer.concat([
        uint32(0x02014b50),
        uint16(20),
        uint16(20),
        uint16(0),
        uint16(0),
        uint16(0),
        uint16(0),
        uint32(checksum),
        uint32(content.length),
        uint32(content.length),
        uint16(name.length),
        uint16(0),
        uint16(0),
        uint16(0),
        uint16(0),
        uint32(0),
        uint32(offset),
        name,
      ]),
    );
    offset += localHeader.length + content.length;
  }

  const local = Buffer.concat(localParts);
  const central = Buffer.concat(centralParts);
  const end = Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(files.length),
    uint16(files.length),
    uint32(central.length),
    uint32(local.length),
    uint16(0),
  ]);

  return Buffer.concat([local, central, end]);
}

export function buildProfitReportWorksheets(report: ProfitReportExportRow): Worksheet[] {
  const includedFileTypes = jsonToStringArray(report.included_file_types_json);
  const missingFileTypes = jsonToStringArray(report.missing_file_types_json);
  const warnings = jsonToWarnings(report.warnings_json);
  const cogsStatus =
    report.net_profit_before_cogs === report.net_profit_after_cogs
      ? "COGS not detected or not provided"
      : "COGS included";

  return [
    {
      name: "Summary",
      rows: [
        ["FlowSync AI Etsy Profit Report"],
        ["Generated At", new Date().toISOString()],
        ["Report ID", report.id],
        ["Report Created At", report.created_at],
        ["Currency", report.currency],
        [],
        ["Metric", "Amount", "Notes"],
        ["Gross Sales", report.gross_sales, "Orders, shipping income, and seller-funded discounts"],
        ["Refunds", report.refunds, "Refunds, chargebacks, reversals, and Etsy case refunds"],
        ["Etsy Fees", report.fees, "Platform fees, credits, and chargeback fees"],
        ["Ads", report.ads, "Etsy Ads and Offsite Ads"],
        ["Shipping Labels", report.shipping, "Shipping label costs and refunds"],
        [
          "Sales Tax / VAT / GST",
          report.tax_collected,
          "Marketplace-collected tax shown separately and excluded from profit",
        ],
        ["Net Profit Before COGS", report.net_profit_before_cogs, "Profit before product costs"],
        ["Net Profit After COGS", report.net_profit_after_cogs, cogsStatus],
      ],
    },
    {
      name: "File Coverage",
      rows: [
        ["Completeness", report.completeness_status],
        ["Included CSV Types", includedFileTypes.join(", ") || "None"],
        ["Missing CSV Types", missingFileTypes.join(", ") || "None"],
        ["COGS Status", cogsStatus],
      ],
    },
    {
      name: "Warnings",
      rows: [
        ["Code", "Message", "File", "Field", "Row"],
        ...(warnings.length > 0
          ? warnings.map((warning) => [
              warning.code,
              warning.message,
              warning.filePath,
              warning.field,
              warning.row,
            ])
          : [["No warnings", "", "", "", ""]]),
      ],
    },
    {
      name: "Notes",
      rows: [
        ["Disclaimer"],
        [REPORT_DISCLAIMER],
        [],
        ["Export Format"],
        ["This is a real .xlsx workbook generated by FlowSync AI."],
      ],
    },
  ];
}

export function buildProfitReportXlsx(report: ProfitReportExportRow): Buffer {
  const sheets = buildProfitReportWorksheets(report);
  const files = [
    { path: "[Content_Types].xml", content: contentTypesXml(sheets) },
    { path: "_rels/.rels", content: rootRelsXml() },
    { path: "xl/workbook.xml", content: workbookXml(sheets) },
    { path: "xl/_rels/workbook.xml.rels", content: workbookRelsXml(sheets) },
    { path: "xl/styles.xml", content: stylesXml() },
    ...sheets.map((sheet, index) => ({
      path: `xl/worksheets/sheet${index + 1}.xml`,
      content: worksheetXml(sheet.rows),
    })),
  ];

  return createZip(files);
}
