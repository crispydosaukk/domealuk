'use client';

import React, { useState, useEffect } from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import { getApiUrl } from '@/lib/api';
import { DEFAULT_TERMS_BUSINESS } from '@/lib/cms-legal-defaults';
import LegalContentRenderer from '@/components/LegalContentRenderer';

export default function TermsOfBusiness() {
  const [dynamicSettings, setDynamicSettings] = useState<any>(null);

  useEffect(() => {
    fetch(getApiUrl('/api/public-settings'), { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.termsBusinessSections || data.termsBusinessTitle)) {
          setDynamicSettings(data);
        }
      })
      .catch((err) => console.warn('Public settings fetch note:', err));
  }, []);

  const pageTitle = dynamicSettings?.termsBusinessTitle || DEFAULT_TERMS_BUSINESS.title;
  const lastUpdated = dynamicSettings?.termsBusinessLastUpdated || DEFAULT_TERMS_BUSINESS.lastUpdated;
  const intro = dynamicSettings?.termsBusinessIntro !== undefined 
    ? dynamicSettings.termsBusinessIntro 
    : DEFAULT_TERMS_BUSINESS.intro;
  const sections =
    dynamicSettings?.termsBusinessSections && dynamicSettings.termsBusinessSections.length >= 10
      ? dynamicSettings.termsBusinessSections
      : DEFAULT_TERMS_BUSINESS.sections;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <UserNavbar />

      <main className="flex-grow pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-extrabold text-foreground mb-4">
          {pageTitle}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: {lastUpdated}
        </p>

        {intro ? (
          <div className="mb-8 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
            <LegalContentRenderer content={intro} />
          </div>
        ) : null}

        <div className="space-y-10 text-foreground leading-relaxed">
          {sections.map((sec: any, idx: number) => (
            <section key={idx} className="space-y-3">
              <h2 className="text-2xl font-bold mb-4 text-primary">{sec.title}</h2>
              <LegalContentRenderer content={sec.content} />
            </section>
          ))}
        </div>
      </main>

      <UserFooter />
    </div>
  );
}
