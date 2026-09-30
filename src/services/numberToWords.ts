/**
 * Vietnamese Number to Words Converter for Military Financial & Payroll Reports
 * Ví dụ: 125430000 -> "Một trăm hai mươi lăm triệu bốn trăm ba mươi nghìn đồng chẵn"
 */

const DIGITS = [
  'không',
  'một',
  'hai',
  'ba',
  'bốn',
  'năm',
  'sáu',
  'bảy',
  'tám',
  'chín',
];

function readTriple(triple: number, showZeroHundred: boolean): string {
  const hundreds = Math.floor(triple / 100);
  const tens = Math.floor((triple % 100) / 10);
  const units = triple % 10;

  let result = '';

  if (hundreds > 0 || showZeroHundred) {
    result += `${DIGITS[hundreds]} trăm `;
  }

  if (tens > 1) {
    result += `${DIGITS[tens]} mươi `;
    if (units === 1) {
      result += 'mốt ';
    } else if (units === 5) {
      result += 'lăm ';
    } else if (units > 0) {
      result += `${DIGITS[units]} `;
    }
  } else if (tens === 1) {
    result += 'mười ';
    if (units === 5) {
      result += 'lăm ';
    } else if (units > 0) {
      result += `${DIGITS[units]} `;
    }
  } else if (tens === 0 && units > 0) {
    if (hundreds > 0 || showZeroHundred) {
      result += `lẻ ${DIGITS[units]} `;
    } else {
      result += `${DIGITS[units]} `;
    }
  }

  return result.trim();
}

export function docTienBangChu(num: number): string {
  if (!num || isNaN(num) || num === 0) {
    return 'Không đồng';
  }

  const rounded = Math.round(Math.abs(num));
  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

  let temp = rounded;
  const groups: number[] = [];

  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  let textResult = '';

  for (let i = groups.length - 1; i >= 0; i--) {
    const val = groups[i];
    if (val > 0) {
      // showZeroHundred when not in the highest order group
      const showZero = i < groups.length - 1;
      const tripleText = readTriple(val, showZero);
      textResult += `${tripleText} ${scales[i]} `;
    }
  }

  textResult = textResult.trim().replace(/\s+/g, ' ');

  if (!textResult) {
    return 'Không đồng';
  }

  // Capitalize first letter
  textResult = textResult.charAt(0).toUpperCase() + textResult.slice(1);

  return `${textResult} đồng chẵn.`;
}
