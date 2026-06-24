import SEO from './SEO';
import { getBreadcrumbsSchema } from '../utils/seoSchemas';

export default function TermsView() {
  return (
    <>
      <SEO 
        title="Terms of Service | Lumera"
        description="Review our terms of service to understand the conditions, limitations, and nature of our visa appeal document generation tool."
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            getBreadcrumbsSchema([
              { name: "Home", url: "https://visaappealbuilder.com/" },
              { name: "Terms of Service", url: "https://visaappealbuilder.com/terms" }
            ])
          ]
        }}
      />
      <div className="flex flex-col py-24 px-6 max-w-3xl mx-auto w-full">
      <h1 className="text-4xl font-bold mb-8 tracking-tight">Terms of Service</h1>
      
      <div className="space-y-8 text-zinc-300 leading-relaxed">
        <p className="text-sm text-zinc-500">Last updated: June 2026</p>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. Nature of Service</h2>
          <p>Lumera is a document structuring and text analysis tool. <strong>We are not a law firm.</strong> We do not provide legal advice, representation, or guarantees of any outcome related to your visa application.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. No Guarantee of Approval</h2>
          <p>The decision to grant or deny a visa rests entirely with the respective consular officers and government bodies. Using structural recommendations from our platform does not guarantee your appeal or reapplication will be successful.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. User Responsibilities</h2>
          <p>You are responsible for the accuracy of the information provided to the tool. You must review all generated documents carefully before submission to ensure they truthfully represent your circumstances.</p>
        </section>
      </div>
    </div>
    </>
  );
}
