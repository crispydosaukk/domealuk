import jsPDF from 'jspdf';

export interface QRCodePdfOptions {
  qrDataUrl: string;
  targetUrl?: string;
  title?: string;
  subtitle?: string;
  filename?: string;
}

/**
 * Loads image from URL and converts to base64
 */
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
      } catch (_err) {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
  });
}

/**
 * Generates an A4 promotional flyer PDF with DoMeal branding and high-res QR code
 */
export async function generateQRCodeFlyerPdf({
  qrDataUrl,
  targetUrl = 'https://domeal.co.uk/',
  title = 'AUTHENTIC HOMEMADE INDIAN FOOD',
  subtitle = 'Fresh, healthy, vegetarian & vegan tiffins delivered right to your doorstep',
  filename = 'domeal-website-qr-flyer.pdf',
}: QRCodePdfOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  // 1. Header Banner (Deep Forest Green)
  doc.setFillColor(30, 59, 43); // #1E3B2B
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Gold accent strip
  doc.setFillColor(195, 155, 84); // #C39B54
  doc.rect(0, 32, pageWidth, 2.5, 'F');

  // Load logo
  let logoBase64 = '';
  try {
    logoBase64 = await getBase64ImageFromUrl('/DOMEAL_Logo.png');
  } catch (e) {
    console.error('Could not load logo for flyer PDF:', e);
  }

  let textX = 16;
  if (logoBase64) {
    try {
      // White circular badge
      doc.setFillColor(255, 255, 255);
      doc.circle(24, 16, 11, 'F');
      doc.setDrawColor(195, 155, 84);
      doc.setLineWidth(0.7);
      doc.circle(24, 16, 11.2, 'S');
      doc.addImage(logoBase64, 'PNG', 14, 6, 20, 20);
      textX = 40;
    } catch (_) {
      textX = 16;
    }
  }

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('DOMEAL', textX, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(230, 235, 232);
  doc.text('Authentic Home-Cooked Indian Food · London, UK', textX, 22);

  doc.setFontSize(8.5);
  doc.setTextColor(195, 155, 84);
  doc.text('21 Years of Culinary Excellence', textX, 28);

  // 2. Main Title Section
  let currentY = 46;
  doc.setTextColor(30, 59, 43);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, currentY, { align: 'center' });

  currentY += 7;
  doc.setTextColor(107, 142, 118);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(subtitle, pageWidth / 2, currentY, { align: 'center' });

  // 3. Central QR Code Card
  currentY += 10;
  const cardWidth = 140;
  const cardHeight = 120;
  const cardX = (pageWidth - cardWidth) / 2;
  const cardY = currentY;

  // Outer border & soft fill
  doc.setFillColor(253, 253, 251);
  doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 6, 6, 'F');
  doc.setDrawColor(195, 155, 84);
  doc.setLineWidth(0.8);
  doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 6, 6, 'S');

  // Inner card title
  doc.setTextColor(30, 59, 43);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('SCAN TO VISIT & ORDER', pageWidth / 2, cardY + 12, { align: 'center' });

  doc.setTextColor(107, 142, 118);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Point your smartphone camera at the code below', pageWidth / 2, cardY + 18, {
    align: 'center',
  });

  // QR Code Image
  const qrSize = 64;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = cardY + 23;

  // White base for QR with border
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 3, 3, 'F');
  doc.setDrawColor(220, 226, 222);
  doc.setLineWidth(0.5);
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 3, 3, 'S');

  // Insert QR Code
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // URL text under QR
  doc.setTextColor(30, 59, 43);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(targetUrl, pageWidth / 2, cardY + qrSize + 32, { align: 'center' });

  // Make the URL clickable in PDF viewer
  const urlWidth = doc.getTextWidth(targetUrl);
  doc.link((pageWidth - urlWidth) / 2, cardY + qrSize + 28, urlWidth, 6, { url: targetUrl });

  // 4. Feature Highlights Bento (2x2 Grid)
  currentY = cardY + cardHeight + 10;
  const features = [
    {
      title: '100% Pure Vegetarian & Vegan',
      desc: 'Plant-based, freshly cooked daily with zero preservatives',
    },
    {
      title: 'Traditional Home Recipes',
      desc: 'South & North Indian specialties passed down through generations',
    },
    {
      title: 'Eco-Friendly Reusable Dabbas',
      desc: 'Sustainable, insulated stainless tiffin packaging',
    },
    {
      title: 'London-Wide Scheduled Delivery',
      desc: 'Breakfast by 8:30 AM · Lunch by 1:00 PM · Dinner by 8:30 PM',
    },
  ];

  const colWidth = 85;
  const colGap = 10;
  const gridStartX = (pageWidth - (colWidth * 2 + colGap)) / 2;

  features.forEach((feat, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const boxX = gridStartX + col * (colWidth + colGap);
    const boxY = currentY + row * 18;

    doc.setFillColor(245, 247, 245);
    doc.roundedRect(boxX, boxY, colWidth, 15, 2.5, 2.5, 'F');
    doc.setDrawColor(209, 216, 212);
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, boxY, colWidth, 15, 2.5, 2.5, 'S');

    // Bullet icon/indicator
    doc.setFillColor(195, 155, 84);
    doc.circle(boxX + 4.5, boxY + 5.5, 1.8, 'F');

    doc.setTextColor(30, 59, 43);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(feat.title, boxX + 8.5, boxY + 6);

    doc.setTextColor(107, 142, 118);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(feat.desc, boxX + 8.5, boxY + 11);
  });

  // 5. Special Offer Banner
  currentY += 40;
  const offerWidth = 180;
  const offerX = (pageWidth - offerWidth) / 2;
  doc.setFillColor(254, 247, 237); // Light amber
  doc.roundedRect(offerX, currentY, offerWidth, 14, 3, 3, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.roundedRect(offerX, currentY, offerWidth, 14, 3, 3, 'S');

  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(
    '🎁 SPECIAL PROMOTION: Give £10, Get £10 with Referral · Student Discounts Available',
    pageWidth / 2,
    currentY + 6,
    {
      align: 'center',
    }
  );

  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    'Visit domeal.co.uk or scan the QR code to claim your rewards & start your meal plan today!',
    pageWidth / 2,
    currentY + 10.5,
    {
      align: 'center',
    }
  );

  // 6. Footer Bar
  const footerY = pageHeight - 16;
  doc.setFillColor(30, 59, 43);
  doc.rect(0, footerY, pageWidth, 16, 'F');
  doc.setFillColor(195, 155, 84);
  doc.rect(0, footerY, pageWidth, 0.8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DOMEAL · Authentic Home-Cooked Indian Meals', pageWidth / 2, footerY + 6, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(210, 220, 214);
  doc.text(
    'Website: https://domeal.co.uk  ·  Email: domealuk79812@gmail.com  ·  London, United Kingdom',
    pageWidth / 2,
    footerY + 11.5,
    {
      align: 'center',
    }
  );

  // Save the document
  doc.save(filename);
}

/**
 * Generates an A5 Table Tent / Counter Standee PDF card
 */
export async function generateQRCodeStandeePdf({
  qrDataUrl,
  targetUrl = 'https://domeal.co.uk/',
  filename = 'domeal-website-qr-standee.pdf',
}: QRCodePdfOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 148mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

  // Outer decorative border
  doc.setDrawColor(195, 155, 84);
  doc.setLineWidth(1.2);
  doc.roundedRect(6, 6, pageWidth - 12, pageHeight - 12, 5, 5, 'S');

  doc.setDrawColor(30, 59, 43);
  doc.setLineWidth(0.4);
  doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, 'S');

  // Header Bar
  doc.setFillColor(30, 59, 43);
  doc.roundedRect(12, 12, pageWidth - 24, 26, 3, 3, 'F');

  // Logo
  let logoBase64 = '';
  try {
    logoBase64 = await getBase64ImageFromUrl('/DOMEAL_Logo.png');
  } catch (e) {
    console.error('Could not load logo for standee PDF:', e);
  }

  if (logoBase64) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.circle(25, 25, 9, 'F');
      doc.setDrawColor(195, 155, 84);
      doc.setLineWidth(0.5);
      doc.circle(25, 25, 9.2, 'S');
      doc.addImage(logoBase64, 'PNG', 17, 17, 16, 16);
    } catch (_err) {
      // Ignore logo image drawing error
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('DOMEAL', 38, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(195, 155, 84);
  doc.text('AUTHENTIC INDIAN TIFFINS', 38, 29);

  doc.setTextColor(220, 230, 224);
  doc.setFontSize(7);
  doc.text('London-Wide Delivery', 38, 34);

  // Headline
  let curY = 47;
  doc.setTextColor(30, 59, 43);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SCAN TO VIEW MENU & ORDER', pageWidth / 2, curY, { align: 'center' });

  curY += 5;
  doc.setTextColor(107, 142, 118);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Open your smartphone camera & point at the QR code', pageWidth / 2, curY, {
    align: 'center',
  });

  // QR Code Box
  curY += 8;
  const qrSize = 75;
  const qrX = (pageWidth - qrSize) / 2;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX - 4, curY - 4, qrSize + 8, qrSize + 8, 4, 4, 'F');
  doc.setDrawColor(195, 155, 84);
  doc.setLineWidth(0.8);
  doc.roundedRect(qrX - 4, curY - 4, qrSize + 8, qrSize + 8, 4, 4, 'S');

  doc.addImage(qrDataUrl, 'PNG', qrX, curY, qrSize, qrSize);

  // URL under QR
  curY += qrSize + 9;
  doc.setTextColor(30, 59, 43);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(targetUrl, pageWidth / 2, curY, { align: 'center' });

  // Highlights
  curY += 8;
  doc.setTextColor(195, 155, 84);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('★ 100% PURE VEG & VEGAN · FRESH DAILY · REUSABLE DABBAS ★', pageWidth / 2, curY, {
    align: 'center',
  });

  curY += 6;
  doc.setTextColor(107, 142, 118);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    'Breakfast Plans · Lunch & Dinner Subscriptions · Occasional Orders',
    pageWidth / 2,
    curY,
    {
      align: 'center',
    }
  );

  // Footer Tagline
  const footY = pageHeight - 15;
  doc.setTextColor(30, 59, 43);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Order online anytime at domeal.co.uk', pageWidth / 2, footY, { align: 'center' });

  doc.save(filename);
}
