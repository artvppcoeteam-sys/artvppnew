import { useEffect, lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LaunchOverlay } from './components/LaunchOverlay';

import { Loader2 } from 'lucide-react';

// Lazy Load Pages
const HomePage = lazy(() => import('./components/pages/HomePage').then(module => ({ default: module.HomePage })));
const ProductCategoryPage = lazy(() => import('./components/pages/ProductCategoryPage').then(module => ({ default: module.ProductCategoryPage })));
const ProductDetailPage = lazy(() => import('./components/pages/ProductDetailPage').then(module => ({ default: module.ProductDetailPage })));
const ServicesPage = lazy(() => import('./components/pages/ServicesPage').then(module => ({ default: module.ServicesPage })));
const StudioHirePage = lazy(() => import('./components/pages/StudioHirePage').then(module => ({ default: module.StudioHirePage })));
const PhotographyServicePage = lazy(() => import('./components/pages/PlatformServicePage').then(module => ({ default: module.PhotographyServicePage })));
const CalligraphyServicePage = lazy(() => import('./components/pages/PlatformServicePage').then(module => ({ default: module.CalligraphyServicePage })));
const ServiceDetailPage = lazy(() => import('./components/pages/ServiceDetailPage').then(module => ({ default: module.ServiceDetailPage })));
const WorkshopDetailPage = lazy(() => import('./components/pages/WorkshopDetailPage').then(module => ({ default: module.WorkshopDetailPage })));
const AboutPage = lazy(() => import('./components/pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./components/pages/ContactPage').then(module => ({ default: module.ContactPage })));
const CartPage = lazy(() => import('./components/pages/CartPage').then(module => ({ default: module.CartPage })));
const LoginPage = lazy(() => import('./components/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./components/pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const VerifyEmailPage = lazy(() => import('./components/pages/VerifyEmailPage').then(module => ({ default: module.VerifyEmailPage })));
const VendorDashboard = lazy(() => import('./components/dashboard/vendor/VendorDashboard').then(module => ({ default: module.VendorDashboard })));
const VendorOverview = lazy(() => import('./components/dashboard/vendor/VendorOverview').then(module => ({ default: module.VendorOverview })));
const VendorArtworks = lazy(() => import('./components/dashboard/vendor/VendorComponents').then(module => ({ default: module.VendorArtworks })));
const VendorOrders = lazy(() => import('./components/dashboard/vendor/VendorComponents').then(module => ({ default: module.VendorOrders })));
const VendorEarnings = lazy(() => import('./components/dashboard/vendor/VendorComponents').then(module => ({ default: module.VendorEarnings })));
const VendorCustomers = lazy(() => import('./components/dashboard/vendor/VendorComponents').then(module => ({ default: module.VendorCustomers })));
const VendorSettings = lazy(() => import('./components/dashboard/vendor/VendorPlaceholders').then(module => ({ default: module.VendorSettings })));
const HelpPage = lazy(() => import('./components/pages/HelpPage').then(module => ({ default: module.HelpPage })));
const TermsPage = lazy(() => import('./components/pages/TermsPage').then(module => ({ default: module.TermsPage })));
const PrivacyPage = lazy(() => import('./components/pages/PrivacyPage').then(module => ({ default: module.PrivacyPage })));
const ReturnsRefundsPage = lazy(() => import('./components/pages/ReturnsRefundsPage').then(module => ({ default: module.ReturnsRefundsPage })));
const NotFoundPage = lazy(() => import('./components/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const OrderConfirmationPage = lazy(() => import('./components/pages/OrderConfirmationPage').then(module => ({ default: module.OrderConfirmationPage })));
const SellArtPage = lazy(() => import('./components/pages/SellArtPage').then(module => ({ default: module.SellArtPage })));
const StudentSubmissionPage = lazy(() => import('./components/pages/StudentSubmissionPage').then(module => ({ default: module.StudentSubmissionPage })));
const OrderSuccessPage = lazy(() => import('./components/pages/OrderSuccessPage').then(module => ({ default: module.OrderSuccessPage })));

// Auth Success Component for Google OAuth
const AuthSuccess = lazy(() => import('./components/AuthSuccess').then(module => ({ default: module.AuthSuccess })));

// Checkout Components (Lazy Load)
const CheckoutLayout = lazy(() => import('./components/checkout/CheckoutLayout').then(module => ({ default: module.CheckoutLayout })));
const AddressStep = lazy(() => import('./components/checkout/AddressStep').then(module => ({ default: module.AddressStep })));
const OrderSummaryStep = lazy(() => import('./components/checkout/OrderSummaryStep').then(module => ({ default: module.OrderSummaryStep })));
const PaymentStep = lazy(() => import('./components/checkout/PaymentStep').then(module => ({ default: module.PaymentStep })));

// User Dashboard Components (Lazy Load)
const UserDashboard = lazy(() => import('./components/dashboard/UserDashboard').then(module => ({ default: module.UserDashboard })));
const ProfileInformation = lazy(() => import('./components/dashboard/ProfileInformation').then(module => ({ default: module.ProfileInformation })));
const ManageAddresses = lazy(() => import('./components/dashboard/ManageAddresses').then(module => ({ default: module.ManageAddresses })));
const MyOrders = lazy(() => import('./components/dashboard/MyOrders').then(module => ({ default: module.MyOrders })));
const MyWishlist = lazy(() => import('./components/dashboard/MyWishlist').then(module => ({ default: module.MyWishlist })));
const Payments = lazy(() => import('./components/dashboard/Payments').then(module => ({ default: module.Payments })));
const MyReviews = lazy(() => import('./components/dashboard/MyReviews').then(module => ({ default: module.MyReviews })));
const MyCoupons = lazy(() => import('./components/dashboard/MyCoupons').then(module => ({ default: module.MyCoupons })));
const Notifications = lazy(() => import('./components/dashboard/Notifications').then(module => ({ default: module.Notifications })));

// Admin Dashboard Components (Lazy Load)
const AdminOverview = lazy(() => import('./components/dashboard/admin/AdminOverview').then(module => ({ default: module.AdminOverview })));
const AdminVendors = lazy(() => import('./components/dashboard/admin/AdminVendors').then(module => ({ default: module.AdminVendors })));
const AdminUsers = lazy(() => import('./components/dashboard/admin/AdminUsers').then(module => ({ default: module.AdminUsers })));
const AdminProducts = lazy(() => import('./components/dashboard/admin/AdminProducts').then(module => ({ default: module.AdminProducts })));
const AdminOrders = lazy(() => import('./components/dashboard/admin/AdminOrders').then(module => ({ default: module.AdminOrders })));
const AdminCategories = lazy(() => import('./components/dashboard/admin/AdminCategories').then(module => ({ default: module.AdminCategories })));
const AdminServices = lazy(() => import('./components/dashboard/admin/AdminServices').then(module => ({ default: module.AdminServices })));
const AdminContent = lazy(() => import('./components/dashboard/admin/AdminContent').then(module => ({ default: module.AdminContent })));
const AdminSettings = lazy(() => import('./components/dashboard/admin/AdminSettings').then(module => ({ default: module.AdminSettings })));
const AdminSupport = lazy(() => import('./components/dashboard/admin/AdminSupport').then(module => ({ default: module.AdminSupport })));
const AdminRevenue = lazy(() => import('./components/dashboard/admin/AdminRevenue').then(module => ({ default: module.AdminRevenue })));
const AdminReports = lazy(() => import('./components/dashboard/admin/AdminReports').then(module => ({ default: module.AdminReports })));

import { useParams } from 'react-router-dom';

// Redirect component for old /verify/:token format
function VerifyRedirect() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate(`/verify-email?token=${encodeURIComponent(token)}`, { replace: true });
    } else {
      navigate('/verify-email', { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-[#a73f2b]" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-[#a73f2b]" />
      <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

export default function App() {
  const navigate = useNavigate();
  const [launched, setLaunched] = useState(
    import.meta.env.VITE_LAUNCH_MODE !== 'true'
  );

  const STUDENT_SUBMISSION_PUBLIC_PATH = '/student-art-apply-k9x7m2q4r8t1v6';

  return (
    <AppProvider>

      {!launched && <LaunchOverlay onLaunch={() => setLaunched(true)} />}
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes wrapped in PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/marketplace" element={<ProductCategoryPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/studio-hire" element={<StudioHirePage />} />
            <Route path="/services/photography" element={<PhotographyServicePage />} />
            <Route path="/services/calligraphy" element={<CalligraphyServicePage />} />
            <Route path="/service/:id" element={<ServiceDetailPage />} />
            <Route path="/workshop/:id" element={<WorkshopDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            {/* Handle old /verify/:token format - redirect to new format */}
            <Route path="/verify/:token" element={<VerifyRedirect />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/sell" element={<SellArtPage />} />
            <Route path={STUDENT_SUBMISSION_PUBLIC_PATH} element={<StudentSubmissionPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/returns-refunds" element={<ReturnsRefundsPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />

            {/* Checkout Routes */}
            <Route path="/checkout" element={<Navigate to="/checkout/address" replace />} />
            <Route path="/checkout/address" element={
              <CheckoutLayout currentStep="address">
                <AddressStep onNext={() => navigate('/checkout/summary')} />
              </CheckoutLayout>
            } />
            <Route path="/checkout/summary" element={
              <CheckoutLayout currentStep="summary">
                <OrderSummaryStep
                  onNext={() => navigate('/checkout/payment')}
                  onBack={() => navigate('/checkout/address')}
                  onChangeAddress={() => navigate('/checkout/address')}
                />
              </CheckoutLayout>
            } />
            <Route path="/checkout/payment" element={
              <CheckoutLayout currentStep="payment">
                <PaymentStep
                  onSuccess={() => navigate('/order-confirmation')}
                  onBack={() => navigate('/checkout/summary')}
                />
              </CheckoutLayout>
            } />

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Protected User Dashboard Routes */}
          <Route path="/dashboard/user" element={<ProtectedRoute allowedRoles={['user', 'admin', 'artist']}><UserDashboard /></ProtectedRoute>}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileInformation />} />
            <Route path="addresses" element={<ManageAddresses />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="wishlist" element={<MyWishlist />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reviews" element={<MyReviews />} />
            <Route path="coupons" element={<MyCoupons />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Protected Admin Dashboard Routes */}
          <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="artworks" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="revenue" element={<AdminRevenue />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Vendor Dashboard - to be implemented fully */}
          {/* Protected Vendor Dashboard Routes */}
          <Route path="/dashboard/vendor" element={<ProtectedRoute allowedRoles={['artist', 'admin']}><VendorDashboard /></ProtectedRoute>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<VendorOverview />} />
            <Route path="artworks" element={<VendorArtworks />} />
            <Route path="add-artwork" element={<VendorArtworks />} /> {/* Placeholder */}
            <Route path="orders" element={<VendorOrders />} />
            <Route path="earnings" element={<VendorEarnings />} />
            <Route path="payouts" element={<VendorEarnings />} /> {/* Placeholder */}
            <Route path="customers" element={<VendorCustomers />} />
            <Route path="messages" element={<div className="p-8">Messages Placeholder</div>} />
            <Route path="settings" element={<VendorSettings />} />
            <Route path="support" element={<div className="p-8">Support Placeholder</div>} />
          </Route>

          {/* Redirects */}
          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
          <Route path="/vendor" element={<Navigate to="/dashboard/vendor" replace />} />

        </Routes>
      </Suspense>
    </AppProvider>
  );
}
