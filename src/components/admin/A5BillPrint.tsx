import React, { useState } from 'react';
import { Bill } from '../../types';
import { Printer, X, FileText, Copy, Scissors } from 'lucide-react';

interface A5BillPrintProps {
  bill: Bill;
  onClose?: () => void;
}

export type PrintPaperMode = 'a4-half' | 'a4-double' | 'a5-direct';

// Convert amount to Words (Indian numbering format)
export const numberToWordsINR = (num: number): string => {
  const rounded = Math.round(num);
  if (rounded === 0) return 'Zero Rupees Only';

  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    let str = '';
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) {
        str += a[n] + ' ';
      } else {
        str += b[Math.floor(n / 10)] + ' ';
        if (n % 10 > 0) {
          str += a[n % 10] + ' ';
        }
      }
    }
    return str.trim();
  };

  return `${inWords(rounded)} Rupees Only`;
};

export const A5BillPrint: React.FC<A5BillPrintProps> = ({ bill, onClose }) => {
  const [paperMode, setPaperMode] = useState<PrintPaperMode>('a4-half');

  // Renders standard single bill HTML block
  const renderBillHTML = (copyLabel?: string) => {
    const minRows = 4;
    const emptyRowsCount = Math.max(0, minRows - bill.items.length);

    return `
      <div class="bill-wrapper">
        <!-- Top License Bar -->
        <div class="text-center">
          <div class="license-badge">
            <span>L. No. : DRUG/2025-26/146975-76</span>
          </div>
        </div>

        <!-- Shop Header -->
        <div class="text-center">
          <div class="header-top">
            <span>GSTIN: <strong>08OICPS9799Q1ZF</strong></span>
            <span class="header-badge">RETAIL INVOICE / CASH MEMO ${copyLabel ? `(${copyLabel})` : ''}</span>
            <span>Mob: <strong>7737116439</strong></span>
          </div>

          <div class="shop-title">MAAJIRAJ MEDICAL AND COSMETICS STORE</div>
          <div class="shop-address">
            S2/84, Shop no.1, Kallaji Bavji, 100 Feet Road, Sector 14, Goverdhan Vilas, Udaipur - 313001 (Rajasthan)
          </div>
        </div>

        <div class="divider-bold"></div>

        <!-- Meta Details (2 columns) -->
        <div class="meta-grid">
          <div class="meta-left">
            <div class="meta-row">
              <span class="font-bold">No. : M -</span>
              <span class="font-mono font-black" style="font-size: 13px; margin-left: 4px;">${bill.billNumber}</span>
            </div>
            <div class="meta-row">
              <span class="font-bold" style="white-space: nowrap;">Customer's Name :</span>
              <span class="dotted-line">${bill.customerName || 'Cash / Walk-in Customer'}</span>
            </div>
            <div class="meta-row">
              <span class="font-bold" style="white-space: nowrap;">Address :</span>
              <span class="dotted-line">${bill.address || 'Udaipur'}</span>
            </div>
          </div>

          <div class="meta-right">
            <div class="meta-row" style="justify-content: flex-end;">
              <span class="font-bold">Date :</span>
              <span class="dotted-line" style="flex: none; min-width: 80px; text-align: right;">${bill.date || new Date(bill.createdAt).toLocaleDateString('en-GB')}</span>
            </div>
            <div class="meta-row">
              <span class="font-bold" style="white-space: nowrap;">Mob. No. :</span>
              <span class="dotted-line" style="font-family: monospace;">${bill.mobileNumber || '-'}</span>
            </div>
            <div class="meta-row">
              <span class="font-bold" style="white-space: nowrap;">Doctor's Name :</span>
              <span class="dotted-line">${bill.doctorName || 'Self / RMP'}</span>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 25px; text-align: center;"><span>S.N.</span></th>
                <th><span>Description / Medicine Name</span></th>
                <th style="width: 55px; text-align: center;"><span>Batch</span></th>
                <th style="width: 45px; text-align: center;"><span>Exp.</span></th>
                <th style="width: 30px; text-align: center;"><span>Qty</span></th>
                <th style="width: 50px; text-align: right;"><span>Rate (₹)</span></th>
                <th style="width: 35px; text-align: right;"><span>Disc.</span></th>
                <th style="width: 60px; text-align: right;"><span>Amount (₹)</span></th>
              </tr>
            </thead>
            <tbody>
              ${bill.items
                .map(
                  (it, idx) => `
                <tr>
                  <td style="text-align: center; font-weight: 500;">${idx + 1}</td>
                  <td style="font-weight: bold;">${it.name}</td>
                  <td style="text-align: center; font-family: monospace; font-size: 8px;">${it.batch || '-'}</td>
                  <td style="text-align: center; font-family: monospace; font-size: 8px;">${it.expDate || '-'}</td>
                  <td style="text-align: center; font-weight: bold;">${it.qty}</td>
                  <td style="text-align: right; font-family: monospace;">${it.mrp.toFixed(2)}</td>
                  <td style="text-align: right; font-family: monospace;">${it.discountPercent ? `${it.discountPercent}%` : '-'}</td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold;">${it.amount.toFixed(2)}</td>
                </tr>
              `
                )
                .join('')}
              ${Array.from({ length: emptyRowsCount })
                .map(
                  () => `
                <tr style="color: transparent; select: none;">
                  <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="totals-container">
          <div class="words-box">
            <span class="font-bold">In Words: </span>
            <span style="font-style: italic;">${numberToWordsINR(bill.grandTotal)}</span>
            ${
              bill.paymentMode
                ? `<span style="margin-left: 6px; border: 1px solid #000; padding: 1px 4px; font-weight: bold; font-size: 7.5px;">MODE: ${bill.paymentMode}</span>`
                : ''
            }
          </div>
          <div class="totals-box">
            ${
              bill.discountTotal > 0
                ? `
              <div style="display: flex; justify-content: space-between;">
                <span>Subtotal:</span>
                <span>₹${bill.subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>Discount:</span>
                <span>- ₹${bill.discountTotal.toFixed(2)}</span>
              </div>
            `
                : ''
            }
            <div class="grand-total" style="display: flex; justify-content: space-between;">
              <span style="font-family: sans-serif;">TOTAL:</span>
              <span>₹${bill.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Terms & Conditions / Signatures -->
        <div class="footer-grid">
          <div class="terms-box">
            <div class="font-bold uppercase" style="font-size: 8px; margin-bottom: 1px;">TERMS AND CONDITIONS :</div>
            <div>● All disputes subject to UDAIPUR Jurisdiction only</div>
            <div>● Goods once sold are not returnable</div>
            <div>● Before the use of drug Consult your Doctor</div>
            <div>● E. & O.E.</div>
          </div>

          <div class="sign-box">
            <div class="font-bold" style="font-size: 8px;">For : Maajiraj Medical & Cosmetics Store</div>
            <div class="font-bold uppercase" style="margin-top: 14px; font-size: 7.5px;">Auth. Signatory</div>
          </div>
        </div>

        <div class="bottom-line">
          <span class="font-bold">Customer's Signature</span>
          <span style="font-family: monospace;">Thank you for visiting! Wish you good health.</span>
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    // Remove existing print iframe
    const existingIframe = document.getElementById('a5-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    // Create an isolated hidden iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'a5-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Determine @page size & layout based on selected paperMode
    let pageCss = '';
    let bodyContent = '';

    if (paperMode === 'a4-half') {
      // Print on TOP HALF of A4 Portrait (210mm x 297mm), bottom half left blank for next bill
      pageCss = `
        @page {
          size: A4 portrait;
          margin: 6mm;
        }
      `;
      bodyContent = `
        <div style="width: 100%; max-width: 198mm; margin: 0 auto;">
          ${renderBillHTML()}
          
          <!-- Scissor Cut line dividing the A4 sheet into two A5 halves -->
          <div style="margin-top: 6mm; padding-top: 4mm; border-top: 1.5px dashed #000; text-align: center; font-size: 9px; font-weight: bold; letter-spacing: 2px; color: #000;">
            ✂ -------------------- CUT HERE • REMAINING HALF PAGE FOR NEXT BILL -------------------- ✂
          </div>

          <!-- Blank bottom half spacer -->
          <div style="height: 120mm;"></div>
        </div>
      `;
    } else if (paperMode === 'a4-double') {
      // Print 2 COPIES on 1 A4 Sheet (Top: Customer Copy, Bottom: Store Copy)
      pageCss = `
        @page {
          size: A4 portrait;
          margin: 5mm;
        }
      `;
      bodyContent = `
        <div style="width: 100%; max-width: 198mm; margin: 0 auto;">
          ${renderBillHTML('CUSTOMER COPY')}
          
          <div style="margin: 3mm 0; border-top: 1.5px dashed #000; text-align: center; font-size: 8.5px; font-weight: bold; letter-spacing: 2px;">
            ✂ -------------------- CUT HERE -------------------- ✂
          </div>

          ${renderBillHTML('STORE / PHARMACY COPY')}
        </div>
      `;
    } else {
      // Direct A5 Paper (Landscape)
      pageCss = `
        @page {
          size: A5 landscape;
          margin: 4mm;
        }
      `;
      bodyContent = `
        <div style="width: 100%; max-width: 202mm; margin: 0 auto;">
          ${renderBillHTML()}
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Cash Memo - M-${bill.billNumber}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
          <style>
            ${pageCss}
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: 'Plus Jakarta Sans', Arial, sans-serif;
              color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              width: 100%;
              height: 100%;
              background: #ffffff !important;
            }
            .bill-wrapper {
              width: 100%;
              border: 2px solid #000000;
              padding: 3mm;
              background: #ffffff;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .font-mono {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            }
            .font-heading {
              font-family: 'Outfit', sans-serif !important;
            }
            .license-badge {
              background: #000000 !important;
              color: #ffffff !important;
              text-align: center;
              font-family: monospace;
              font-weight: bold;
              font-size: 9.5px;
              padding: 1.5px 10px;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              display: inline-block;
              margin: 0 auto 3px auto;
            }
            .license-badge span {
              color: #ffffff !important;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

            .header-top {
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              font-weight: 600;
              padding-bottom: 2px;
            }
            .header-badge {
              border: 1px solid #000;
              padding: 0.5px 5px;
              font-weight: bold;
              font-size: 8.5px;
            }
            .shop-title {
              font-family: 'Outfit', sans-serif;
              font-weight: 900;
              font-size: 16px;
              letter-spacing: -0.3px;
              text-transform: uppercase;
              margin: 1px 0;
            }
            .shop-address {
              font-size: 8px;
              color: #000;
              line-height: 1.2;
              margin-bottom: 3px;
            }
            .divider-bold {
              border-bottom: 2px solid #000;
              margin-bottom: 3px;
            }
            .meta-grid {
              display: flex;
              justify-content: space-between;
              font-size: 9.5px;
              padding-bottom: 3px;
              border-bottom: 1px solid #000;
              line-height: 1.3;
            }
            .meta-left { width: 58%; }
            .meta-right { width: 40%; text-align: right; }
            .meta-row {
              display: flex;
              align-items: baseline;
              margin-bottom: 1.5px;
            }
            .dotted-line {
              border-bottom: 1px dotted #000;
              flex: 1;
              margin-left: 4px;
              padding-left: 2px;
              font-weight: 600;
            }
            .table-container {
              margin-top: 3px;
              border: 1px solid #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9px;
            }
            th {
              background: #000000 !important;
              color: #ffffff !important;
              font-weight: bold;
              padding: 2.5px 3px;
              border-right: 1px solid #fff;
              text-align: left;
            }
            th:last-child { border-right: none; }
            th span { color: #ffffff !important; }
            td {
              padding: 2px 3px;
              border-bottom: 1px solid #000;
              border-right: 1px solid #000;
            }
            td:last-child { border-right: none; }
            tr:last-child td { border-bottom: none; }

            .totals-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border: 1px solid #000;
              border-top: none;
              padding: 3px 5px;
              font-size: 9px;
            }
            .words-box {
              flex: 1;
              padding-right: 8px;
              font-size: 8.5px;
            }
            .totals-box {
              min-width: 155px;
              text-align: right;
              font-family: monospace;
              font-size: 9px;
            }
            .grand-total {
              font-size: 12px;
              font-weight: 900;
              border-top: 1px solid #000;
              padding-top: 1.5px;
              margin-top: 1.5px;
            }
            .footer-grid {
              display: flex;
              justify-content: space-between;
              margin-top: 3px;
              font-size: 7.5px;
              line-height: 1.25;
            }
            .terms-box { width: 62%; }
            .sign-box { width: 35%; text-align: right; display: flex; flex-direction: column; justify-content: space-between; }
            .bottom-line {
              display: flex;
              justify-content: space-between;
              border-top: 1px dotted #000;
              margin-top: 3px;
              padding-top: 1.5px;
              font-size: 7px;
            }
          </style>
        </head>
        <body>
          ${bodyContent}
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Wait for content & fonts, then trigger print
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Sticky Action Toolbar (Always visible on top) */}
      <div className="sticky top-0 z-20 w-full max-w-4xl bg-slate-900 text-white px-4 py-3.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 print:hidden border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-1.5 rounded-lg font-mono font-black text-sm text-white">
            M - {bill.billNumber}
          </div>
          <div>
            <div className="font-heading font-black text-sm text-white flex items-center gap-2">
              <span>A5 Cash Memo Print</span>
              <span className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                Black & White Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Customer: <strong>{bill.customerName}</strong> • Grand Total: <strong>₹{bill.grandTotal.toFixed(2)}</strong>
            </p>
          </div>
        </div>

        {/* Paper Size & Layout Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode selector pills */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl text-xs font-semibold border border-slate-700">
            <button
              onClick={() => setPaperMode('a4-half')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                paperMode === 'a4-half'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Print on standard A4 paper: uses top half (A5 size) and leaves bottom half blank for next bill"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>A4 (Top Half / 1 Bill)</span>
            </button>

            <button
              onClick={() => setPaperMode('a4-double')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                paperMode === 'a4-double'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Print 2 copies on 1 A4 page (Customer + Shop copy)"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>A4 (2 Copies)</span>
            </button>

            <button
              onClick={() => setPaperMode('a5-direct')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                paperMode === 'a5-direct'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Print directly on pre-cut A5 Landscape paper"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A5 Direct</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="bg-white hover:bg-slate-100 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="w-4 h-4 text-black" />
            <span>PRINT NOW</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition-colors cursor-pointer"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ON-SCREEN PREVIEW CONTAINER */}
      <div className="w-full max-w-4xl bg-slate-100 p-4 rounded-2xl shadow-xl flex flex-col items-center">
        {/* Helper Note for User */}
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs px-4 py-2 rounded-xl mb-3 w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">Selected Mode:</span>
            {paperMode === 'a4-half' && (
              <span>
                <strong>A4 Paper (Top Half)</strong> — Bill prints in A5 size on the upper half of standard A4 paper. You can cut along the dotted line and use the bottom half for your next bill!
              </span>
            )}
            {paperMode === 'a4-double' && (
              <span>
                <strong>A4 Paper (2 Copies on 1 Sheet)</strong> — Prints 2 identical A5 bills (Customer Copy + Store Copy) on a single A4 page.
              </span>
            )}
            {paperMode === 'a5-direct' && (
              <span>
                <strong>Direct A5 Sheet (Landscape)</strong> — Prints directly on pre-cut A5 paper.
              </span>
            )}
          </div>
        </div>

        {/* Paper Container Mockup */}
        <div
          id="printable-a5-bill"
          className="bg-white text-black border-2 border-black p-3.5 rounded-none font-sans text-xs shadow-md w-full max-w-[205mm] box-border"
        >
          {/* Top License Badge */}
          <div className="flex justify-center mb-1">
            <div className="bg-black text-white font-mono font-bold text-[9.5px] px-3 py-0.5 rounded-none tracking-widest uppercase inline-block border border-black">
              L. No. : DRUG/2025-26/146975-76
            </div>
          </div>

          {/* Shop Header */}
          <div className="text-center pb-1 border-b-2 border-black space-y-0.5">
            <div className="flex items-center justify-between text-[9px] text-black font-semibold px-1">
              <span>GSTIN: <strong>08OICPS9799Q1ZF</strong></span>
              <span className="font-bold uppercase tracking-wider px-2 py-0.5 border border-black text-[8.5px]">
                RETAIL INVOICE / CASH MEMO
              </span>
              <span>Mob: <strong>7737116439</strong></span>
            </div>

            <h1 className="font-heading font-black text-base tracking-tight text-black uppercase pt-0.5">
              MAAJIRAJ MEDICAL AND COSMETICS STORE
            </h1>
            <p className="text-[8.5px] leading-tight text-black max-w-[580px] mx-auto">
              S2/84, Shop no.1, Kallaji Bavji, 100 Feet Road, Sector 14, Goverdhan Vilas, Udaipur - 313001 (Rajasthan)
            </p>
          </div>

          {/* Bill Meta: 2 Columns */}
          <div className="py-1.5 border-b border-black text-[9.5px]">
            <div className="grid grid-cols-12 gap-x-3 gap-y-1">
              {/* Left Column (7 cols) */}
              <div className="col-span-7 space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold whitespace-nowrap">No. : M -</span>
                  <span className="font-mono font-black text-sm tracking-wider px-1 text-black">
                    {bill.billNumber}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-bold whitespace-nowrap">Customer's Name :</span>
                  <span className="border-b border-dotted border-black flex-1 px-1 font-semibold truncate text-black">
                    {bill.customerName || 'Cash / Walk-in Customer'}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-bold whitespace-nowrap">Address :</span>
                  <span className="border-b border-dotted border-black flex-1 px-1 truncate text-black">
                    {bill.address || 'Udaipur'}
                  </span>
                </div>
              </div>

              {/* Right Column (5 cols) */}
              <div className="col-span-5 space-y-1">
                <div className="flex items-baseline justify-end gap-1">
                  <span className="font-bold">Date :</span>
                  <span className="border-b border-dotted border-black min-w-[80px] text-right font-bold font-mono px-1 text-black">
                    {bill.date || new Date(bill.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-bold whitespace-nowrap">Mob. No. :</span>
                  <span className="border-b border-dotted border-black flex-1 font-mono px-1 text-black">
                    {bill.mobileNumber || '-'}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="font-bold whitespace-nowrap">Doctor's Name :</span>
                  <span className="border-b border-dotted border-black flex-1 px-1 truncate text-black">
                    {bill.doctorName || 'Self / RMP'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-1 border border-black">
            <table className="w-full text-left text-[9px] border-collapse">
              <thead>
                <tr className="bg-black text-white font-bold border-b border-black">
                  <th className="p-1 text-center w-7 border-r border-black">S.N.</th>
                  <th className="p-1 border-r border-black">Description / Medicine Name</th>
                  <th className="p-1 text-center w-16 border-r border-black">Batch</th>
                  <th className="p-1 text-center w-14 border-r border-black">Exp.</th>
                  <th className="p-1 text-center w-8 border-r border-black">Qty</th>
                  <th className="p-1 text-right w-16 border-r border-black">Rate (₹)</th>
                  <th className="p-1 text-right w-12 border-r border-black">Disc.</th>
                  <th className="p-1 text-right w-16">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((it, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="p-1 text-center font-medium border-r border-black text-black">
                      {idx + 1}
                    </td>
                    <td className="p-1 font-semibold text-black border-r border-black truncate max-w-[220px]">
                      {it.name}
                    </td>
                    <td className="p-1 text-center font-mono text-[8px] border-r border-black text-black">
                      {it.batch || '-'}
                    </td>
                    <td className="p-1 text-center font-mono text-[8px] border-r border-black text-black">
                      {it.expDate || '-'}
                    </td>
                    <td className="p-1 text-center font-bold border-r border-black text-black">
                      {it.qty}
                    </td>
                    <td className="p-1 text-right font-mono border-r border-black text-black">
                      {it.mrp.toFixed(2)}
                    </td>
                    <td className="p-1 text-right font-mono border-r border-black text-black">
                      {it.discountPercent ? `${it.discountPercent}%` : '-'}
                    </td>
                    <td className="p-1 text-right font-mono font-bold text-black">
                      {it.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="border-x border-b border-black p-1.5 flex justify-between items-center text-[9px]">
            <div className="flex-1 pr-3">
              <span className="text-black font-semibold">In Words: </span>
              <strong className="text-black italic font-bold">
                {numberToWordsINR(bill.grandTotal)}
              </strong>
              {bill.paymentMode && (
                <span className="ml-2 text-[8px] border border-black px-1.5 py-0.2 uppercase font-bold text-black">
                  Mode: {bill.paymentMode}
                </span>
              )}
            </div>

            <div className="min-w-[155px] space-y-0.5 text-right font-mono text-[8.5px]">
              {bill.discountTotal > 0 && (
                <>
                  <div className="flex justify-between text-black">
                    <span>Subtotal:</span>
                    <span>₹{bill.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-black font-bold">
                    <span>Discount:</span>
                    <span>- ₹{bill.discountTotal.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-black text-xs text-black border-t border-black pt-0.5">
                <span className="font-sans font-black uppercase">GRAND TOTAL:</span>
                <span className="text-xs font-black">₹{bill.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions and Signatures */}
          <div className="mt-1 pt-1 text-[8px] text-black">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7 space-y-0.5">
                <div className="font-bold text-[8.5px] uppercase tracking-tight">
                  TERMS AND CONDITIONS :
                </div>
                <ul className="space-y-0.2 text-[7.5px] leading-tight text-black">
                  <li>● All disputes subject to UDAIPUR Jurisdiction only</li>
                  <li>● Goods once sold are not returnable</li>
                  <li>● Before the use of drug Consult your Doctor</li>
                  <li>● E. & O.E.</li>
                </ul>
              </div>

              <div className="col-span-5 text-right flex flex-col justify-between">
                <div className="font-bold text-[8.5px]">
                  For : Maajiraj Medical & Cosmetics Store
                </div>
                <div className="pt-4 text-[7.5px] font-bold text-black uppercase">
                  Auth. Signatory
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 mt-1 border-t border-dotted border-black text-[7.5px]">
              <span className="font-semibold">Customer's Signature</span>
              <span className="font-mono text-black">Thank you for visiting! Wish you good health.</span>
            </div>
          </div>
        </div>

        {/* Visual representation of cut line if in A4-half mode */}
        {paperMode === 'a4-half' && (
          <div className="w-full max-w-[205mm] mt-4 pt-3 border-t-2 border-dashed border-slate-400 text-center text-xs text-slate-500 font-bold flex items-center justify-center gap-2">
            <Scissors className="w-4 h-4 text-slate-700" />
            <span>Cut line: Bottom half of A4 page remains clean & reusable for your next bill</span>
          </div>
        )}
      </div>
    </div>
  );
};
