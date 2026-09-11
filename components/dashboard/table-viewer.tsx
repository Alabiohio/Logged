type PlainObject = Record<string, unknown>;

function isRecord(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cellString(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function normalizeTableData(value: unknown): {
  headers: string[];
  rows: Array<Record<string, string>>;
  available: boolean;
} {
  if (value === undefined || value === null) {
    return { headers: [], rows: [], available: false };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { headers: [], rows: [], available: true };
    }

    if (value.every((item) => Array.isArray(item))) {
      const matrix = value as unknown[][];
      const headers = matrix[0].map((_, index) => `Column ${index + 1}`);
      const rows = matrix.map((row) => {
        return Object.fromEntries(
          row.map((cell, index) => [headers[index], cellString(cell)])
        );
      });
      return { headers, rows, available: true };
    }

    if (value.every((item) => isRecord(item))) {
      const records = value as PlainObject[];
      const headers = Array.from(
        new Set(records.flatMap((item) => Object.keys(item)))
      );
      const rows = records.map((record) => {
        return Object.fromEntries(
          headers.map((header) => [header, cellString(record[header])])
        );
      });
      return { headers, rows, available: true };
    }

    return {
      headers: ["Value"],
      rows: [{ Value: cellString(value) }],
      available: true,
    };
  }

  if (isRecord(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return { headers: [], rows: [], available: true };
    }

    return {
      headers: ["Key", "Value"],
      rows: entries.map(([key, currentValue]) => ({
        Key: key,
        Value: cellString(currentValue),
      })),
      available: true,
    };
  }

  return {
    headers: ["Value"],
    rows: [{ Value: cellString(value) }],
    available: true,
  };
}

export function TableViewer({ data }: { data: unknown }) {
  const { headers, rows, available } = normalizeTableData(data);

  if (!available || headers.length === 0) {
    return null;
  }

  return (
    <div className="overflow-auto rounded-xl border border-border bg-background/50">
      <table className="min-w-full border-separate border-spacing-0 text-left text-xs text-text">
        <thead className="bg-background-tertiary/70 text-text-muted">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="border-b border-border px-3 py-2 font-semibold uppercase tracking-wide"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${headers.join("-")}`} className="align-top even:bg-background/30">
              {headers.map((header) => (
                <td key={`${rowIndex}-${header}`} className="border-b border-border/60 px-3 py-2 align-top font-mono text-[11px] leading-5 text-text-secondary">
                  {row[header] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
