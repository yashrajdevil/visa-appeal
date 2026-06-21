import SEO from './SEO';
import { getBreadcrumbsSchema } from '../utils/seoSchemas';

export default function RefundView() {
  return (
    <>
      <SEO 
        title="Refund Policy | Visa Reapplication Planning Platform"
        description="Understand our refund policy for digital document generation and structural visa appeal services."
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            getBreadcrumbsSchema([
              { name: "Home", url: "https://visaappealbuilder.com/" },
              { name: "Refund Policy", url: "https://visaappealbuilder.com/refund" }
            ])
          ]
        }}
      />
      <div className="flex flex-col py-24 px-6 max-w-3xl mx-auto w-full">
      <h1 className="text-4xl font-bold mb-8 tracking-tight">Refund Policy</h1>
      
      <div className="space-y-8 text-zinc-300 leading-relaxed">
        <p className="text-sm text-zinc-500">Last updated: June 2026</p>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Digital Product Policy</h2>
          <p>
            Because our service provides immediate access to digital generation tools and utilizes 
            computational resources per generation, all sales are generally considered final once a report 
            has been generated.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Refund Eligibility</h2>
          <p>We may issue refunds on a case-by-case basis under the following circumstances:</p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>The generation algorithm failed to produce a document due to an internal system error.</li>
            <li>You were incorrectly billed due to a payment processing error on our end.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Non-Refundable Circumstances</h2>
          <p>Refunds will <strong>not</strong> be provided under the following conditions:</p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>Your visa appeal or reapplication was subsequently denied by the embassy.</li>
            <li>You provided incorrect input data which resulted in an inaccurate report.</li>
            <li>You changed your mind after the digital report was already delivered.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Requesting a Refund</h2>
          <p>If you believe you are eligible for a refund due to a technical error, please contact support within 7 days of your purchase with your receipt and an explanation of the technical failure.</p>
        </section>
      </div>
    </div>
    </>
  );
}
