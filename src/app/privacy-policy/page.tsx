import React from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <UserNavbar />
      
      <main className="flex-grow pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-extrabold text-foreground mb-4">DoMeal Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: 24 February 2026</p>

        <div className="space-y-10 text-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">1. Who we are</h2>
            <p className="mb-2">This website and our services are operated by DoMeal.</p>
            <p className="mb-2"><strong>Registered office:</strong> 196, Kenton Road, Kenton, Harrow, Middlesex, Next to picknsave super market, HA3 8BX</p>
            <p className="mb-2"><strong>Email:</strong> orders@domeal.co.uk</p>
            <p>For data protection purposes, we are the data controller for the personal data described in this Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">2. What this policy covers</h2>
            <p className="mb-4">This Privacy Policy explains how we collect, use, share, and protect your personal data when you:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>visit our website</li>
              <li>place an order or subscribe</li>
              <li>contact customer support</li>
              <li>enter a competition or promotion</li>
              <li>interact with our marketing, ads, and analytics tools</li>
            </ul>
            <p>This policy should be read alongside our Terms of Service, Terms of Business (Subscriptions), and any cookie information shown on our site.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">3. The personal data we collect</h2>
            <p className="mb-4 font-bold">Information you give us</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>name, email address, phone number</li>
              <li>delivery address and postcode</li>
              <li>account login details, if you create an account</li>
              <li>order history and subscription preferences</li>
              <li>dietary notes you choose to provide</li>
              <li>communications with us, including emails and messages</li>
              <li>competition entries and any information required to administer prizes</li>
            </ul>

            <p className="mb-4 font-bold">Information we collect automatically when you use our site</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>device and browser information</li>
              <li>IP address and approximate location derived from IP</li>
              <li>pages visited, clicks, time on site, and referral source</li>
              <li>cookie and tracking data, depending on your cookie choices</li>
            </ul>

            <p className="mb-4 font-bold">Information from third parties</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>payment confirmation and dispute information from payment providers</li>
              <li>delivery status information from couriers or delivery platforms</li>
              <li>advertising and attribution data from platforms like Meta and Google, where cookies or similar technologies are enabled based on your preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">4. Why we use your data and our lawful bases</h2>
            <p className="mb-4">UK data protection law requires us to have a lawful basis for using personal data. The main bases we rely on are the following.</p>
            
            <p className="mb-2 font-bold">Contract. to provide your order and subscription</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>process orders and payments</li>
              <li>deliver your meals and manage any tiffin related returns where relevant</li>
              <li>manage your subscription, skips, pauses, and cancellations</li>
              <li>provide customer support and service communications</li>
            </ul>

            <p className="mb-2 font-bold">Legitimate interests. to run and improve our business</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>prevent fraud and misuse of our services</li>
              <li>maintain website security and performance</li>
              <li>understand how customers use our site and improve user experience</li>
              <li>manage complaints and resolve disputes</li>
              <li>invite feedback and reviews about your purchase, where appropriate</li>
            </ul>

            <p className="mb-2 font-bold">Legal obligation. to comply with law</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>accounting, tax, and regulatory obligations</li>
              <li>responding to lawful requests from regulators or law enforcement</li>
            </ul>

            <p className="mb-2 font-bold">Consent. where required</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>sending marketing emails and SMS where you have opted in</li>
              <li>using non essential cookies and similar technologies, where consent is required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">5. Service communications versus marketing</h2>
            <p className="mb-4">Service communications are messages we send to deliver the service you asked for. For example. order confirmations, billing notices, delivery tracking, operational updates, changes to delivery windows, and customer support messages. These are not marketing.</p>
            <p>Marketing communications include emails or texts about offers, new products, and promotions. We will only send these where we have a valid lawful basis. Usually consent, or soft opt in where it applies. You can unsubscribe at any time using the link in our emails or by contacting orders@domeal.co.uk.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">6. Who we share your data with</h2>
            <p className="mb-4">We share personal data with trusted service providers where needed to operate DoMeal. These include:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>E commerce and subscriptions:</strong> platforms and subscription tools used on our site</li>
              <li><strong>Payments:</strong> payment processors and fraud prevention tools</li>
              <li><strong>Delivery and logistics:</strong> couriers and delivery partners, including sharing your phone number where needed to complete delivery</li>
              <li><strong>Customer service:</strong> support inbox tools and related systems</li>
              <li><strong>Email and messaging:</strong> email marketing and service message providers</li>
              <li><strong>Analytics and performance:</strong> analytics and tag management tools</li>
              <li><strong>Advertising:</strong> platforms that help us measure and deliver ads, where enabled in line with your choices</li>
              <li><strong>Accounting:</strong> finance and bookkeeping tools</li>
              <li><strong>Feedback and reviews:</strong> review platforms, where used</li>
            </ul>
            <p className="mb-4"><strong>AI and LLMs:</strong> We use AI services to provide customer support, personalise your experience, or analyse data. To do this, we may process your name and email address alongside any specific prompts or information you provide directly to the AI. Please be advised that our AI service providers do not use your submitted data, inputs, or outputs to train or improve their foundational AI models. Your information remains strictly segregated for our organisation's use. We will not use your personal data or conversation inputs to train or improve third-party AI models.</p>
            <p className="font-bold">We do not sell your personal data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">7. International transfers</h2>
            <p>Some of our suppliers process data outside the UK. When we transfer personal data internationally, we use appropriate safeguards where required. This typically includes contractual protections such as the UK International Data Transfer Agreement, or the UK Addendum to the EU Standard Contractual Clauses.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">8. How long we keep your data</h2>
            <p className="mb-4">We keep personal data only for as long as needed for the purposes described in this policy.</p>
            <p className="mb-4">Typical retention periods depend on the context. For example:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>orders and payments may be retained for accounting and tax purposes</li>
              <li>customer support records may be retained to manage queries, complaints, and quality investigations</li>
              <li>marketing data is retained until you unsubscribe, or we no longer need it for the purpose collected</li>
              <li>analytics and cookie data is retained in line with tool settings and your cookie choices</li>
            </ul>
            <p>If you want more detail on retention periods for specific categories, email orders@domeal.co.uk.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">9. Your rights</h2>
            <p className="mb-4">You have rights in relation to your personal data, subject to certain legal conditions. These include the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>access your personal data</li>
              <li>correct inaccurate data</li>
              <li>request deletion of your data in certain circumstances</li>
              <li>restrict or object to certain processing</li>
              <li>data portability in certain circumstances</li>
              <li>withdraw consent at any time where we rely on consent</li>
              <li>complain to the Information Commissioner’s Office, ICO</li>
            </ul>
            <p>To exercise your rights, contact orders@domeal.co.uk. We may need to verify your identity before responding.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">10. Cookies, pixels, and similar technologies</h2>
            <p className="mb-4">We use cookies and similar technologies, including pixels and tags, to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>make the website work and enable checkout</li>
              <li>remember preferences</li>
              <li>understand site usage and improve performance</li>
              <li>measure marketing performance and show relevant ads, where enabled</li>
            </ul>
            <p>Some cookies are strictly necessary for the website to function. Others, such as analytics and marketing cookies, may be optional and will depend on your cookie choices. You can manage your preferences through the cookie banner and by adjusting browser settings. Please note that disabling certain cookies may affect site functionality.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">11. Security</h2>
            <p className="mb-4">We take appropriate technical and organisational measures to protect personal data. However, no method of transmission over the internet is completely secure. Any transmission is at your own risk.</p>
            <p>Where you have a password for your account, you are responsible for keeping it confidential.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">12. Links to other websites and social media</h2>
            <p>Our website may include links to other websites or social media platforms. Once you leave our site, we do not control those sites and are not responsible for their privacy practices. Please review their privacy policies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">13. Changes to this policy</h2>
            <p>We may update this Privacy Policy from time to time. We will post the updated version on this page and update the "Last updated" date above.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">14. Contact us</h2>
            <p>If you have any questions about this Privacy Policy or how we handle your personal data, contact: orders@domeal.co.uk</p>
          </section>

          <section className="bg-muted p-6 rounded-xl mt-12">
            <h2 className="text-xl font-bold mb-4 text-foreground">Optional section. Tools we may use</h2>
            <p>We use third party tools to operate our website, deliver orders, process payments, send emails, measure performance, and manage advertising. These tools may change over time. Current or recent tools may include payment providers, email marketing platforms, Google Tag Manager, Google Analytics, Meta Pixel, Hotjar, and accounting tools.</p>
          </section>
        </div>
      </main>

      <UserFooter />
    </div>
  );
}
