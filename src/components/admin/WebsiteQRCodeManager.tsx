'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Copy,
  ExternalLink,
  Printer,
  Sparkles,
  QrCode,
  FileText,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Palette,
  Layers,
  Share2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateQRCodeFlyerPdf, generateQRCodeStandeePdf } from '@/lib/qrCodePdfGenerator';

interface WebsiteQRCodeManagerProps {
  initialUrl?: string;
  onSaveUrl?: (url: string) => Promise<void>;
  isEmbeddedInSettings?: boolean;
}

const colorPresets = [
  { name: 'DoMeal Emerald', color: '#1E3B2B' },
  { name: 'DoMeal Gold', color: '#C39B54' },
  { name: 'Classic Black', color: '#000000' },
  { name: 'Slate Navy', color: '#1E293B' },
  { name: 'Warm Charcoal', color: '#27272A' },
];

const bgPresets = [
  { name: 'Pure White', color: '#FFFFFF' },
  { name: 'DoMeal Cream', color: '#FBFBF9' },
];

const urlPresets = [
  { label: 'Home Page', url: 'https://domeal.co.uk/' },
  { label: 'Today Menu', url: 'https://domeal.co.uk/menu' },
  { label: 'Student Deals', url: 'https://domeal.co.uk/student-discounts' },
  { label: 'Refer a Friend', url: 'https://domeal.co.uk/refer-a-friend' },
  { label: 'Corporate Catering', url: 'https://domeal.co.uk/corporate-catering' },
];

/**
 * Universal cross-browser rounded rectangle drawer
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Generates Pure QR code data URL (with optional DoMeal logo in center)
 */
async function generateQRDataUrl(
  targetUrl: string,
  options: {
    color: string;
    bgColor: string;
    includeLogo: boolean;
    errorLevel: 'M' | 'Q' | 'H';
    size?: number;
  }
): Promise<string> {
  const size = options.size || 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, targetUrl || 'https://domeal.co.uk/', {
    width: size,
    margin: 2,
    errorCorrectionLevel: options.errorLevel,
    color: {
      dark: options.color,
      light: options.bgColor === 'transparent' ? '#00000000' : options.bgColor,
    },
  });

  if (options.includeLogo) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      await new Promise<void>((resolve) => {
        const logo = new Image();
        logo.src = '/DOMEAL_Logo.png';

        const drawLogo = (imgElement: HTMLImageElement | null) => {
          const logoDiameter = size * 0.22;
          const center = size / 2;

          ctx.save();
          // White circular base
          ctx.beginPath();
          ctx.arc(center, center, logoDiameter / 2 + size * 0.012, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // Gold border
          ctx.lineWidth = Math.max(2, size * 0.008);
          ctx.strokeStyle = '#C39B54';
          ctx.stroke();

          if (imgElement && imgElement.naturalWidth > 0) {
            ctx.beginPath();
            ctx.arc(center, center, logoDiameter / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(
              imgElement,
              center - logoDiameter / 2,
              center - logoDiameter / 2,
              logoDiameter,
              logoDiameter
            );
          } else {
            // Elegant fallback badge
            ctx.beginPath();
            ctx.arc(center, center, logoDiameter / 2, 0, Math.PI * 2);
            ctx.fillStyle = '#1E3B2B';
            ctx.fill();
            ctx.fillStyle = '#C39B54';
            ctx.font = `bold ${Math.round(logoDiameter * 0.28)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('DoMeal', center, center);
          }
          ctx.restore();
          resolve();
        };

        if (logo.complete && logo.naturalWidth > 0) {
          drawLogo(logo);
        } else {
          logo.onload = () => drawLogo(logo);
          logo.onerror = () => drawLogo(null);
          // Safety timeout
          setTimeout(() => drawLogo(null), 800);
        }
      });
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Generates Branded Marketing Standee Card data URL
 */
async function generateCardDataUrl(
  qrDataUrl: string,
  targetUrl: string,
  scale: number = 1
): Promise<string> {
  const cWidth = Math.round(600 * scale);
  const cHeight = Math.round(780 * scale);
  const canvas = document.createElement('canvas');
  canvas.width = cWidth;
  canvas.height = cHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return qrDataUrl;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, cWidth, cHeight);

  // Outer Border
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2 * scale;
  drawRoundedRect(ctx, 4 * scale, 4 * scale, cWidth - 8 * scale, cHeight - 8 * scale, 16 * scale);
  ctx.stroke();

  // Header Banner (Forest Green)
  ctx.fillStyle = '#1E3B2B';
  drawRoundedRect(ctx, 4 * scale, 4 * scale, cWidth - 8 * scale, 120 * scale, 14 * scale);
  ctx.fill();
  ctx.fillRect(4 * scale, 80 * scale, cWidth - 8 * scale, 44 * scale);

  // Gold Line
  ctx.fillStyle = '#C39B54';
  ctx.fillRect(4 * scale, 124 * scale, cWidth - 8 * scale, 5 * scale);

  // Header Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(30 * scale)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('DOMEAL', cWidth / 2, 60 * scale);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = `${Math.round(13 * scale)}px sans-serif`;
  ctx.fillText('Authentic Home-Cooked Indian Meals · London, UK', cWidth / 2, 92 * scale);

  // Subheader
  ctx.fillStyle = '#1E3B2B';
  ctx.font = `bold ${Math.round(20 * scale)}px sans-serif`;
  ctx.fillText('SCAN TO ORDER OR VISIT OUR MENU', cWidth / 2, 175 * scale);

  ctx.fillStyle = '#6B8E76';
  ctx.font = `${Math.round(13 * scale)}px sans-serif`;
  ctx.fillText('Point your smartphone camera to access domeal.co.uk', cWidth / 2, 202 * scale);

  // QR Container Card
  const qrSize = Math.round(360 * scale);
  const qrX = Math.round((cWidth - qrSize) / 2);
  const qrY = Math.round(230 * scale);

  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, qrX - 12 * scale, qrY - 12 * scale, qrSize + 24 * scale, qrSize + 24 * scale, 16 * scale);
  ctx.fill();
  ctx.strokeStyle = '#C39B54';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  // Draw QR Image
  await new Promise<void>((resolve) => {
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      resolve();
    };
    qrImg.onerror = () => resolve();
    qrImg.src = qrDataUrl;
  });

  // URL under QR
  ctx.fillStyle = '#1E3B2B';
  ctx.font = `bold ${Math.round(16 * scale)}px sans-serif`;
  ctx.fillText(targetUrl || 'https://domeal.co.uk/', cWidth / 2, qrY + qrSize + 46 * scale);

  // Highlights
  ctx.fillStyle = '#C39B54';
  ctx.font = `bold ${Math.round(11 * scale)}px sans-serif`;
  ctx.fillText(
    '★ 100% PURE VEG & VEGAN · FRESH DAILY · REUSABLE PACKAGING ★',
    cWidth / 2,
    qrY + qrSize + 72 * scale
  );

  // Footer bar
  ctx.fillStyle = '#F8FAFC';
  drawRoundedRect(ctx, 4 * scale, cHeight - 48 * scale, cWidth - 8 * scale, 44 * scale, 14 * scale);
  ctx.fill();
  ctx.fillRect(4 * scale, cHeight - 48 * scale, cWidth - 8 * scale, 20 * scale);

  ctx.fillStyle = '#94A3B8';
  ctx.font = `${Math.round(11 * scale)}px sans-serif`;
  ctx.fillText('Fast London-Wide Scheduled Delivery · domeal.co.uk', cWidth / 2, cHeight - 20 * scale);

  return canvas.toDataURL('image/png');
}

export default function WebsiteQRCodeManager({
  initialUrl = 'https://domeal.co.uk/',
  onSaveUrl,
  isEmbeddedInSettings = false,
}: WebsiteQRCodeManagerProps) {
  const [targetUrl, setTargetUrl] = useState(initialUrl);
  const [qrColor, setQrColor] = useState('#1E3B2B');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [errorLevel, setErrorLevel] = useState<'M' | 'Q' | 'H'>('H');
  const [previewMode, setPreviewMode] = useState<'card' | 'clean'>('card');
  const [downloadSize, setDownloadSize] = useState<number>(1024);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isSavingUrl, setIsSavingUrl] = useState(false);

  // Previews as data URLs
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [cardDataUrl, setCardDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  useEffect(() => {
    if (initialUrl && initialUrl !== targetUrl) {
      setTargetUrl(initialUrl);
    }
  }, [initialUrl]);

  // Generate previews whenever settings change
  useEffect(() => {
    let isCancelled = false;
    setIsGenerating(true);

    const generatePreviews = async () => {
      try {
        const qrUrl = await generateQRDataUrl(targetUrl, {
          color: qrColor,
          bgColor,
          includeLogo,
          errorLevel,
          size: 512,
        });

        if (isCancelled) return;
        setQrDataUrl(qrUrl);

        const cardUrl = await generateCardDataUrl(qrUrl, targetUrl, 1);
        if (isCancelled) return;
        setCardDataUrl(cardUrl);
      } catch (err) {
        console.error('Error generating previews:', err);
      } finally {
        if (!isCancelled) {
          setIsGenerating(false);
        }
      }
    };

    generatePreviews();

    return () => {
      isCancelled = true;
    };
  }, [targetUrl, qrColor, bgColor, includeLogo, errorLevel]);

  // 1. Download as PNG
  const handleDownloadPng = async (isStandeeCard: boolean) => {
    try {
      setDownloadingFormat(isStandeeCard ? 'png-card' : 'png-clean');

      let downloadDataUrl = '';
      if (!isStandeeCard) {
        downloadDataUrl = await generateQRDataUrl(targetUrl, {
          color: qrColor,
          bgColor,
          includeLogo,
          errorLevel,
          size: downloadSize,
        });
      } else {
        const baseQr = await generateQRDataUrl(targetUrl, {
          color: qrColor,
          bgColor,
          includeLogo,
          errorLevel,
          size: Math.round(downloadSize * 0.6),
        });
        downloadDataUrl = await generateCardDataUrl(baseQr, targetUrl, downloadSize / 600);
      }

      const link = document.createElement('a');
      link.download = isStandeeCard
        ? `domeal-standee-qr-${downloadSize}px.png`
        : `domeal-website-qr-${downloadSize}px.png`;
      link.href = downloadDataUrl;
      link.click();
      toast.success(
        isStandeeCard
          ? 'Branded QR Standee image downloaded successfully!'
          : 'High-res QR Code image downloaded!'
      );
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PNG image.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  // 2. Download as SVG
  const handleDownloadSvg = async () => {
    try {
      setDownloadingFormat('svg');
      const svgString = await QRCode.toString(targetUrl || 'https://domeal.co.uk/', {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: qrColor,
          light: bgColor === 'transparent' ? '#00000000' : bgColor,
        },
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'domeal-website-qr-vector.svg';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Vector SVG QR code downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate SVG.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  // 3. Download A4 Flyer PDF
  const handleDownloadFlyerPdf = async () => {
    try {
      setDownloadingFormat('pdf-flyer');
      const qrForPdf = await generateQRDataUrl(targetUrl, {
        color: qrColor,
        bgColor: '#FFFFFF',
        includeLogo,
        errorLevel,
        size: 1024,
      });

      await generateQRCodeFlyerPdf({
        qrDataUrl: qrForPdf,
        targetUrl,
        filename: 'domeal-marketing-flyer-a4.pdf',
      });
      toast.success('Print-ready A4 promotional flyer PDF downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate Flyer PDF.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  // 4. Download Standee / Tent Card PDF
  const handleDownloadStandeePdf = async () => {
    try {
      setDownloadingFormat('pdf-standee');
      const qrForPdf = await generateQRDataUrl(targetUrl, {
        color: qrColor,
        bgColor: '#FFFFFF',
        includeLogo,
        errorLevel,
        size: 1024,
      });

      await generateQRCodeStandeePdf({
        qrDataUrl: qrForPdf,
        targetUrl,
        filename: 'domeal-counter-standee-a5.pdf',
      });
      toast.success('Print-ready Counter Standee PDF downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate Standee PDF.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  // 5. Copy PNG to Clipboard
  const handleCopyImage = async () => {
    try {
      const dataUrl = previewMode === 'card' ? cardDataUrl : qrDataUrl;
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      setCopiedImage(true);
      toast.success('QR code image copied to clipboard!');
      setTimeout(() => setCopiedImage(false), 2500);
    } catch (clipErr) {
      toast.info('Clipboard access restricted. Use the Download button instead.');
    }
  };

  // 6. Copy URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    toast.success('Target URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // 7. Instant Print
  const handlePrint = () => {
    const dataUrl = previewMode === 'card' ? cardDataUrl : qrDataUrl;
    const printWin = window.open('', '_blank');
    if (!printWin) {
      toast.error('Please allow popups to print the QR code.');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print DoMeal QR Code</title>
          <style>
            @page {
              size: auto;
              margin: 15mm;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
              margin: 0;
              padding: 20px;
              color: #1E3B2B;
            }
            img {
              max-width: 90%;
              max-height: 80vh;
              object-fit: contain;
              border-radius: 8px;
            }
            .info {
              margin-top: 15px;
              font-size: 14px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="DoMeal QR Code" />
          <div class="info">Website: ${targetUrl} · Authentic Home-Cooked Indian Meals</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // 8. Save URL to settings if embedded
  const handleSaveToSettings = async () => {
    if (!onSaveUrl) return;
    setIsSavingUrl(true);
    try {
      await onSaveUrl(targetUrl);
      toast.success('QR target URL saved to settings!');
    } catch (e) {
      toast.error('Failed to save target URL.');
    } finally {
      setIsSavingUrl(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Description */}
      <div className="bg-gradient-to-r from-[#1E3B2B] to-[#2B543D] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-[#C39B54] text-[#1E3B2B] text-xs font-800 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              <Sparkles size={13} />
              Marketing & Storefront Tools
            </div>
            <h2 className="text-2xl font-800 text-white tracking-tight">
              Website QR Code Generator
            </h2>
            <p className="text-sm text-green-100/90 max-w-2xl">
              Generates an instant QR code redirecting customers to{' '}
              <span className="font-700 text-[#F1DC9B]">https://domeal.co.uk/</span>. Download in
              high-resolution PNG image, vector SVG, or print-ready A4 flyer and table standee PDFs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white font-700 text-xs px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5 backdrop-blur-sm border border-white/20"
            >
              <ExternalLink size={14} />
              Test Destination
            </a>
            <button
              onClick={handlePrint}
              className="bg-[#C39B54] hover:bg-[#B38942] text-[#1E3B2B] font-800 text-xs px-4 py-2.5 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5 active:scale-95"
            >
              <Printer size={14} />
              Quick Print
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Controls & Configurations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target URL Card */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-800 text-sm text-[#1E3B2B] uppercase tracking-wider flex items-center gap-2">
                <QrCode size={16} className="text-[#C39B54]" />
                1. Target URL (Where QR code redirects)
              </h3>
              <button
                onClick={() => setTargetUrl('https://domeal.co.uk/')}
                className="text-xs text-muted-foreground hover:text-primary font-600 inline-flex items-center gap-1 transition-colors"
                title="Reset to default domeal.co.uk"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>

            <div>
              <div className="relative">
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://domeal.co.uk/"
                  className="w-full border-2 border-border focus:border-primary rounded-xl pl-4 pr-24 py-3 text-sm font-700 text-foreground transition-all outline-none"
                />
                <button
                  onClick={handleCopyUrl}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-muted/60 hover:bg-muted text-foreground text-xs font-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Scanning this QR code with any smartphone camera will automatically open this link.
              </p>
            </div>

            {/* URL Presets */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <label className="text-xs font-700 text-muted-foreground">Quick Presets:</label>
              <div className="flex flex-wrap gap-2">
                {urlPresets.map((preset) => (
                  <button
                    key={preset.url}
                    onClick={() => setTargetUrl(preset.url)}
                    className={`text-xs font-700 px-3 py-1.5 rounded-lg transition-all border ${
                      targetUrl === preset.url
                        ? 'bg-[#1E3B2B] text-white border-[#1E3B2B] shadow-sm'
                        : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setTargetUrl(
                      'https://domeal.co.uk/?utm_source=qr_flyer&utm_medium=print&utm_campaign=table_standee'
                    )
                  }
                  className="text-xs font-700 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all"
                >
                  + Add Campaign Tracking (UTM)
                </button>
              </div>
            </div>

            {isEmbeddedInSettings && onSaveUrl && (
              <div className="pt-2">
                <button
                  onClick={handleSaveToSettings}
                  disabled={isSavingUrl}
                  className="bg-muted hover:bg-muted/80 text-foreground font-700 text-xs px-4 py-2 rounded-xl border border-border transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Share2 size={13} />
                  {isSavingUrl ? 'Saving URL...' : 'Save this as Default Storefront URL'}
                </button>
              </div>
            )}
          </div>

          {/* Design & Style Customization */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5">
            <h3 className="font-800 text-sm text-[#1E3B2B] uppercase tracking-wider flex items-center gap-2">
              <Palette size={16} className="text-[#C39B54]" />
              2. Design & Branding Options
            </h3>

            {/* Logo in Center Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-muted/20 border border-border rounded-xl">
              <div className="space-y-0.5">
                <div className="font-700 text-sm text-foreground flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C39B54]" />
                  Embed DoMeal Logo in Center
                </div>
                <p className="text-xs text-muted-foreground">
                  Displays official DoMeal badge in the center of the QR code with high error
                  correction.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLogo}
                  onChange={(e) => setIncludeLogo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E3B2B]"></div>
              </label>
            </div>

            {/* QR Code Foreground Color */}
            <div className="space-y-2">
              <label className="text-xs font-800 text-muted-foreground uppercase tracking-wide">
                QR Foreground Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setQrColor(preset.color)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-700 transition-all ${
                      qrColor === preset.color
                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                        : 'border-border bg-white text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    {preset.name}
                  </button>
                ))}
                {/* Custom Color Input */}
                <div className="flex items-center gap-1 border-2 border-border rounded-xl px-2 py-1 bg-white">
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                    title="Choose custom color"
                  />
                  <span className="text-xs font-mono font-700 uppercase">{qrColor}</span>
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-xs font-800 text-muted-foreground uppercase tracking-wide">
                QR Background Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {bgPresets.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setBgColor(preset.color)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-700 transition-all ${
                      bgColor === preset.color
                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                        : 'border-border bg-white text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    {preset.name}
                  </button>
                ))}
                <button
                  onClick={() => setBgColor('transparent')}
                  className={`px-3 py-1.5 rounded-xl border-2 text-xs font-700 transition-all ${
                    bgColor === 'transparent'
                      ? 'border-primary bg-primary/5 text-primary shadow-sm'
                      : 'border-border bg-white text-muted-foreground hover:bg-muted/30'
                  }`}
                >
                  Transparent Background
                </button>
              </div>
            </div>

            {/* Resolution Selector for PNG */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-800 text-muted-foreground uppercase tracking-wide">
                  Export PNG Resolution
                </label>
                <span className="text-xs text-muted-foreground">
                  {downloadSize === 2048 ? 'Print Quality (300 DPI)' : 'Screen & Digital'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { size: 512, label: '512 x 512 px', sub: 'Standard' },
                  { size: 1024, label: '1024 x 1024 px', sub: 'High-Res' },
                  { size: 2048, label: '2048 x 2048 px', sub: 'Ultra Print' },
                ].map((s) => (
                  <button
                    key={s.size}
                    onClick={() => setDownloadSize(s.size)}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                      downloadSize === s.size
                        ? 'border-primary bg-primary/5 text-primary font-800'
                        : 'border-border bg-white text-muted-foreground hover:bg-muted/30 font-600'
                    }`}
                  >
                    <div className="text-xs">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground">{s.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Download Action Hub */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-800 text-sm text-[#1E3B2B] uppercase tracking-wider flex items-center gap-2">
              <Download size={16} className="text-[#C39B54]" />
              3. Download & Export
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Download PNG: Standee Card */}
              <button
                onClick={() => handleDownloadPng(true)}
                disabled={downloadingFormat !== null}
                className="flex items-start gap-3 p-4 rounded-xl border-2 border-border hover:border-primary/60 bg-white hover:bg-primary/5 transition-all text-left shadow-sm active:scale-98 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <div className="font-800 text-sm text-foreground">Download Card (.PNG)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Standee card with DoMeal header, instructions & borders
                  </div>
                </div>
              </button>

              {/* Download PNG: Clean QR Only */}
              <button
                onClick={() => handleDownloadPng(false)}
                disabled={downloadingFormat !== null}
                className="flex items-start gap-3 p-4 rounded-xl border-2 border-border hover:border-primary/60 bg-white hover:bg-primary/5 transition-all text-left shadow-sm active:scale-98 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <QrCode size={20} />
                </div>
                <div>
                  <div className="font-800 text-sm text-foreground">Download Pure QR (.PNG)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Clean QR code only ({downloadSize}px), ideal for custom designs
                  </div>
                </div>
              </button>

              {/* Download A4 Marketing Flyer PDF */}
              <button
                onClick={handleDownloadFlyerPdf}
                disabled={downloadingFormat !== null}
                className="flex items-start gap-3 p-4 rounded-xl border-2 border-[#1E3B2B] bg-[#1E3B2B] hover:bg-[#2B543D] text-white transition-all text-left shadow-md active:scale-98 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-800 text-sm text-white">Download A4 Flyer (.PDF)</div>
                  <div className="text-xs text-green-100/90 mt-0.5">
                    Full-page promotional poster with perks & scan instructions
                  </div>
                </div>
              </button>

              {/* Download Table Standee A5 PDF */}
              <button
                onClick={handleDownloadStandeePdf}
                disabled={downloadingFormat !== null}
                className="flex items-start gap-3 p-4 rounded-xl border-2 border-[#C39B54] bg-[#C39B54]/10 hover:bg-[#C39B54]/20 transition-all text-left shadow-sm active:scale-98 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-[#C39B54] text-[#1E3B2B] flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-800 text-sm text-[#1E3B2B]">
                    Download Standee (.PDF)
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    A5 format for restaurant counters, table tents & dabba inserts
                  </div>
                </div>
              </button>

              {/* Download SVG Vector */}
              <button
                onClick={handleDownloadSvg}
                disabled={downloadingFormat !== null}
                className="flex items-start gap-3 p-4 rounded-xl border-2 border-border hover:border-primary/60 bg-white hover:bg-primary/5 transition-all text-left shadow-sm active:scale-98 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                  <Layers size={20} />
                </div>
                <div>
                  <div className="font-800 text-sm text-foreground">Download Vector (.SVG)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Infinitely scalable vector format for banners & print shops
                  </div>
                </div>
              </button>

              {/* Copy Image to Clipboard */}
              <button
                onClick={handleCopyImage}
                className="flex items-start gap-3 p-4 rounded-xl border-2 border-border hover:border-primary/60 bg-white hover:bg-primary/5 transition-all text-left shadow-sm active:scale-98"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                  {copiedImage ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                </div>
                <div>
                  <div className="font-800 text-sm text-foreground">
                    {copiedImage ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Paste directly into WhatsApp, Slack, emails, or Canva
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Visual Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-6 space-y-4">
            {/* Preview Mode Selector */}
            <div className="flex items-center justify-between">
              <h3 className="font-800 text-sm text-[#1E3B2B] uppercase tracking-wider">
                Live Preview
              </h3>
              <div className="inline-flex p-1 bg-muted rounded-xl border border-border">
                <button
                  onClick={() => setPreviewMode('card')}
                  className={`px-3 py-1 text-xs font-700 rounded-lg transition-all ${
                    previewMode === 'card'
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Card Format
                </button>
                <button
                  onClick={() => setPreviewMode('clean')}
                  className={`px-3 py-1 text-xs font-700 rounded-lg transition-all ${
                    previewMode === 'clean'
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Pure QR
                </button>
              </div>
            </div>

            {/* Visual Display via responsive Image */}
            <div className="flex items-center justify-center p-4 bg-muted/20 border border-border/80 rounded-2xl min-h-[380px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <span className="text-xs font-600">Generating preview...</span>
                </div>
              ) : previewMode === 'card' ? (
                cardDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={cardDataUrl}
                    alt="DoMeal Storefront Card"
                    className="max-w-full h-auto rounded-xl shadow-lg border border-border/80 object-contain mx-auto"
                    style={{ maxHeight: '420px', aspectRatio: '600/780' }}
                  />
                ) : null
              ) : (
                <div className="p-6 bg-white rounded-2xl shadow-md border border-border inline-block text-center w-full max-w-[320px]">
                  {qrDataUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qrDataUrl}
                      alt="DoMeal QR Code"
                      className="w-56 h-56 mx-auto object-contain rounded-lg aspect-square"
                    />
                  )}
                  <div className="text-center mt-3 pt-3 border-t border-border">
                    <p className="font-800 text-xs text-foreground truncate max-w-[260px] mx-auto">
                      {targetUrl}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Scan with smartphone camera</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions underneath Preview */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDownloadPng(previewMode === 'card')}
                className="w-full bg-[#1E3B2B] hover:bg-[#2B543D] text-white font-800 text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Download size={14} />
                Download Image
              </button>
              <button
                onClick={handleDownloadFlyerPdf}
                className="w-full bg-[#C39B54] hover:bg-[#B38942] text-[#1E3B2B] font-800 text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <FileText size={14} />
                Download PDF
              </button>
            </div>

            {/* Test Link and info */}
            <div className="p-3 bg-muted/30 rounded-xl border border-border text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between font-700 text-foreground">
                <span>Destination Verified</span>
                <span className="text-green-600 flex items-center gap-1">
                  <Check size={12} /> Active
                </span>
              </div>
              <div className="truncate text-[11px] text-primary font-600">{targetUrl}</div>
              <p className="text-[10px] text-muted-foreground pt-1">
                Upon scanning, users will be taken directly to this address. All downloads are
                generated locally at full print quality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
