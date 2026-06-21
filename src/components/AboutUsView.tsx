import SEO from './SEO';
import { getOrganizationSchema, getBreadcrumbsSchema } from '../utils/seoSchemas';

export default function AboutUsView() {
  return (
    <>
      <SEO 
        title="About Us | Visa Reapplication Planning Platform"
        description="Learn about our mission to level the playing field for visa applicants worldwide with AI-powered appeal structuring."
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            getOrganizationSchema(),
            getBreadcrumbsSchema([
              { name: "Home", url: "https://visaappealbuilder.com/" },
              { name: "About Us", url: "https://visaappealbuilder.com/about" }
            ])
          ]
        }}
      />
      <div className="flex flex-col items-center py-24 px-6 max-w-3xl mx-auto w-full">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-center">About Us</h1>
      
      <div className="space-y-8 text-zinc-300 leading-relaxed text-lg">
        <p>
          At Visa Reapplication Platform, our mission is to level the playing field for visa applicants worldwide. 
          We believe that a single refusal should not mean the end of your travel, work, or study dreams.
        </p>
        
        <p>
          Every year, millions of legitimate visa applications are denied due to minor structural inconsistencies, 
          missing supporting documents, or failure to explicitly address consular officer concerns. Left without 
          clear guidance, applicants often reapply making the exact same mistakes.
        </p>

        <p>
          We bridge the gap between expensive legal counsel and generic advice. By leveraging advanced logical 
          analysis of refusal clauses, we provide applicants with structured, professional, and highly targeted 
          appeal strategies.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Our Vision</h2>
        <p>
          To make transparent, high-quality visa appeal structuring accessible to everyone, ensuring your 
          intentions are clearly and professionally communicated to the embassy.
        </p>
      </div>
    </div>
    </>
  );
}
