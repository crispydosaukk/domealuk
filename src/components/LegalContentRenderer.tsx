import React from 'react';

interface LegalContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Formats inline bold text (**bold**) and email links
 */
function renderInlineFormatting(text: string) {
  // Split on bold text pattern: **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-bold text-foreground">{renderEmailLinks(boldText)}</strong>;
    }
    return <React.Fragment key={index}>{renderEmailLinks(part)}</React.Fragment>;
  });
}

/**
 * Finds email addresses and converts them to mailto links
 */
function renderEmailLinks(text: string) {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const parts = text.split(emailRegex);

  return parts.map((part, index) => {
    if (part.match(emailRegex)) {
      return (
        <a
          key={index}
          href={`mailto:${part}`}
          className="text-primary hover:underline font-medium"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function LegalContentRenderer({
  content,
  className = 'space-y-4 text-foreground leading-relaxed',
}: LegalContentRendererProps) {
  if (!content) return null;

  // Split by double line breaks into logical blocks
  const rawBlocks = content.split(/\n\s*\n/);

  return (
    <div className={className}>
      {rawBlocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Check if block starts with heading 3: ### Heading
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^###\s+/, '');
          return (
            <h3 key={blockIdx} className="text-xl font-bold mb-2 text-foreground pt-2">
              {renderInlineFormatting(headingText)}
            </h3>
          );
        }

        // Check if block is a bullet list (lines starting with - , * , or • )
        const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
        const isBulletList = lines.length > 0 && lines.every((l) => /^[-*•]\s+/.test(l));

        if (isBulletList) {
          return (
            <ul key={blockIdx} className="list-disc pl-6 space-y-2 mb-4">
              {lines.map((line, lineIdx) => {
                const itemText = line.replace(/^[-*•]\s+/, '');
                return <li key={lineIdx}>{renderInlineFormatting(itemText)}</li>;
              })}
            </ul>
          );
        }

        // Check if block is an alpha list (lines starting with a. , b. )
        const isAlphaList = lines.length > 0 && lines.every((l) => /^[a-z]\.\s+/i.test(l));
        if (isAlphaList) {
          return (
            <ul key={blockIdx} className="list-[lower-alpha] pl-6 space-y-2 mb-4">
              {lines.map((line, lineIdx) => {
                const itemText = line.replace(/^[a-z]\.\s+/i, '');
                return <li key={lineIdx}>{renderInlineFormatting(itemText)}</li>;
              })}
            </ul>
          );
        }

        // Mixed block: contains a heading inside it or multiple single-line items
        // Process line by line if lines contain ###
        if (trimmed.includes('### ')) {
          const sublines = trimmed.split('\n');
          const elements: React.ReactNode[] = [];
          let currentBullets: string[] = [];
          let currentAlphas: string[] = [];

          const flushBullets = (keyPrefix: string) => {
            if (currentBullets.length > 0) {
              elements.push(
                <ul key={`${keyPrefix}-b`} className="list-disc pl-6 space-y-2 mb-4">
                  {currentBullets.map((b, i) => (
                    <li key={i}>{renderInlineFormatting(b)}</li>
                  ))}
                </ul>
              );
              currentBullets = [];
            }
          };

          const flushAlphas = (keyPrefix: string) => {
            if (currentAlphas.length > 0) {
              elements.push(
                <ul key={`${keyPrefix}-a`} className="list-[lower-alpha] pl-6 space-y-2 mb-4">
                  {currentAlphas.map((a, i) => (
                    <li key={i}>{renderInlineFormatting(a)}</li>
                  ))}
                </ul>
              );
              currentAlphas = [];
            }
          };

          sublines.forEach((line, lineIdx) => {
            const lTrim = line.trim();
            if (!lTrim) return;

            if (lTrim.startsWith('### ')) {
              flushBullets(`flush-${lineIdx}`);
              flushAlphas(`flush-${lineIdx}`);
              elements.push(
                <h3 key={lineIdx} className="text-xl font-bold mb-2 text-foreground pt-2">
                  {renderInlineFormatting(lTrim.replace(/^###\s+/, ''))}
                </h3>
              );
            } else if (/^[-*•]\s+/.test(lTrim)) {
              flushAlphas(`flush-${lineIdx}`);
              currentBullets.push(lTrim.replace(/^[-*•]\s+/, ''));
            } else if (/^[a-z]\.\s+/i.test(lTrim)) {
              flushBullets(`flush-${lineIdx}`);
              currentAlphas.push(lTrim.replace(/^[a-z]\.\s+/i, ''));
            } else {
              flushBullets(`flush-${lineIdx}`);
              flushAlphas(`flush-${lineIdx}`);
              elements.push(
                <p key={lineIdx} className="mb-4 text-foreground leading-relaxed">
                  {renderInlineFormatting(lTrim)}
                </p>
              );
            }
          });

          flushBullets('end');
          flushAlphas('end');

          return <div key={blockIdx} className="space-y-3">{elements}</div>;
        }

        // Regular paragraph block
        return (
          <p key={blockIdx} className="mb-4 text-foreground leading-relaxed">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
