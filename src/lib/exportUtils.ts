import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface DeliveryExportItem {
  fullName: string;
  deliveryDateTime: string;
  deliveryFullAddress: string;
  specialNotes: string;
}

const slotMap: Record<string, string> = {
  'slot-1': 'Morning (7:30 AM – 8:30 AM)',
  'slot-2': 'Afternoon (12:00 PM – 1:00 PM)',
  'slot-3': 'Evening (7:30 PM – 8:30 PM)',
  morning: 'Morning (7:30 AM – 8:30 AM)',
  afternoon: 'Afternoon (12:00 PM – 1:00 PM)',
  evening: 'Evening (7:30 PM – 8:30 PM)',
};

/**
 * Robust formatter for Order delivery date and time
 */
export function formatOrderDeliveryDateTime(order: any): string {
  // 1. Resolve Delivery Date
  let dateStr = '';
  if (Array.isArray(order.deliveryDates) && order.deliveryDates.length > 0) {
    dateStr = order.deliveryDates
      .map((d: any) => {
        try {
          const parsed = new Date(d);
          if (!isNaN(parsed.getTime()) && String(d).includes('-')) {
            return parsed.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
          }
        } catch (_) {}
        return String(d);
      })
      .join(', ');
  } else if (order.deliveryDate) {
    try {
      const parsed = new Date(order.deliveryDate);
      if (!isNaN(parsed.getTime()) && String(order.deliveryDate).includes('-')) {
        dateStr = parsed.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      } else {
        dateStr = String(order.deliveryDate);
      }
    } catch (_) {
      dateStr = String(order.deliveryDate);
    }
  } else if (order.createdAt?.toDate) {
    dateStr = order.createdAt.toDate().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } else {
    dateStr = 'Date: TBD';
  }

  // 2. Resolve Delivery Time / Slot
  const rawSlot = String(order.deliverySlot || order.slot || order.deliveryTime || '').trim();
  let timeStr = '';

  if (rawSlot && slotMap[rawSlot.toLowerCase()]) {
    timeStr = slotMap[rawSlot.toLowerCase()];
  } else if (rawSlot && rawSlot !== 'Not specified' && rawSlot !== 'TBD') {
    timeStr = rawSlot;
  } else if (order.createdAt?.toDate) {
    const orderTime = order.createdAt.toDate().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    timeStr = `Standard Slot (Placed at ${orderTime})`;
  } else {
    timeStr = 'Standard Delivery (7:30 AM – 8:30 PM)';
  }

  return `${dateStr}\nTime: ${timeStr}`;
}

/**
 * Robust formatter for Corporate catering event date and time
 */
export function formatCorporateDeliveryDateTime(item: any): string {
  let dateStr = item.eventDate || '';
  if (dateStr) {
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime()) && dateStr.includes('-')) {
        dateStr = parsed.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }
    } catch (_) {}
  } else if (item.createdAt?.toDate) {
    dateStr = item.createdAt.toDate().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } else {
    dateStr = 'Date: TBD';
  }

  const rawTime = String(item.eventTime || '').trim();
  let timeStr = '';
  if (rawTime && rawTime !== 'Not specified' && rawTime !== 'TBD' && rawTime !== 'null') {
    timeStr = rawTime;
  } else if (item.createdAt?.toDate) {
    timeStr = `Requested at ${item.createdAt.toDate().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    timeStr = 'Time: TBD';
  }

  return `${dateStr}\nTime: ${timeStr}`;
}

function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve('');
      return;
    }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } else {
          resolve('');
        }
      } catch (e) {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
  });
}

/**
 * Exports delivery items to a PDF document with DoMeal logo and minimal fields:
 * - Full Name
 * - Delivery date and Time
 * - Delivery Full Address
 * - Special Notes
 */
export async function exportDeliveriesToPdf({
  title,
  subtitle,
  filename,
  items,
}: {
  title: string;
  subtitle?: string;
  filename: string;
  items: DeliveryExportItem[];
}) {
  let logoBase64 = '';
  try {
    logoBase64 = await getBase64ImageFromUrl('/DOMEAL_Logo.png');
  } catch (e) {
    console.error('Logo loading failed:', e);
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm

  // Header Banner
  doc.setFillColor(30, 59, 43); // #1E3B2B Dark Emerald
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Gold Accent Line
  doc.setFillColor(195, 155, 84); // #C39B54 Gold
  doc.rect(0, 26, pageWidth, 2, 'F');

  // Logo & Title position
  let textX = 14;
  if (logoBase64) {
    try {
      // White circle background for logo
      doc.setFillColor(255, 255, 255);
      doc.circle(23, 13, 9, 'F');
      doc.setDrawColor(195, 155, 84);
      doc.setLineWidth(0.6);
      doc.circle(23, 13, 9.2, 'S');

      // Draw image inside circle
      doc.addImage(logoBase64, 'PNG', 15, 5, 16, 16);
      textX = 37;
    } catch (e) {
      textX = 14;
    }
  }

  // Header Typography
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('DOMEAL', textX, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(230, 230, 230);
  doc.text(title.toUpperCase(), textX, 19);

  // Metadata top right
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFontSize(7.5);
  doc.setTextColor(220, 220, 220);
  doc.text(`Generated: ${dateStr} ${timeStr}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Total Records: ${items.length}`, pageWidth - 14, 19, { align: 'right' });

  // Subtitle / Info
  let startY = 34;
  if (subtitle) {
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(subtitle, 14, startY);
    startY += 5;
  }

  // 4 Minimal Delivery Columns
  const tableData =
    items.length === 0
      ? [['No records found', '-', '-', '-']]
      : items.map((item) => [
          item.fullName || 'N/A',
          item.deliveryDateTime || 'N/A',
          item.deliveryFullAddress || 'N/A',
          item.specialNotes || 'None',
        ]);

  autoTable(doc, {
    startY: startY,
    head: [['Full Name', 'Delivery date and Time', 'Delivery Full Address', 'Special Notes']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 59, 43], // #1E3B2B
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 3.5,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: [30, 41, 59], // Slate 800
      cellPadding: 3.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    columnStyles: {
      0: { cellWidth: 38 }, // Full Name
      1: { cellWidth: 48 }, // Delivery date and Time
      2: { cellWidth: 54 }, // Delivery Full Address
      3: { cellWidth: 42 }, // Special Notes
    },
    margin: { left: 14, right: 14, bottom: 18 },
    didDrawPage: (data) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text('DoMeal UK • Delivery Manifest', 14, pageHeight - 8);
      doc.text(`Page ${data.pageNumber}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
    },
  });

  const finalName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(finalName);
}

/**
 * Exports delivery items to an Excel (.xlsx) file with minimal fields:
 * - Full Name
 * - Delivery date and Time
 * - Delivery Full Address
 * - Special Notes
 */
export function exportDeliveriesToExcel({
  filename,
  sheetName = 'Deliveries',
  items,
}: {
  filename: string;
  sheetName?: string;
  items: DeliveryExportItem[];
}) {
  const rows = items.map((item) => ({
    'Full Name': item.fullName || 'N/A',
    'Delivery date and Time': item.deliveryDateTime?.replace('\n', ' • ') || 'N/A',
    'Delivery Full Address': item.deliveryFullAddress || 'N/A',
    'Special Notes': item.specialNotes || 'None',
  }));

  const worksheet = XLSX.utils.json_to_sheet(
    rows.length > 0
      ? rows
      : [
          {
            'Full Name': 'No records found',
            'Delivery date and Time': '-',
            'Delivery Full Address': '-',
            'Special Notes': '-',
          },
        ]
  );

  // Set friendly column widths
  worksheet['!cols'] = [
    { wch: 28 }, // Full Name
    { wch: 36 }, // Delivery date and Time
    { wch: 50 }, // Delivery Full Address
    { wch: 40 }, // Special Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const finalName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, finalName);
}
