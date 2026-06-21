import SEO from './SEO';
import { getBreadcrumbsSchema } from '../utils/seoSchemas';

export default function ContactUsView() {
  return (
    <>
      <SEO 
        title="Contact Us | Visa Appeal Builder"
        description="Get in touch with the Visa Appeal Builder support team. We're here to help you navigate your Visa appeal journey."
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            getBreadcrumbsSchema([
              { name: "Home", url: "https://visaappealbuilder.com/" },
              { name: "Contact Us", url: "https://visaappealbuilder.com/contact" }
            ])
          ]
        }}
      />
      <div className="flex flex-col items-center py-24 px-6 max-w-4xl mx-auto w-full">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-center">Contact Us</h1>
      <p className="text-zinc-400 text-lg mb-12 text-center max-w-2xl">
        Have questions about your Visa appeal or need assistance with your generated documents? Our professional support team is ready to help.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-6">
          <h2 className="text-xl font-semibold mb-2">Get in touch</h2>
          
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Email Support</h3>
              <p className="text-zinc-400 text-sm">support@visaappeal.com</p>
              <p className="text-zinc-500 text-xs mt-1">We aim to respond within 24 hours.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start mt-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Location</h3>
              <p className="text-zinc-400 text-sm">Global Remote Team</p>
              <p className="text-zinc-500 text-xs mt-1">Serving applicants worldwide.</p>
            </div>
          </div>
        </div>

        <form className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-4">
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-2">Name</label>
            <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-2">Email</label>
            <input type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-2">Message</label>
            <textarea className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors h-32 resize-none" placeholder="How can we help?"></textarea>
          </div>
          <button type="button" className="w-full bg-white text-zinc-950 font-semibold rounded-lg px-4 py-3 mt-2 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
            Send Message
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
