import { Analytics } from '@vercel/analytics/react';
import { HelmetProvider } from 'react-helmet-async';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import LandingView from './components/LandingView';
import SampleReportView from './components/SampleReportView';
import ProcessingView from './components/ProcessingView';
import ResultsDashboard from './components/ResultsDashboard';
import ResultsViewResolver from './components/ResultsViewResolver';
import AppFlow from './components/AppFlow';
import { AppealFormData } from './types';
import Footer from './components/Footer';

import ContactUsView from './components/ContactUsView';
import AboutUsView from './components/AboutUsView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import TermsView from './components/TermsView';
import RefundView from './components/RefundView';
import WhyChooseUsView from './components/WhyChooseUsView';

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

import { CustomerLogin, CustomerRegister } from './components/customer/AuthViews';
import { DashboardOverview, DashboardOrders, DashboardCases, DashboardDocuments, DashboardSettings } from './components/customer/DashboardViews';
import CustomerLayout from './components/customer/CustomerLayout';

import { useCustomerAuth } from './context/CustomerAuthContext';
import FirebaseDebug from './components/FirebaseDebug';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCustomerAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <Analytics />
    </HelmetProvider>
  );
}

function AppContent() {
  const [formData, setFormData] = useState<AppealFormData | null>(null);
  const [processingError, setProcessingError] = useState<{message: string; details?: string} | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleStartProcessing = (data: AppealFormData) => {
    setFormData(data);
    setProcessingError(null);
    navigate('/processing');
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
          
          <Route path="/flow" element={<RequireAuth><AppFlow onStart={handleStartProcessing} /></RequireAuth>} />
          <Route path="/processing" element={<RequireAuth><ProcessingView formData={formData} error={processingError} onRetry={handleRetry} onCancel={() => navigate('/flow')} /></RequireAuth>} />
          <Route path="/results/:caseId" element={<RequireAuth><ResultsViewResolver onReset={handleReset} /></RequireAuth>} />
          <Route path="/results" element={<Navigate to="/" />} />

          {/* Customer Auth */}
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/register" element={<CustomerRegister />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<RequireAuth><CustomerLayout /></RequireAuth>}>
            <Route index element={<DashboardOverview />} />
            <Route path="orders" element={<DashboardOrders />} />
            <Route path="documents" element={<DashboardDocuments />} />
            <Route path="cases" element={<DashboardCases />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>

          {/* Debug */}
          <Route path="/debug/firebase" element={<FirebaseDebug />} />

          {/* Static Pages */}
          <Route path="/contact" element={<ContactUsView />} />
          <Route path="/about" element={<AboutUsView />} />
          <Route path="/privacy" element={<PrivacyPolicyView />} />
          <Route path="/terms" element={<TermsView />} />
          <Route path="/refund" element={<RefundView />} />
          <Route path="/why-choose-us" element={<WhyChooseUsView onClickStart={() => navigate('/flow')} />} />
          
          {/* Guides Redirect */}
          <Route path="/guides" element={<Navigate to="/blog" replace />} />
          <Route path="/guides/*" element={<Navigate to="/blog" replace />} />

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
