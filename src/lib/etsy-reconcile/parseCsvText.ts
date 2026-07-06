import type { CsvRow, ParseCsvResult } from "./types";

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
}

export function parseCsvText(text: string, filePath = "uploaded.csv"): ParseCsvResult {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      filePath,
      headers: [],
      rows: [],
      warnings: [],
    };
  }

  const headers = splitCsvLine(lines[0]);
  const rows: CsvRow[] = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return headers.reduce<CsvRow>((row, header, index) => {
      row[header] = cells[index] ?? "";
      return row;
    }, {});
  });

  return {
    filePath,
    headers,
    rows,
    warnings: [],
  };
}

