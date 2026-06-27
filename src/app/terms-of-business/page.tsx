import React from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';

export default function TermsOfBusiness() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <UserNavbar />
      
      <main className="flex-grow pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-extrabold text-foreground mb-4">Terms of Business (Subscriptions)</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: 24 February 2026</p>

        <div className="space-y-10 text-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">1. Introduction</h2>
            <p className="mb-4">Welcome to our website. To avoid misunderstandings, please read these Terms of Business carefully. These Terms apply to DoMeal subscriptions supplied to you through our website and should be read in conjunction with our Privacy Policy, which also applies.</p>
            <p>You will be asked to expressly agree to these Terms of Business before you subscribe to DoMeal from our website.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">2. Information about us</h2>
            <p className="mb-2">Our full name is DoMeal. We are registered in England and Wales.</p>
            <p className="mb-2"><strong>Registered office:</strong> No 1 Sedgecombe Avenue, Kenton, HA3 0HW</p>
            <p><strong>Email:</strong> orders@domeal.co.uk</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">3. Order process and eligibility</h2>
            <p className="mb-4">For the steps you need to take in order to sign up to DoMeal, please see our FAQs page. The minimum order is the Weekly DoMeal plan.</p>
            <p>You must be at least 18 years of age to buy a DoMeal delivery. If you are purchasing on behalf of a business, you confirm you have authority to bind that business to these Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">4. The DoMeal meals</h2>
            <p className="mb-6">The DoMeal menus are set out on our website.</p>

            <h3 className="text-xl font-bold mb-2">Allergens and dietary information</h3>
            <p className="mb-6">If you suffer from any food allergies or intolerances, you must check the ingredient and allergen information for the specific meals and week you are ordering. Recipes can change. If you are in any doubt, please contact us before ordering and before delivery. If you have a severe allergy, please contact us before ordering. We cannot guarantee an allergen free environment.</p>

            <h3 className="text-xl font-bold mb-2">Packaging, collection and returns of tiffins</h3>
            <p className="mb-6">Your DoMeal meal will be delivered in a reusable tiffin box. We collect your tiffin at your next DoMeal delivery. Please ensure it is washed and clean and left out for collection in your nominated safe place.</p>

            <h3 className="text-xl font-bold mb-2">Storage and reheating</h3>
            <p>Your delivery is ready to heat. It will be delivered chilled with ice packs and must be placed in the fridge within 1 hour of delivery, or heated immediately. Storage, cooking and reheating instructions must be followed closely. Make sure reheated food is piping hot throughout. We cannot accept liability for any issues arising from food being left out or handled contrary to these instructions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">5. Price, tiffin fee and payment</h2>
            <p className="mb-6">Prices for our DoMeal plans and extra dishes are quoted on our website and include VAT where applicable.</p>

            <h3 className="text-xl font-bold mb-2">Subscription billing</h3>
            <p className="mb-4">Payment is collected automatically at the 1, 2 or 4 weekly intervals shown on your confirmation. Your subscription continues automatically unless you cancel in accordance with clause 7.</p>
            <p className="mb-6">We take payment at 12pm on Monday in the week of your scheduled delivery, unless you have skipped, paused, rescheduled or cancelled in accordance with these Terms. We may withhold deliveries and or cancel the contract between us if payment is not received in full in cleared funds.</p>

            <h3 className="text-xl font-bold mb-2">Price changes</h3>
            <p className="mb-6">Prices for DoMeal are liable to change at any time, but changes will not affect orders that have already been billed. We will give you reasonable advance warning if our prices are likely to change.</p>

            <h3 className="text-xl font-bold mb-2">Tiffin fee and returns</h3>
            <p className="mb-4">Where we provide the reusable tiffin tins at £0 as part of a limited time offer, you agree that the tins remain our property unless either:</p>
            <ul className="list-[lower-alpha] pl-6 space-y-2 mb-4">
              <li>you return them within 14 days after cancelling your subscription using our returns label, or</li>
              <li>you keep them and pay a £15 tiffin fee.</li>
            </ul>
            <p className="mb-4">If we have not received the returned tins within 14 days of cancellation, you authorise us to charge the £15 tiffin fee to the payment method we have on file.</p>
            <p>Where you have paid the £15 tiffin fee at sign up, you may keep the tins or return them using our returns label. No further charge or refund applies either way.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">6. Delivery policy</h2>
            <p className="mb-6">We deliver only to the postcodes listed on our website on Wednesdays, Thursdays and Fridays. Orders are delivered by bicycle couriers or a bicycle delivery company.</p>

            <h3 className="text-xl font-bold mb-2">Delivery times</h3>
            <p className="mb-6">You will receive an approximate delivery time on the day of your delivery. We aim to deliver all DoMeal dinners before 6pm on your chosen delivery day, and will keep in touch if it looks likely to be later due to operational issues such as weather disruption or cyclist breakdown. Delivery times are estimates and we do not guarantee a specific delivery time.</p>

            <h3 className="text-xl font-bold mb-2">Safe place and delivery instructions</h3>
            <p className="mb-4">Please let us know your preferred safe space, protected from the elements, if you are not going to be in.</p>
            <p className="mb-4">If you have entered alternative delivery instructions (for example “leave with a neighbour” or “leave in shed”) then this is entirely at your own risk and you will be responsible if the DoMeal goes missing after being delivered in accordance with your instructions. It is agreed that anyone at the delivery address is entitled to accept delivery.</p>
            <p className="mb-4">If you are not at home when we deliver and we cannot find a safe space to leave your delivery, we may need to return the tiffin to our headquarters for food safety reasons. In those circumstances we may be unable to redeliver and you may not be entitled to a refund because the goods are perishable. This does not affect your statutory rights if we fail to deliver.</p>
            <p className="mb-6">If we can find a safe space to leave your delivery, we may take a photo and email you so you know where it has been left.</p>

            <h3 className="text-xl font-bold mb-2">Cold chain and responsibility after delivery</h3>
            <p className="mb-6">Your delivery is ready to heat. It will be delivered chilled with ice packs and must be placed in the fridge within 1 hour of delivery, or heated immediately. Please note we cannot accept liability for any deliveries that are left out or uneaten for longer than our recommendations.</p>

            <h3 className="text-xl font-bold mb-2">Sharing your phone number for delivery</h3>
            <p className="mb-6">By signing up you agree for your phone number to be passed on to our cyclists or bicycle delivery company strictly for the purpose of completing your delivery. Neither they nor DoMeal will use your personal information for anything other than the intended purpose of ensuring your DoMeal reaches you.</p>

            <h3 className="text-xl font-bold mb-2">Rescheduling and pausing</h3>
            <p className="mb-4">You may reschedule delivery of your DoMeal by up to 21 days, by logging into your account or emailing us, provided you give at least 4 working days’ notice.</p>
            <p>If you are going to be away on holiday and wish to pause the delivery, please log into your account to pause or reschedule, or email us.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">7. Order cut off, changes, skipping and cancellations</h2>
            <h3 className="text-xl font-bold mb-2">Order cut off and billing</h3>
            <p className="mb-6">Orders lock and payment is taken at 12pm on Monday in the week of your scheduled delivery. You can skip, pause, reschedule or cancel up to this time using your account or by emailing us. After this time, we begin preparing perishable food and changes or cancellations may not be possible.</p>

            <h3 className="text-xl font-bold mb-2">Cancelling your subscription</h3>
            <p>You may cancel your subscription at any time before the next billing cut off at 12pm on Monday in the week of your scheduled delivery. You can cancel through your account on our website by clicking “Pause” and then selecting “Cancel”, or by emailing orders@domeal.co.uk. We will not take any further payments after your cancellation is effective.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">8. Changing your mind and consumer cancellation rights</h2>
            <p>Due to the perishable nature of DoMeal meals, you do not have a right to change your mind after delivery under the Consumer Contracts Regulations. This does not affect your statutory rights in relation to goods that are not as described, not of satisfactory quality, or not fit for purpose.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">9. Problems, complaints, refunds and remedies</h2>
            <p className="mb-4">If you are not satisfied with the quality of a meal or you have any other complaint, please contact us as soon as possible. Where possible, notify us within 24 hours of delivery and include photos and details so we can investigate quickly.</p>
            <p className="mb-4">This does not affect your statutory rights. Where a refund, replacement or other remedy is due under consumer law, we will provide it. In other situations, we may offer a discretionary goodwill gesture.</p>
            <p>If you are entitled to a refund, we will usually refund any money received using the same method originally used by you to pay. We will process refunds as soon as reasonably possible.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">10. Statutory rights</h2>
            <p>Nothing in these Terms affects your statutory rights, including your right to a remedy in respect of defective products.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">11. Limitations and exclusions of liability</h2>
            <p className="mb-4">Nothing in these Terms excludes or limits our liability where it would be unlawful to do so. This includes liability for death or personal injury caused by our negligence, or for fraud or fraudulent misrepresentation.</p>
            <p className="mb-4">Subject to the paragraph above:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>we are not liable for losses arising from events beyond our reasonable control, and</li>
              <li>we are not liable for business losses, including loss of profits, revenue, anticipated savings, contracts, commercial opportunities or goodwill.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">12. Other important terms</h2>
            <p className="mb-4">We will treat all personal information collected in connection with your order in accordance with our Privacy Policy. Use of our website is subject to our website terms of use.</p>
            <p className="mb-4">This contract is between you and us. No other person shall have any rights to enforce any of its terms.</p>
            <p className="mb-4">Each paragraph of these Terms operates separately. If any court or relevant authority decides that any of them are unlawful or unenforceable, the remaining paragraphs will remain in full force and effect.</p>
            <p>If we fail to insist that you perform any of your obligations under these Terms, or if we delay enforcing our rights, that will not mean that we have waived our rights. Any waiver must be in writing.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">13. Governing law and jurisdiction</h2>
            <p>If you are a consumer, these Terms are governed by English law. This means any dispute or claim arising out of or in connection with them will be governed by English law. The courts of England and Wales will have non exclusive jurisdiction. However, if you are a resident of Scotland you may also bring proceedings in Scotland, and if you are a resident of Northern Ireland you may also bring proceedings in Northern Ireland.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">14. Communications between us</h2>
            <p className="mb-4">When we refer to “in writing” in these Terms, this includes email.</p>
            <p className="mb-4">If you wish to contact us in writing for any reason, you can write to us by email or by pre paid post to:<br />
            DoMeal, No 1 Sedgecombe Avenue, Kenton, HA3 0HW.</p>
            <p className="mb-4">If we have to contact you or give you notice in writing, we will do so by email or by pre paid post to the address you provide in your order.</p>
            <p className="mb-4">Any change to your details must be notified to us promptly by updating your details via your account on the website or by contacting customer services using the details on the website.</p>

            <h3 className="text-xl font-bold mb-2">Service communications</h3>
            <p className="mb-4">We may send you service messages by email, SMS, or other electronic means relating to your subscription and deliveries. For example. order confirmations, billing notices, delivery tracking, operational updates, changes to delivery windows, and customer support messages. These messages are not marketing.</p>
            <p>Marketing messages will only be sent where you have opted in, and you can unsubscribe at any time.</p>
          </section>
        </div>
      </main>

      <UserFooter />
    </div>
  );
}
