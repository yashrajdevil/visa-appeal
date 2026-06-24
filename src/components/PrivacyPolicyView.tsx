import SEO from './SEO';
import { getBreadcrumbsSchema } from '../utils/seoSchemas';

export default function PrivacyPolicyView() {
  return (
    <>
      <SEO 
        title="Privacy Policy | Lumera"
        description="Read our privacy policy to understand how we securely handle and protect your sensitive visa documents and personal information."
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            getBreadcrumbsSchema([
              { name: "Home", url: "https://visaappealbuilder.com/" },
              { name: "Privacy Policy", url: "https://visaappealbuilder.com/privacy" }
            ])
          ]
        }}
      />
      <div className="flex flex-col py-24 px-6 max-w-3xl mx-auto w-full">
      <h1 className="text-4xl font-bold mb-8 tracking-tight">Privacy Policy</h1>
      
      <div className="space-y-8 text-zinc-300 leading-relaxed">
        <p className="text-sm text-zinc-500">Last updated: June 2026</p>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Data Collection</h2>
          <p>We collect information you provide directly to us when using our services. This includes text extracted from the refusal letters you upload and the specific context of your case.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. Use of Information</h2>
          <p>The documents and information you upload are used strictly for the purpose of generating your automated appeal strategy and refusal analysis. We do not use your personal information to train generic public models.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
          <p>We implement appropriate technical and organizational security measures designed to protect your data. Uploaded documents are processed in memory and immediately discarded, or stored temporarily in an encrypted state solely for the duration of your session.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Sharing</h2>
          <p>We do not sell, trade, or rent your personal identification information to others. We may use secure third-party AI services via API to process the structural analysis of your refusal, strictly under confidentiality agreements.</p>
        </section>
      </div>
    </div>
    </>
  );
}
