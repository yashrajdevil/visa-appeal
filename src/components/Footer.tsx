import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-900 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="flex flex-col gap-4 max-w-sm">
          <Logo />
          <p className="text-zinc-500 text-sm mb-4">
            Professional visa refusal analysis and document preparation using advanced case logic algorithms.
            Empowering applicants to reapply with confidence.
          </p>
          <div className="text-xs text-zinc-400 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
            <strong>Disclaimer:</strong> This platform provides document preparation and informational assistance only. It does not provide immigration advice, legal advice, or representation before any government authority.
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-semibold mb-2">Company</h4>
            <Link to="/about" className="text-zinc-400 hover:text-white transition-colors text-sm">About Us</Link>
            <Link to="/why-choose-us" className="text-zinc-400 hover:text-white transition-colors text-sm">Why Choose Us</Link>
            <Link to="/contact" className="text-zinc-400 hover:text-white transition-colors text-sm">Contact Us</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-white font-semibold mb-2">Legal</h4>
            <Link to="/privacy" className="text-zinc-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
            <Link to="/terms" className="text-zinc-400 hover:text-white transition-colors text-sm">Terms of Service</Link>
            <Link to="/refund" className="text-zinc-400 hover:text-white transition-colors text-sm">Refund Policy</Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-zinc-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-zinc-600 text-xs">
          © {new Date().getFullYear()} Lumera. All rights reserved. Not affiliated with any government agency.
        </p>
      </div>
    </footer>
  );
}
