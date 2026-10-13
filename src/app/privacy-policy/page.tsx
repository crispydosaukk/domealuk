'use client';

import React, { useState, useEffect } from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import { getApiUrl } from '@/lib/api';
import { DEFAULT_PRIVACY_POLICY } from '@/lib/cms-legal-defaults';
import LegalContentRenderer from '@/components/LegalContentRenderer';

export default function PrivacyPolicy() {
  const [dynamicSettings, setDynamicSettings] = useState<any>(null);

  useEffect(() => {
    fetch(getApiUrl('/api/public-settings'), { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.privacySections || data.privacyTitle)) {
          setDynamicSettings(data);
        }
      })
      .catch((err) => console.warn('Public settings fetch note:', err));
  }, []);

  const pageTitle = dynamicSettings?.privacyTitle || DEFAULT_PRIVACY_POLICY.title;
  const lastUpdated = dynamicSettings?.privacyLastUpdated || DEFAULT_PRIVACY_POLICY.lastUpdated;
  const intro = dynamicSettings?.privacyIntro !== undefined 
    ? dynamicSettings.privacyIntro 
    : DEFAULT_PRIVACY_POLICY.intro;
  const sections =
    dynamicSettings?.privacySections && dynamicSettings.privacySections.length >= 10
      ? dynamicSettings.privacySections
      : DEFAULT_PRIVACY_POLICY.sections;

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
          {sections.map((sec: any, idx: number) => {
            const isOptional = sec.title?.toLowerCase().includes('optional');
            return (
              <section
                key={idx}
                className={
                  isOptional
                    ? 'bg-muted p-6 rounded-xl mt-8'
                    : 'space-y-3'
                }
              >
                <h2
                  className={
                    isOptional
                      ? 'text-xl font-bold mb-4 text-foreground'
                      : 'text-2xl font-bold mb-4 text-primary'
                  }
                >
                  {sec.title}
                </h2>
                <LegalContentRenderer content={sec.content} />
              </section>
            );
          })}
        </div>
      </main>

      <UserFooter />
    </div>
  );
}
