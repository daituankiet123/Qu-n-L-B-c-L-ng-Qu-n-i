import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
  title?: string;
  scale?: number;
}

export interface MilitaryDocExportOptions {
  fileName?: string;
  mainElementId: string;
  appendixElementId?: string;
  title?: string;
  appendixOrientation?: 'portrait' | 'landscape';
}

/**
 * Robustly converts any modern CSS oklch or color-mix definitions to standard hex/rgb colors,
 * ensuring light backgrounds map to white/light-gray and text stays solid black.
 */
function convertOklchToHex(cssText: string): string {
  // 1. Remove color-mix
  let clean = cssText.replace(/color-mix\([^)]+\)/gi, '#ffffff');

  // 2. Convert oklch with % or decimals: oklch(L C H [ / A ])
  clean = clean.replace(
    /oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/gi,
    (_match, lStr, _cStr, _hStr, aStr) => {
      let lightness = 1;
      if (typeof lStr === 'string' && lStr.endsWith('%')) {
        lightness = parseFloat(lStr) / 100;
      } else {
        lightness = parseFloat(lStr);
      }
      if (isNaN(lightness)) lightness = 1;

      if (aStr) {
        const alpha = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
        if (!isNaN(alpha) && alpha < 0.1) {
          return 'transparent';
        }
      }

      // Convert lightness into clean, high-contrast, printable colors
      if (lightness >= 0.85) {
        return '#ffffff';
      } else if (lightness >= 0.70) {
        return '#f1f5f9';
      } else if (lightness >= 0.50) {
        return '#64748b';
      } else if (lightness >= 0.35) {
        return '#334155';
      } else {
        return '#000000';
      }
    }
  );

  // 3. Fallback for any other oklch formats
  clean = clean.replace(/oklch\([^)]+\)/gi, '#ffffff');

  return clean;
}

/**
 * Sanitizes stylesheets in clonedDoc to prevent html2canvas color-parsing crashes,
 * while ensuring light backgrounds stay light/white and text stays dark/black.
 */
function sanitizeClonedStyles(clonedDoc: Document): void {
  try {
    const styleTags = clonedDoc.querySelectorAll('style');
    styleTags.forEach((styleTag) => {
      if (styleTag.textContent) {
        if (
          styleTag.textContent.includes('oklch') ||
          styleTag.textContent.includes('color-mix')
        ) {
          styleTag.textContent = convertOklchToHex(styleTag.textContent);
        }
      }
    });

    // Inject document-print override styles to guarantee clean black-and-white military standard
    const printOverride = clonedDoc.createElement('style');
    printOverride.textContent = `
      * {
        box-shadow: none !important;
        text-shadow: none !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body, html {
        background-color: #ffffff !important;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: 'Times New Roman', Times, serif !important;
      }
      .bg-white {
        background-color: #ffffff !important;
        background: #ffffff !important;
      }
      .bg-amber-50, .bg-amber-50\\/70, .bg-amber-100 {
        background-color: #ffffff !important;
        background: #ffffff !important;
        border-color: #000000 !important;
      }
      /* KHÔNG KHUNG XUNG QUANH PHẦN DUYỆT CỦA THỦ TRƯỞNG */
      .approval-box,
      .approval-section {
        background-color: transparent !important;
        background: transparent !important;
        border: none !important;
        border-width: 0 !important;
        box-shadow: none !important;
        color: #000000 !important;
        padding: 0 !important;
      }
      .approval-box *,
      .approval-section * {
        color: #000000 !important;
      }
      .approval-box input,
      .approval-box textarea,
      .approval-section input,
      .approval-section textarea {
        background-color: transparent !important;
        background: transparent !important;
        border: none !important;
        border-width: 0 !important;
        color: #000000 !important;
      }
      .bg-slate-50 {
        background-color: #f8fafc !important;
        background: #f8fafc !important;
      }
      .bg-slate-100 {
        background-color: #f1f5f9 !important;
        background: #f1f5f9 !important;
      }
      .bg-slate-200, .bg-slate-200\\/90 {
        background-color: #f1f5f9 !important;
        background: #f1f5f9 !important;
      }
      .bg-emerald-50, .bg-emerald-50\\/70, .bg-emerald-100, .bg-emerald-100\\/90 {
        background-color: #ffffff !important;
        background: #ffffff !important;
      }
      .border-slate-800, .border-slate-700, .border-slate-600, .border-slate-500, .border-slate-400, .border-slate-300, .border-slate-200 {
        border-color: #000000 !important;
      }
      .border-emerald-600, .border-emerald-500, .border-emerald-700, .border-amber-400, .border-amber-500 {
        border-color: #000000 !important;
      }
      .text-slate-900, .text-slate-800, .text-slate-700, .text-slate-600, .text-slate-500 {
        color: #000000 !important;
      }
      .text-emerald-950, .text-emerald-900, .text-emerald-800, .text-emerald-700, .text-amber-900 {
        color: #000000 !important;
      }
      /* Ensure table header row is cleanly visible */
      thead {
        display: table-header-group !important;
      }
      thead th {
        background-color: #f1f5f9 !important;
        color: #000000 !important;
        font-weight: bold !important;
      }
    `;
    clonedDoc.head.appendChild(printOverride);
  } catch (e) {
    console.warn('Style sanitization warning:', e);
  }
}

/**
 * Downloads a standalone printable HTML version of the document
 */
export function downloadPrintableHtml(
  contentHtml: string,
  fileName: string = 'Van_Ban_Quan_Doi',
  title: string = 'Văn Bản Quân Đội',
  orientation: 'portrait' | 'landscape' = 'portrait'
): void {
  const cleanName = fileName.replace(/\.pdf$/i, '').replace(/\.html$/i, '');
  const isLandscape = orientation === 'landscape';
  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: ${isLandscape ? 'landscape' : 'portrait'};
      margin: 8mm 10mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      background: #ffffff !important;
      color: #000000 !important;
      font-size: 9.5pt;
      line-height: 1.35;
      padding: 12px;
      margin: 0;
    }
    .appendix-table-section,
    .break-before-page,
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
      margin-top: 20px;
    }
    .approval-box,
    .approval-section {
      background: transparent !important;
      border: none !important;
      border-width: 0 !important;
      box-shadow: none !important;
      color: #000000 !important;
      padding: 0 !important;
    }
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      font-size: 8pt !important;
    }
    tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    thead {
      display: table-header-group !important;
    }
    thead th {
      background-color: #f1f5f9 !important;
      color: #000000 !important;
      font-weight: bold !important;
    }
    th, td {
      border: 1px solid #000000 !important;
      padding: 3px 4px !important;
      color: #000000 !important;
    }
    table.admin-doc-table,
    table.admin-doc-table tr,
    table.admin-doc-table td,
    table.admin-doc-table th {
      border: none !important;
      padding: 0 !important;
      background: transparent !important;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      .print-only { display: block !important; }
    }
  </style>
</head>
<body onload="setTimeout(function(){ window.print(); }, 400)">
  ${contentHtml}
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cleanName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Searches downwards/upwards for a clean pixel row that doesn't slice through text
 */
function findCleanSlicePoint(
  canvas: HTMLCanvasElement,
  startY: number,
  maxHeight: number
): number {
  if (startY + maxHeight >= canvas.height) {
    return canvas.height - startY;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return maxHeight;

  const idealY = Math.floor(startY + maxHeight);
  const minSearchY = Math.max(startY + 80, idealY - 140);

  for (let testY = idealY; testY >= minSearchY; testY -= 2) {
    try {
      const imgData = ctx.getImageData(0, testY, canvas.width, 1);
      const data = imgData.data;
      let isCleanLine = true;

      for (let x = 20; x < canvas.width - 20; x += 30) {
        const idx = x * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const isWhite = r > 240 && g > 240 && b > 240;
        const isBlackBorder = r < 45 && g < 45 && b < 45;
        if (!isWhite && !isBlackBorder) {
          isCleanLine = false;
          break;
        }
      }

      if (isCleanLine) {
        return testY - startY;
      }
    } catch {
      break;
    }
  }

  return maxHeight;
}

/**
 * Renders a specific DOM element into an offscreen high-res Canvas.
 * CRITICAL FIX: Isolates the target element at (0, 0) inside clonedDoc
 * so preceding elements (like doc-totrinh-main) never cause offset drift,
 * ensuring the table header and column names are 100% preserved and never clipped!
 */
async function renderElementToCanvas(
  targetElement: HTMLElement,
  targetRenderWidth: number
): Promise<HTMLCanvasElement> {
  return await html2canvas(targetElement, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: targetRenderWidth + 60,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc) => {
      // 1. Sanitize CSS to avoid oklch crash
      sanitizeClonedStyles(clonedDoc);

      // 2. Hide all non-printable elements
      clonedDoc.querySelectorAll('.no-print').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      // 3. Make print-only elements visible
      clonedDoc.querySelectorAll('.print-only').forEach((el) => {
        (el as HTMLElement).style.display = 'block';
      });

      // 4. Locate cloned target
      let clonedTarget: HTMLElement | null = null;
      if (targetElement.id) {
        clonedTarget = clonedDoc.getElementById(targetElement.id);
      }
      if (!clonedTarget) {
        // Fallback: search by class or tag if id not matched
        clonedTarget = clonedDoc.querySelector(
          `#${targetElement.id}, .${targetElement.className.split(' ')[0]}`
        ) as HTMLElement | null;
      }

      if (clonedTarget) {
        // ISOLATION ROOT: Create a clean dedicated wrapper at (0, 0)
        // This ensures the table header and title are NEVER clipped by scroll/coordinate offsets!
        const wrapper = clonedDoc.createElement('div');
        wrapper.id = 'isolated-render-wrapper';
        wrapper.style.position = 'absolute';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = `${targetRenderWidth}px`;
        wrapper.style.minWidth = `${targetRenderWidth}px`;
        wrapper.style.maxWidth = `${targetRenderWidth}px`;
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.style.boxSizing = 'border-box';
        wrapper.style.padding = targetRenderWidth > 1000 ? '12px 14px' : '18px 22px';
        wrapper.style.margin = '0 auto';
        wrapper.style.overflow = 'visible';
        wrapper.style.zIndex = '99999';

        // Detach clonedTarget from its current position
        if (clonedTarget.parentElement) {
          clonedTarget.parentElement.removeChild(clonedTarget);
        }

        // Hide all original children of clonedDoc.body to avoid interference
        Array.from(clonedDoc.body.children).forEach((child) => {
          (child as HTMLElement).style.display = 'none';
        });

        // Set clonedTarget styles
        clonedTarget.style.display = 'block';
        clonedTarget.style.width = '100%';
        clonedTarget.style.minWidth = '100%';
        clonedTarget.style.maxWidth = 'none';
        clonedTarget.style.margin = '0';
        clonedTarget.style.padding = '0';
        clonedTarget.style.backgroundColor = '#ffffff';
        clonedTarget.style.color = '#000000';
        clonedTarget.style.overflow = 'visible';
        clonedTarget.style.position = 'static';

        wrapper.appendChild(clonedTarget);
        clonedDoc.body.appendChild(wrapper);
        clonedDoc.body.style.backgroundColor = '#ffffff';
        clonedDoc.body.style.margin = '0';
        clonedDoc.body.style.padding = '0';
        clonedDoc.body.style.overflow = 'visible';

        // Unconstrain scroll containers inside target
        clonedTarget
          .querySelectorAll(
            '.overflow-x-auto, .overflow-y-auto, .overflow-hidden, [class*="overflow-"]'
          )
          .forEach((sc) => {
            const scEl = sc as HTMLElement;
            scEl.style.overflow = 'visible';
            scEl.style.maxWidth = 'none';
            scEl.style.width = '100%';
            scEl.style.height = 'auto';
          });

        // Format all tables inside clonedTarget
        clonedTarget.querySelectorAll('table').forEach((t) => {
          const tEl = t as HTMLElement;
          if (!tEl.classList.contains('admin-doc-table')) {
            tEl.style.width = '100%';
            tEl.style.tableLayout = 'auto';
            tEl.style.borderCollapse = 'collapse';
            tEl.style.border = '1.5px solid #000000';
            tEl.style.color = '#000000';
            tEl.style.backgroundColor = '#ffffff';

            // Ensure thead is fully displayed and visible
            const theadEl = tEl.querySelector('thead');
            if (theadEl) {
              (theadEl as HTMLElement).style.display = 'table-header-group';
              (theadEl as HTMLElement).style.visibility = 'visible';
              (theadEl as HTMLElement).style.opacity = '1';
            }

            // Remove border on <tr> to prevent horizontal line miscalculations in html2canvas
            tEl.querySelectorAll('tr').forEach((tr) => {
              const trEl = tr as HTMLElement;
              trEl.style.border = 'none';
              trEl.style.borderTop = 'none';
              trEl.style.borderBottom = 'none';
              trEl.style.borderLeft = 'none';
              trEl.style.borderRight = 'none';
            });

            // Put borders directly on <th> and <td>
            tEl.querySelectorAll('th, td').forEach((cell) => {
              const cEl = cell as HTMLElement;
              cEl.style.border = '1px solid #000000';
              cEl.style.color = '#000000';
              cEl.style.boxSizing = 'border-box';
              cEl.style.verticalAlign = 'middle';
              cEl.style.visibility = 'visible';
              cEl.style.opacity = '1';
            });

            // Ensure Header Row 1 (Groups: THÔNG TIN QUÂN NHÂN, LƯƠNG HIỆN HƯỞNG, etc.) has clean slate background
            tEl.querySelectorAll('thead tr:first-child th').forEach((th) => {
              const thEl = th as HTMLElement;
              thEl.style.backgroundColor = '#e2e8f0';
              thEl.style.color = '#000000';
              thEl.style.fontWeight = 'bold';
            });

            // Ensure Header Row 2 (all 19 column names: TT, HỌ VÀ TÊN, etc.) has clean background and bold text
            tEl.querySelectorAll('thead tr:nth-child(2) th').forEach((th) => {
              const thEl = th as HTMLElement;
              thEl.style.backgroundColor = '#f1f5f9';
              thEl.style.color = '#000000';
              thEl.style.fontWeight = 'bold';
            });

            // Ensure Header Row 3 (Column numbers (1)-(19)) has clean subtle background
            tEl.querySelectorAll('thead tr:nth-child(3) th').forEach((th) => {
              const thEl = th as HTMLElement;
              thEl.style.backgroundColor = '#f8fafc';
              thEl.style.color = '#334155';
            });

            // Ensure category headers have clean background
            tEl.querySelectorAll('tr.bg-slate-100 td, tr.bg-slate-100 th').forEach((c) => {
              const cellEl = c as HTMLElement;
              cellEl.style.backgroundColor = '#f1f5f9';
              cellEl.style.color = '#000000';
            });

            tEl.querySelectorAll('tr.bg-slate-50 td, tr.bg-slate-50 th').forEach((c) => {
              const cellEl = c as HTMLElement;
              cellEl.style.backgroundColor = '#f8fafc';
              cellEl.style.color = '#000000';
            });
          } else {
            // Administrative layout tables (e.g. 2-column header or signature blocks)
            tEl.style.width = '100%';
            tEl.style.borderCollapse = 'collapse';
            tEl.style.border = 'none';
            tEl.style.backgroundColor = 'transparent';
            tEl.querySelectorAll('tr, th, td').forEach((c) => {
              const cEl = c as HTMLElement;
              cEl.style.border = 'none';
              cEl.style.padding = '0';
              cEl.style.backgroundColor = 'transparent';
            });
          }
        });

        // BỎ KHUNG VUÔNG XUNG QUANH PHẦN DUYỆT CHO THỦ TRƯỞNG
        clonedTarget.querySelectorAll('.approval-box, .approval-section').forEach((ab) => {
          const abEl = ab as HTMLElement;
          abEl.style.backgroundColor = 'transparent';
          abEl.style.color = '#000000';
          abEl.style.border = 'none';
          abEl.style.borderWidth = '0';
          abEl.style.outline = 'none';
          abEl.style.boxShadow = 'none';
          abEl.style.padding = '0';
          abEl.querySelectorAll('*').forEach((child) => {
            const childEl = child as HTMLElement;
            childEl.style.color = '#000000';
            if (childEl.tagName !== 'INPUT' && childEl.tagName !== 'TEXTAREA') {
              childEl.style.border = 'none';
              childEl.style.boxShadow = 'none';
            }
          });
        });
      }
    },
  });
}

/**
 * Splits a large canvas into discrete A4 pages along smart boundaries.
 * For tables spanning multiple pages, repeats the header on subsequent pages
 * so the column names are NEVER lost!
 */
function sliceAndAddPages(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  orientation: 'portrait' | 'landscape',
  margin: number,
  contentWidth: number,
  contentHeight: number,
  isContinuation: boolean = false,
  headerHeightPx: number = 0
): void {
  const scaleRatio = contentWidth / canvas.width;
  const pageMaxCanvasPixels = contentHeight / scaleRatio;

  let currentY = 0;
  let pageIdx = 0;

  // If header repetition is enabled, grab the header canvas slice
  let headerCanvas: HTMLCanvasElement | null = null;
  if (headerHeightPx > 0 && headerHeightPx < canvas.height) {
    headerCanvas = document.createElement('canvas');
    headerCanvas.width = canvas.width;
    headerCanvas.height = headerHeightPx;
    const hCtx = headerCanvas.getContext('2d');
    if (hCtx) {
      hCtx.fillStyle = '#ffffff';
      hCtx.fillRect(0, 0, headerCanvas.width, headerCanvas.height);
      hCtx.drawImage(
        canvas,
        0,
        0,
        canvas.width,
        headerHeightPx,
        0,
        0,
        canvas.width,
        headerHeightPx
      );
    }
  }

  while (currentY < canvas.height - 10) {
    // For continuation pages where header is repeated, reduce available height for data
    const effectiveMaxPixels =
      pageIdx > 0 && headerHeightPx > 0
        ? pageMaxCanvasPixels - headerHeightPx
        : pageMaxCanvasPixels;

    const rawSliceHeight = Math.min(effectiveMaxPixels, canvas.height - currentY);
    if (rawSliceHeight <= 0) break;

    // Use smart row cut detection so rows are never split in half
    const sliceHeight =
      rawSliceHeight < effectiveMaxPixels || rawSliceHeight >= canvas.height - currentY
        ? rawSliceHeight
        : findCleanSlicePoint(canvas, currentY, rawSliceHeight);

    const totalPageCanvasHeight =
      pageIdx > 0 && headerCanvas ? headerHeightPx + sliceHeight : sliceHeight;

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = totalPageCanvasHeight;

    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      if (pageIdx > 0 && headerCanvas) {
        // Draw repeated column header at top of continuation page!
        ctx.drawImage(headerCanvas, 0, 0);
        // Draw slice below header
        ctx.drawImage(
          canvas,
          0,
          currentY,
          canvas.width,
          sliceHeight,
          0,
          headerHeightPx,
          canvas.width,
          sliceHeight
        );
      } else {
        // Draw slice from currentY
        ctx.drawImage(
          canvas,
          0,
          currentY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );
      }
    }

    if (pageIdx > 0 || isContinuation) {
      pdf.addPage('a4', orientation);
    }

    const totalHeightMm = totalPageCanvasHeight * scaleRatio;
    pdf.addImage(
      pageCanvas.toDataURL('image/jpeg', 0.98),
      'JPEG',
      margin,
      margin,
      contentWidth,
      totalHeightMm,
      undefined,
      'FAST'
    );

    currentY += sliceHeight;
    pageIdx++;
  }
}

/**
 * Dedicated Military Official Document Exporter:
 * - Page 1 (PORTRAIT A4): Main Administrative Document (Tờ trình, Quyết định, or Bản trích sao + Signatures & Approval block)
 * - Page 2+ (LANDSCAPE A4): 19-Column Appendix Table (Danh sách trích ngang quân nhân)
 *
 * Guarantees:
 * 1. Column names in appendix are 100% visible and never lost or clipped
 * 2. Khung vuông xung quanh phần duyệt thủ trưởng is completely removed
 * 3. Fits single-batch tables onto 1 landscape page cleanly
 */
export async function exportMilitaryDocumentToPdf(
  options: MilitaryDocExportOptions
): Promise<boolean> {
  const {
    fileName = 'Van_Ban_Quan_Doi.pdf',
    mainElementId,
    appendixElementId,
    title = 'Văn Bản Quân Đội',
  } = options;

  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const mainEl = document.getElementById(mainElementId);
  const appendixEl = appendixElementId ? document.getElementById(appendixElementId) : null;

  if (!mainEl) {
    console.error('Military PDF export error: Main element not found:', mainElementId);
    return false;
  }

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // 1. Render Main Document in PORTRAIT A4 (210 x 297 mm)
    // Target width 840px ensures standard A4 portrait proportion
    const mainCanvas = await renderElementToCanvas(mainEl, 840);
    const portMargin = 8;
    const portContentWidth = 210 - portMargin * 2; // 194 mm
    const portContentHeight = 297 - portMargin * 2; // 281 mm
    const portScaleRatio = portContentWidth / mainCanvas.width;
    const mainRenderHeight = mainCanvas.height * portScaleRatio;

    // Auto-fit on Page 1 if within 18% threshold: scale down slightly so it fits 100% on Page 1 without slicing through signatures!
    if (mainRenderHeight <= portContentHeight * 1.18) {
      const fitScale = Math.min(1, portContentHeight / mainRenderHeight);
      const finalWidth = portContentWidth * fitScale;
      const finalHeight = mainRenderHeight * fitScale;
      const finalMarginX = portMargin + (portContentWidth - finalWidth) / 2;
      const finalMarginY = portMargin + (portContentHeight - finalHeight) / 2;

      pdf.addImage(
        mainCanvas.toDataURL('image/jpeg', 0.98),
        'JPEG',
        finalMarginX,
        finalMarginY,
        finalWidth,
        finalHeight,
        undefined,
        'FAST'
      );
    } else {
      sliceAndAddPages(
        pdf,
        mainCanvas,
        'portrait',
        portMargin,
        portContentWidth,
        portContentHeight,
        false
      );
    }

    // 2. Render Appendix Table on Page 2+
    if (appendixEl) {
      const isPortraitAppendix = options.appendixOrientation === 'portrait';
      const appendixRenderWidth = isPortraitAppendix ? 840 : 1260;
      const appendixCanvas = await renderElementToCanvas(appendixEl, appendixRenderWidth);

      if (isPortraitAppendix) {
        // Portrait Appendix Page (210 x 297 mm)
        const appMargin = 8;
        const appContentWidth = 210 - appMargin * 2; // 194 mm
        const appContentHeight = 297 - appMargin * 2; // 281 mm
        const appScaleRatio = appContentWidth / appendixCanvas.width;
        const appendixRenderHeight = appendixCanvas.height * appScaleRatio;

        pdf.addPage('a4', 'portrait');

        if (appendixRenderHeight <= appContentHeight * 1.25) {
          const fitScale = Math.min(1, appContentHeight / appendixRenderHeight);
          const finalWidth = appContentWidth * fitScale;
          const finalHeight = appendixRenderHeight * fitScale;
          const finalMarginX = appMargin + (appContentWidth - finalWidth) / 2;
          const finalMarginY = appMargin + (appContentHeight - finalHeight) / 2;

          pdf.addImage(
            appendixCanvas.toDataURL('image/jpeg', 0.98),
            'JPEG',
            finalMarginX,
            finalMarginY,
            finalWidth,
            finalHeight,
            undefined,
            'FAST'
          );
        } else {
          const headerEstimatedHeightPx = Math.min(220, Math.floor(appendixCanvas.height * 0.18));
          sliceAndAddPages(
            pdf,
            appendixCanvas,
            'portrait',
            appMargin,
            appContentWidth,
            appContentHeight,
            false,
            headerEstimatedHeightPx
          );
        }
      } else {
        // Landscape Appendix Page (297 x 210 mm)
        const landMargin = 8;
        const landContentWidth = 297 - landMargin * 2; // 281 mm
        const landContentHeight = 210 - landMargin * 2; // 194 mm
        const landScaleRatio = landContentWidth / appendixCanvas.width;
        const appendixRenderHeight = appendixCanvas.height * landScaleRatio;

        pdf.addPage('a4', 'landscape');

        // If the rendered appendix fits within page height (or within 25% overflow),
        // scale it proportionally to fit perfectly on ONE pristine landscape page!
        if (appendixRenderHeight <= landContentHeight * 1.25) {
          const fitScale = Math.min(1, landContentHeight / appendixRenderHeight);
          const finalWidth = landContentWidth * fitScale;
          const finalHeight = appendixRenderHeight * fitScale;
          const finalMarginX = landMargin + (landContentWidth - finalWidth) / 2;
          const finalMarginY = landMargin + (landContentHeight - finalHeight) / 2;

          pdf.addImage(
            appendixCanvas.toDataURL('image/jpeg', 0.98),
            'JPEG',
            finalMarginX,
            finalMarginY,
            finalWidth,
            finalHeight,
            undefined,
            'FAST'
          );
        } else {
          // Find approximate header height in canvas (title + header rows, approx 220px at scale 2)
          const headerEstimatedHeightPx = Math.min(240, Math.floor(appendixCanvas.height * 0.18));

          sliceAndAddPages(
            pdf,
            appendixCanvas,
            'landscape',
            landMargin,
            landContentWidth,
            landContentHeight,
            false,
            headerEstimatedHeightPx
          );
        }
      }
    }

    pdf.save(cleanFileName);
    return true;
  } catch (error) {
    console.error('Military document PDF export error, running fallback:', error);
    downloadPrintableHtml(
      mainEl.innerHTML +
        (appendixEl
          ? `<div style="page-break-before: always; margin-top: 24px;">${appendixEl.innerHTML}</div>`
          : ''),
      cleanFileName.replace('.pdf', ''),
      title,
      'landscape'
    );
    return true;
  }
}

/**
 * Universal export function for tables (Payroll report, Salary slips, etc.)
 */
export async function exportElementToPdf(
  element: HTMLElement | string,
  options: PdfExportOptions = {}
): Promise<boolean> {
  const {
    fileName = 'Tai_Lieu_Quan_Doi.pdf',
    orientation = 'landscape',
    title = 'Tài Liệu Quân Đội',
  } = options;

  const targetElement =
    typeof element === 'string' ? document.getElementById(element) : element;

  if (!targetElement) {
    console.error('Element not found for PDF export:', element);
    return false;
  }

  // Check if targetElement contains both an administrative main block and an appendix block
  const appendixChild = targetElement.querySelector(
    '.appendix-table-section, .appendix-section, [data-appendix-section]'
  ) as HTMLElement | null;

  if (appendixChild) {
    // If it has an appendix child, clone or export via two-stage military export
    const mainClone = targetElement.cloneNode(true) as HTMLElement;
    const appendixInClone = mainClone.querySelector(
      '.appendix-table-section, .appendix-section, [data-appendix-section]'
    );
    if (appendixInClone) {
      appendixInClone.remove();
    }

    // Temporary off-screen mount to get clean captures
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    mainClone.id = 'temp-pdf-main-block';
    tempContainer.appendChild(mainClone);
    document.body.appendChild(tempContainer);

    try {
      const res = await exportMilitaryDocumentToPdf({
        fileName,
        mainElementId: 'temp-pdf-main-block',
        appendixElementId: appendixChild.id || undefined,
        title,
      });
      document.body.removeChild(tempContainer);
      return res;
    } catch {
      document.body.removeChild(tempContainer);
    }
  }

  // Single stage export for unified documents (like payroll report table)
  const isLandscape = orientation === 'landscape';
  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const targetRenderWidth = isLandscape ? 1260 : 840;

  try {
    const canvas = await renderElementToCanvas(targetElement, targetRenderWidth);
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const margin = 8;
    const pageWidth = isLandscape ? 297 : 210;
    const pageHeight = isLandscape ? 210 : 297;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    const scaleRatio = contentWidth / canvas.width;
    const totalRenderHeight = canvas.height * scaleRatio;

    if (totalRenderHeight <= contentHeight) {
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.98),
        'JPEG',
        margin,
        margin,
        contentWidth,
        totalRenderHeight,
        undefined,
        'FAST'
      );
    } else {
      sliceAndAddPages(
        pdf,
        canvas,
        orientation,
        margin,
        contentWidth,
        contentHeight,
        false
      );
    }

    pdf.save(cleanFileName);
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    downloadPrintableHtml(
      targetElement.innerHTML,
      cleanFileName.replace('.pdf', ''),
      title,
      orientation
    );
    return true;
  }
}
