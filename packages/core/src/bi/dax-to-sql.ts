// DAX to SQL Converter — transforms Power BI DAX expressions to SQL
// Ported from DMS Replicate src/bi/converters/dax_to_sql.py

export interface ConversionResult {
  original: string;
  converted: string;
  confidence: number; // 0-1
  method: 'pattern' | 'ai';
  warnings: string[];
}

// Common DAX → SQL pattern mappings
const DAX_PATTERNS: Array<{ pattern: RegExp; replacement: string; confidence: number }> = [
  // Aggregations
  { pattern: /\bSUM\s*\((.+?)\)/gi, replacement: 'SUM($1)', confidence: 1.0 },
  { pattern: /\bCOUNT\s*\((.+?)\)/gi, replacement: 'COUNT($1)', confidence: 1.0 },
  { pattern: /\bCOUNTROWS\s*\((.+?)\)/gi, replacement: 'COUNT(*)', confidence: 1.0 },
  { pattern: /\bCOUNTA\s*\((.+?)\)/gi, replacement: 'COUNT($1)', confidence: 1.0 },
  { pattern: /\bAVERAGE\s*\((.+?)\)/gi, replacement: 'AVG($1)', confidence: 1.0 },
  { pattern: /\bAVERAGEX\s*\((.+?),\s*(.+?)\)/gi, replacement: 'AVG($2)', confidence: 0.8 },
  { pattern: /\bMIN\s*\((.+?)\)/gi, replacement: 'MIN($1)', confidence: 1.0 },
  { pattern: /\bMAX\s*\((.+?)\)/gi, replacement: 'MAX($1)', confidence: 1.0 },
  { pattern: /\bDISTINCTCOUNT\s*\((.+?)\)/gi, replacement: 'COUNT(DISTINCT $1)', confidence: 1.0 },

  // Math
  { pattern: /\bDIVIDE\s*\((.+?),\s*(.+?),\s*(.+?)\)/gi, replacement: 'COALESCE(($1) / NULLIF($2, 0), $3)', confidence: 1.0 },
  { pattern: /\bDIVIDE\s*\((.+?),\s*(.+?)\)/gi, replacement: '($1) / NULLIF($2, 0)', confidence: 1.0 },
  { pattern: /\bINT\s*\((.+?)\)/gi, replacement: 'FLOOR($1)', confidence: 1.0 },
  { pattern: /\bROUND\s*\((.+?),\s*(\d+)\)/gi, replacement: 'ROUND($1, $2)', confidence: 1.0 },
  { pattern: /\bABS\s*\((.+?)\)/gi, replacement: 'ABS($1)', confidence: 1.0 },
  { pattern: /\bSQRT\s*\((.+?)\)/gi, replacement: 'SQRT($1)', confidence: 1.0 },
  { pattern: /\bPOWER\s*\((.+?),\s*(.+?)\)/gi, replacement: 'POWER($1, $2)', confidence: 1.0 },
  { pattern: /\bMOD\s*\((.+?),\s*(.+?)\)/gi, replacement: '($1) % ($2)', confidence: 1.0 },

  // Logic
  { pattern: /\bIF\s*\((.+?),\s*(.+?),\s*(.+?)\)/gi, replacement: 'CASE WHEN $1 THEN $2 ELSE $3 END', confidence: 1.0 },
  { pattern: /\bSWITCH\s*\((.+?),\s*(.+?),\s*(.+?),\s*(.+?)\)/gi, replacement: 'CASE $1 WHEN $2 THEN $3 ELSE $4 END', confidence: 0.9 },

  // Text
  { pattern: /\bCONCATENATE\s*\((.+?),\s*(.+?)\)/gi, replacement: '($1 || $2)', confidence: 1.0 },
  { pattern: /\bLEN\s*\((.+?)\)/gi, replacement: 'LENGTH($1)', confidence: 1.0 },
  { pattern: /\bLEFT\s*\((.+?),\s*(.+?)\)/gi, replacement: 'SUBSTRING($1, 1, $2)', confidence: 1.0 },
  { pattern: /\bRIGHT\s*\((.+?),\s*(.+?)\)/gi, replacement: 'SUBSTRING($1, LENGTH($1) - $2 + 1, $2)', confidence: 1.0 },
  { pattern: /\bMID\s*\((.+?),\s*(.+?),\s*(.+?)\)/gi, replacement: 'SUBSTRING($1, $2, $3)', confidence: 1.0 },
  { pattern: /\bUPPER\s*\((.+?)\)/gi, replacement: 'UPPER($1)', confidence: 1.0 },
  { pattern: /\bLOWER\s*\((.+?)\)/gi, replacement: 'LOWER($1)', confidence: 1.0 },
  { pattern: /\bTRIM\s*\((.+?)\)/gi, replacement: 'TRIM($1)', confidence: 1.0 },
  { pattern: /\bSUBSTITUTE\s*\((.+?),\s*(.+?),\s*(.+?)\)/gi, replacement: 'REPLACE($1, $2, $3)', confidence: 0.9 },

  // Date
  { pattern: /\bNOW\s*\(\)/gi, replacement: 'CURRENT_TIMESTAMP', confidence: 1.0 },
  { pattern: /\bTODAY\s*\(\)/gi, replacement: 'CURRENT_DATE', confidence: 1.0 },
  { pattern: /\bYEAR\s*\((.+?)\)/gi, replacement: 'EXTRACT(YEAR FROM $1)', confidence: 1.0 },
  { pattern: /\bMONTH\s*\((.+?)\)/gi, replacement: 'EXTRACT(MONTH FROM $1)', confidence: 1.0 },
  { pattern: /\bDAY\s*\((.+?)\)/gi, replacement: 'EXTRACT(DAY FROM $1)', confidence: 1.0 },
  { pattern: /\bHOUR\s*\((.+?)\)/gi, replacement: 'EXTRACT(HOUR FROM $1)', confidence: 1.0 },
  { pattern: /\bDATE\s*\((.+?),\s*(.+?),\s*(.+?)\)/gi, replacement: 'MAKE_DATE($1, $2, $3)', confidence: 0.9 },
  { pattern: /\bDATEDIFF\s*\((.+?),\s*(.+?),\s*(.+?)\)/gi, replacement: 'DATEDIFF($1, $2, $3)', confidence: 0.8 },

  // Table references
  { pattern: /\bRELATED\s*\((.+?)\)/gi, replacement: '$1', confidence: 0.7 },
  { pattern: /\bRELATEDTABLE\s*\((.+?)\)/gi, replacement: '(SELECT * FROM $1)', confidence: 0.5 },
];

export function convertDaxToSql(dax: string): ConversionResult {
  const warnings: string[] = [];
  let converted = dax;
  let minConfidence = 1.0;

  // Apply pattern-based conversions
  for (const { pattern, replacement, confidence } of DAX_PATTERNS) {
    if (pattern.test(converted)) {
      converted = converted.replace(pattern, replacement);
      minConfidence = Math.min(minConfidence, confidence);
      pattern.lastIndex = 0; // Reset regex
    }
  }

  // Detect unconverted DAX functions
  const daxFunctions = converted.match(/\b[A-Z]+\s*\(/g) || [];
  const knownSql = ['SUM', 'COUNT', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'FLOOR', 'ROUND', 'ABS', 'SQRT', 'POWER', 'EXTRACT', 'MAKE_DATE', 'DATEDIFF', 'LENGTH', 'SUBSTRING', 'UPPER', 'LOWER', 'TRIM', 'REPLACE', 'CURRENT_TIMESTAMP', 'CURRENT_DATE'];

  for (const fn of daxFunctions) {
    const name = fn.replace(/\s*\(/, '').toUpperCase();
    if (!knownSql.includes(name)) {
      warnings.push(`Unconverted DAX function: ${name}`);
      minConfidence = Math.min(minConfidence, 0.3);
    }
  }

  // Check for CALCULATE/FILTER (complex, needs AI)
  if (/\bCALCULATE\s*\(/i.test(dax) || /\bFILTER\s*\(/i.test(dax)) {
    warnings.push('CALCULATE/FILTER detected — requires AI-assisted conversion');
    minConfidence = Math.min(minConfidence, 0.5);
  }

  return {
    original: dax,
    converted,
    confidence: minConfidence,
    method: minConfidence >= 0.7 ? 'pattern' : 'ai',
    warnings,
  };
}
