import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getLocalCorporateMenuConfig } from './corporateMenuConfig';

function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
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

export async function generateCorporateMenuPdf() {
  const config = getLocalCorporateMenuConfig();

  // If a custom PDF file was uploaded dynamically by the Admin, trigger download/view for that custom PDF
  if (config.pdfMenuUrl && config.pdfMenuUrl.startsWith('data:application/pdf')) {
    const link = document.createElement('a');
    link.href = config.pdfMenuUrl;
    link.download = config.pdfFileName || 'DoMeal_Corporate_Catering_Menu.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Load Logo
  let logoBase64 = '';
  try {
    logoBase64 = await getBase64ImageFromUrl(config.customLogoUrl || '/DOMEAL_Logo.png');
  } catch (e) {
    console.error('Logo loading failed:', e);
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const pageHeight = doc.internal.pageSize.getHeight(); // 297

  // Helper for adding header on pages
  const addHeader = (title = 'CORPORATE CATERING MENU') => {
    // Header Bar
    doc.setFillColor(30, 59, 43); // Dark Green #1E3B2B
    doc.rect(0, 0, pageWidth, 26, 'F');

    // Accent line
    doc.setFillColor(195, 155, 84); // Gold #C39B54
    doc.rect(0, 26, pageWidth, 2, 'F');

    // Logo & Header Text
    let textX = 14;
    if (logoBase64) {
      try {
        // White circle background for logo
        doc.setFillColor(255, 255, 255);
        doc.circle(23, 13, 10, 'F');
        doc.setDrawColor(195, 155, 84);
        doc.setLineWidth(0.6);
        doc.circle(23, 13, 10.2, 'S');

        // Draw image inside circle
        doc.addImage(logoBase64, 'PNG', 14, 4, 18, 18);
        textX = 37;
      } catch (e) {
        textX = 14;
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('DOMEAL', textX, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(230, 230, 230);
    doc.text(title, textX, 20);

    // Date & Ref
    doc.setFontSize(8);
    doc.setTextColor(230, 230, 230);
    doc.text(`Official Menu & Catalog | ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 14, 17, { align: 'right' });
  };

  // Helper for adding footer on pages
  const addFooter = (currentPage: number, totalPages: number) => {
    doc.setFillColor(248, 246, 240);
    doc.rect(0, pageHeight - 16, pageWidth, 16, 'F');
    doc.setDrawColor(226, 220, 205);
    doc.line(0, pageHeight - 16, pageWidth, pageHeight - 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 59, 43);
    doc.text('DOMEAL CORPORATE CATERING SERVICES', 14, pageHeight - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Tel: +44 (0) 20 8904 7981 | Web: www.domeal.co.uk | Email: catering@domeal.co.uk', 14, pageHeight - 6);

    doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
  };

  // --- PAGE 1: COVER & CORPORATE PACKAGES ---
  addHeader('EXQUISITE CORPORATE CATERING PACKAGES');

  let y = 33;

  // Title Banner Card
  doc.setFillColor(253, 252, 247);
  doc.setDrawColor(195, 155, 84);
  doc.roundedRect(14, y, pageWidth - 28, 20, 3, 3, 'FD');

  doc.setTextColor(30, 59, 43);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('CORPORATE CATERING PACKAGES & PRICING', 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authentic South Indian & Fusion Cuisine cooked live or served fresh for office events, galas & meetings.', 20, y + 15);

  y += 24;

  // Dynamic Pricing Options Table
  autoTable(doc, {
    startY: y,
    head: [['Package Option', 'Inclusions & Service Details', 'Price (per person)', 'Minimum Order']],
    body: [
      [
        'Option A:\nWith Live Dosa Station',
        `• Includes ${config.serviceDuration || '3 Hours On-Site Live Preparation & Serving'}\n• ${config.packageInclusions.liveStation || 'Live 4 ft. Jumbo Dosa, Medu Vada (Live), Idly & Uthappam'}\n• Complete Package Menu Inclusions Below`,
        `£${config.liveDosaPrice.toFixed(2)} pp`,
        `${config.minPax} Pax\nRequired`
      ],
      [
        'Option B:\nWithout Live Dosa',
        '• Premium Hot Buffet Delivery & Setup\n• Complete Package Menu Inclusions Below\n• Includes Hot Chafing Dish Warmers & Serving Utensils',
        `£${config.standardBuffetPrice.toFixed(2)} pp`,
        `${config.minPax} Pax\nRequired`
      ]
    ],
    headStyles: {
      fillColor: [30, 59, 43],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
      cellPadding: 3.5
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3.5,
      valign: 'middle'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 48 },
      1: { cellWidth: 82 },
      2: { fontStyle: 'bold', textColor: [195, 155, 84], halign: 'center', cellWidth: 32 },
      3: { halign: 'center', cellWidth: 20 }
    },
    theme: 'grid'
  });

  y = (doc as any).lastAutoTable.finalY + 7;

  // Section Header: Included Corporate Menu
  doc.setFillColor(195, 155, 84);
  doc.rect(14, y, 3.5, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 59, 43);
  doc.text('STANDARD CORPORATE PACKAGE MENU INCLUSIONS', 21, y + 7.5);

  y += 13;

  // Dynamic Menu Inclusions Table
  autoTable(doc, {
    startY: y,
    head: [['Category', 'Selection Rules', 'Dishes Included / Available Options']],
    body: [
      ['Salads', 'Included (2 Items)', `• ${config.packageInclusions.salads}`],
      ['Chaat', 'Choose Any 1', `• ${config.packageInclusions.chaat}`],
      ['Main Course', 'Choose Any 2', `• ${config.packageInclusions.mains}`],
      ['Breads', 'Choose Any 1', `• ${config.packageInclusions.breads}`],
      ['Curries', 'Choose Any 2', `• ${config.packageInclusions.curries}`],
      ['Dessert', 'Choose Any 1', `• ${config.packageInclusions.desserts}`],
      ['Live Station (Option A)', 'Includes 3 Hours Serving', `• ${config.packageInclusions.liveStation}`]
    ],
    headStyles: {
      fillColor: [30, 59, 43],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 3
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.8,
      valign: 'middle'
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [30, 59, 43], cellWidth: 38 },
      1: { fontStyle: 'bold', cellWidth: 40 },
      2: { cellWidth: 104 }
    },
    theme: 'striped'
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Important Terms Box
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(14, y, pageWidth - 28, 19, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text('PLEASE NOTE & TERMS OF SERVICE:', 18, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);

  const minPax = config.minPax || 10;
  const termsLines = (config.termsNotice || `• Minimum order requirement is strictly ${minPax} pax per order.`).split('\n');
  termsLines.forEach((term, index) => {
    if (index < 3) {
      doc.text(term, 18, y + 10 + index * 4);
    }
  });
  doc.text('• Live Station includes 3 hours of active serving staff and fresh preparation on site.', 18, y + 14);
  doc.text('• Allergy Notice: All items may contain allergens directly or through cross contamination. Custom dietary menus available on request.', 18, y + 18);


  // --- PAGE 2: DRINKS, DESSERTS & BAR MENU CATALOG ---
  doc.addPage();
  addHeader('FULL BEVERAGE, DESSERT & BAR MENU CATALOG');

  let y2 = 32;

  // Section 1: Desserts & Hot Drinks / Milkshakes (Side-by-side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 59, 43);
  doc.text('DESSERTS', 14, y2);
  doc.text('HOT DRINKS & MILKSHAKES', 110, y2);

  y2 += 3;

  autoTable(doc, {
    startY: y2,
    margin: { left: 14, right: 110 },
    tableWidth: 83,
    head: [['Dessert Item', 'Price']],
    body: [
      ['Carrot Halwa (N)', '£4.99'],
      ['Carrot Halwa + Vanilla Ice Cream', '£3.49'],
      ['Gulab Jamoon (2Pcs)', '£2.49'],
      ['Gulab Jamoon + Vanilla Ice Cream', '£3.99'],
      ['Ice Cream Scoop (3 Scoops)', '£2.99'],
      ['Matka Kulfi', '£4.99'],
      ['Rasmalai (2Pcs)', '£3.99'],
      ['Sizzling Brownie', '£10.99'],
      ['Sweet of the Day', '£3.49'],
      ['DoMeal Royal Falooda', '£7.99']
    ],
    headStyles: { fillColor: [30, 59, 43], fontSize: 8, cellPadding: 2 },
    bodyStyles: { fontSize: 7.5, cellPadding: 1.6 },
    columnStyles: { 0: { cellWidth: 63 }, 1: { fontStyle: 'bold', halign: 'right' } }
  });

  const dessertsFinalY = (doc as any).lastAutoTable.finalY;

  autoTable(doc, {
    startY: y2,
    margin: { left: 110, right: 14 },
    tableWidth: 86,
    head: [['Hot Drinks & Milkshakes', 'Price']],
    body: [
      ['Chennai Special Filter Coffee', '£2.49'],
      ['Tea / Masala Tea / Green Tea', '£2.49 - £2.99'],
      ['Hot Chocolate (Milk)', '£2.49'],
      ['Milkshake with Ice Cream', '£6.99'],
      ['Aero Mint Milkshake', '£6.99'],
      ['Bounty / Ferrero Milkshake', '£6.99'],
      ['Kitkat / Mango Milkshake', '£6.99'],
      ['Nutella / Oreo Milkshake', '£6.99']
    ],
    headStyles: { fillColor: [30, 59, 43], fontSize: 8, cellPadding: 2 },
    bodyStyles: { fontSize: 7.5, cellPadding: 1.6 },
    columnStyles: { 0: { cellWidth: 66 }, 1: { fontStyle: 'bold', halign: 'right' } }
  });

  const drinksFinalY = (doc as any).lastAutoTable.finalY;

  // Accurately calculate y2 for Section 2 (no static forced gap!)
  y2 = Math.max(dessertsFinalY, drinksFinalY) + 6;

  // Section 2: Fresh Juices & Beverages
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 59, 43);
  doc.text('FRESH FRUIT JUICES & BEVERAGES', 14, y2);

  y2 += 3;

  autoTable(doc, {
    startY: y2,
    head: [['Beverage Item', 'Single Serving', 'Jug (Sharable)']],
    body: [
      ['Fresh Orange / Mango / Pineapple / Passion / Apple Juice', '£3.89', '£14.29'],
      ['Cranberry / Lychee Juice / Lime Juice (Salt or Sweet)', '£2.49 - £2.99', '-'],
      ['ABC Juice (Apple, Beetroot & Carrot) / Pomegranate with Milk', '£4.99 - £5.49', '-'],
      ['Apple Lemonade / Carrot & Orange Juice', '£3.99', '-'],
      ['Lassi (Sweet / Salt)', '£3.49', '£12.99'],
      ['Mango Lassi', '£3.99', '£13.69'],
      ['Rose Sweet Lassi / Rose Milk / Special Butter Milk', '£3.49', '£12.59 - £12.99'],
      ['Mineral Water Bottle / Soft Drinks / Tonic / Soda', '£1.00 - £2.49', '-']
    ],
    headStyles: { fillColor: [30, 59, 43], fontSize: 8, cellPadding: 2 },
    bodyStyles: { fontSize: 7.5, cellPadding: 1.6 },
    columnStyles: {
      0: { cellWidth: 104 },
      1: { fontStyle: 'bold', halign: 'center', cellWidth: 38 },
      2: { fontStyle: 'bold', halign: 'center', cellWidth: 40 }
    }
  });

  y2 = (doc as any).lastAutoTable.finalY + 6;

  // Section 3: Bar Menu (Beers, Spirits & Fine Wines)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 59, 43);
  doc.text('BAR MENU - DRAFT BEERS, SPIRITS & FINE WINES', 14, y2);

  y2 += 3;

  autoTable(doc, {
    startY: y2,
    head: [['Category', 'Brand / Item Option', 'Small / Medium', 'Big / Large / Bottle']],
    body: [
      ['Draft Beers', 'Cobra / Peroni / Kingfisher', '£3.49 (1/2 Pint)', '£6.49 (1 Pint)'],
      ['Whiskey', 'Jack Daniels / Black Label', '£3.49 (30ml)', '£5.99 (60ml)'],
      ['Whiskey', 'Amrut Singlemalt', '£4.49 (30ml)', '£7.49 (60ml)'],
      ['Brandy', 'Courvoisier / Remy Martin', '£3.49 - £4.99 (30ml)', '£5.99 - £8.99 (60ml)'],
      ['Gin', 'Bombay Sapphire / Gordon\'s Pink Gin', '£2.99 - £3.49 (30ml)', '£5.99 - £8.99 (60ml)'],
      ['Vodka & Rum', 'Smirnoff Vodka / Old Monk / Captain Morgan', '£2.99 - £3.99 (30ml)', '£4.99 - £5.99 (60ml)'],
      ['Red Wine', 'Gufetto Montepulciano D\'Abruzzo (Italy)', '£6.00 (Med) / £7.00 (Lrg)', '£19.99 (Bottle)'],
      ['Red Wine', 'Vista Plata Malbec (Argentina)', '£6.00 (Med) / £7.00 (Lrg)', '£19.99 (Bottle)'],
      ['White Wine', 'Crescendo Pinot Grigio (Italy)', '£6.49 (Med) / £7.49 (Lrg)', '£22.99 (Bottle)'],
      ['White Wine', 'Kokako Sauvignon Blanc (New Zealand)', '£6.49 (Med) / £7.49 (Lrg)', '£22.99 (Bottle)']
    ],
    headStyles: { fillColor: [195, 155, 84], textColor: [30, 59, 43], fontStyle: 'bold', fontSize: 8, cellPadding: 2 },
    bodyStyles: { fontSize: 7.5, cellPadding: 1.6 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 72 },
      2: { halign: 'center', cellWidth: 40 },
      3: { fontStyle: 'bold', halign: 'center', cellWidth: 40 }
    }
  });

  // Apply footers to all pages dynamically
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  // Trigger Save
  doc.save(`Domeal_Corporate_Catering_Menu_${new Date().toISOString().slice(0, 10)}.pdf`);
}
