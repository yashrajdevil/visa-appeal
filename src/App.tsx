import { HelmetProvider } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import LandingView from './components/LandingView';
import SampleReportView from './components/SampleReportView';
import ProcessingView from './components/ProcessingView';
import ResultsDashboard from './components/ResultsDashboard';
import ResultsViewResolver from './components/ResultsViewResolver';
import AppFlow from './components/AppFlow';
import { generateAppeal } from './services/api';
import { PaymentSuccessView } from './views/PaymentSuccess';
import { AppealFormData, GenerateAppealResponse } from './types';
import Footer from './components/Footer';

import ContactUsView from './components/ContactUsView';
import AboutUsView from './components/AboutUsView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import TermsView from './components/TermsView';
import RefundView from './components/RefundView';
import WhyChooseUsView from './components/WhyChooseUsView';

import SeoHubView from './components/SeoHubView';
import SeoGuideView from './components/SeoGuideView';
import BlogHubView from './components/blog/BlogHubView';
import BlogArticleView from './components/blog/BlogArticleView';

import Login from './components/admin/Login';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import Articles from './components/admin/Articles';
import BlogEditor from './components/admin/BlogEditor';
import Categories from './components/admin/Categories';
import MediaLibrary from './components/admin/MediaLibrary';
import Settings from './components/admin/Settings';
import Users from './components/admin/Users';
import AdminDiagnostics from './components/admin/AdminDiagnostics';

import { CustomerAuthProvider } from './context/CustomerAuthContext';

import { CustomerLogin, CustomerRegister } from './components/customer/AuthViews';
import CustomerLayout from './components/customer/CustomerLayout';
import { DashboardOverview, DashboardOrders, DashboardCases, DashboardDocuments, DashboardSettings } from './components/customer/DashboardViews';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <CustomerAuthProvider>
          <AppContent />
        </CustomerAuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

function AppContent() {
  const [formData, setFormData] = useState<AppealFormData | null>(null);
  const [processingError, setProcessingError] = useState<{message: string; details?: string} | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  // ... (keeps the useEffect existing code)
  useEffect(() => {
    // If there's a hash, try to scroll to it after rendering
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  const handleStartProcessing = async (data: AppealFormData) => {
    setFormData(data);
    setProcessingError(null);
    navigate('/processing');
    
    try {
      const response = await generateAppeal(data);
      console.log(`RESULTS REDIRECT: /results/${response.caseId}`);
      navigate(`/results/${response.caseId}`);
    } catch (error: any) {
      console.error("Failed to generate appeal", error);
      setProcessingError({
        message: error.message || "An unexpected error occurred during processing.",
        details: error.details || "The server could not complete the operation."
      });
    }
  };

  const handleRetry = () => {
    setFormData(null);
    setProcessingError(null);
    navigate('/flow');
  };

  const handleReset = () => {
    setFormData(null);
    setProcessingError(null);
    navigate('/flow');
  };

  // If it's an admin route, we completely skip the public layout structure except for the login page
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<Login />} />
        <Route element={<AdminLayout />}>
           <Route path="/admin/dashboard" element={<Dashboard />} />
           <Route path="/admin/articles" element={<Articles />} />
           <Route path="/admin/articles/new" element={<BlogEditor />} />
           <Route path="/admin/articles/edit/:id?" element={<BlogEditor />} />
           <Route path="/admin/categories" element={<Categories />} />
           <Route path="/admin/media" element={<MediaLibrary />} />
           <Route path="/admin/settings" element={<Settings />} />
           <Route path="/admin/diagnostics" element={<AdminDiagnostics />} />
           {/* Placeholders for remaining admin routes */}
           <Route path="/admin/seo" element={<div className="p-8"><h1 className="text-3xl font-bold">SEO Placeholder</h1></div>} />
           <Route path="/admin/users" element={<Users />} />
           <Route path="/admin/*" element={<Navigate to="/admin/dashboard" />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans selection:bg-indigo-500/30">
      <Header />
      
      <main className="flex-1 flex flex-col relative mt-16">
        <Routes>
          <Route path="/" element={<LandingView onStartAppeal={() => navigate('/flow')} />} />
          <Route path="/sample-report" element={<SampleReportView />} />
          
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/register" element={<CustomerRegister />} />

          {/* Customer Dashboard */}
          <Route element={<CustomerLayout />}>
             <Route path="/dashboard" element={<DashboardOverview />} />
             <Route path="/dashboard/orders" element={<DashboardOrders />} />
             <Route path="/dashboard/cases" element={<DashboardCases />} />
             <Route path="/dashboard/documents" element={<DashboardDocuments />} />
             <Route path="/dashboard/settings" element={<DashboardSettings />} />
          </Route>

          <Route path="/flow" element={<AppFlow onStart={handleStartProcessing} />} />
          <Route path="/processing" element={<ProcessingView error={processingError} onRetry={handleRetry} onCancel={() => navigate('/flow')} />} />
          <Route path="/results/:caseId" element={<ResultsViewResolver onReset={handleReset} memoryResult={null} />} />
          <Route path="/results" element={<Navigate to="/dashboard/cases" />} />
          
          {/* Payment Status Routes */}
          <Route path="/payment-success" element={<PaymentSuccessView />} />
          <Route path="/payment-cancelled" element={
            <div className="flex flex-col items-center justify-center py-20 px-4 mt-20 text-center">
               <h2 className="text-3xl font-bold mb-4 text-zinc-100">Checkout Cancelled</h2>
               <p className="text-zinc-400 mb-8">Your payment was not completed.</p>
               <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors">Return to Dashboard</button>
            </div>
          } />

          {/* Static Pages */}
          <Route path="/contact" element={<ContactUsView />} />
          <Route path="/about" element={<AboutUsView />} />
          <Route path="/privacy" element={<PrivacyPolicyView />} />
          <Route path="/terms" element={<TermsView />} />
          <Route path="/refund" element={<RefundView />} />
          <Route path="/why-choose-us" element={<WhyChooseUsView onClickStart={() => navigate('/flow')} />} />
          
          {/* SEO Pages */}
          <Route path="/guides" element={<SeoHubView />} />
          <Route path="/guides/:slug" element={<BlogArticleView />} />

          {/* Blog Pages */}
          <Route path="/blog" element={<BlogHubView />} />
          <Route path="/blog/category/:category" element={<BlogHubView />} />
          <Route path="/blog/tag/:tag" element={<BlogHubView />} />
          <Route path="/blog/:slug" element={<BlogArticleView />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
