// @ts-nocheck
export { PowerBIParser } from './powerbi';
export { TableauParser } from './tableau';
export { ExcelParser } from './excel';
export { PDFParser } from './pdf';
export { QlikParser } from './qlik';
export { SSRSParser } from './ssrs';

export const PARSERS: Record<string, string> = {
  '.pbix': 'PowerBIParser',
  '.pbit': 'PowerBIParser',
  '.twb': 'TableauParser',
  '.twbx': 'TableauParser',
  '.xlsx': 'ExcelParser',
  '.xls': 'ExcelParser',
  '.xlsm': 'ExcelParser',
  '.pdf': 'PDFParser',
  '.qvd': 'QlikParser',
  '.qvs': 'QlikParser',
  '.qvf': 'QlikParser',
  '.rdl': 'SSRSParser',
  '.rdlc': 'SSRSParser',
};


