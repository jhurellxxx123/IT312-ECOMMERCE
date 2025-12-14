import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import AuthSuccess from "./pages/AuthSuccess";
import VerifyEmail from "./pages/VerifyEmail";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // <--- IMPORT FOOTER HERE
import LoadingSpinner from "./components/LoadingSpinner";

import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    getCartItems();
  }, [getCartItems, user]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    // Added 'flex flex-col' to the main container to handle sticky footer layout
    <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden flex flex-col'>
      
      {/* Background gradient */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.3)_0%,rgba(30,58,138,0.2)_45%,rgba(0,0,0,0.1)_100%)]' />
        </div>
      </div>

      {/* Main Content Wrapper - Added 'flex-grow' so it pushes the footer down */}
      <div className='relative z-50 pt-20 flex-grow'>
        <Navbar />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
          <Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />

          {/* --- ROUTES FOR GOOGLE & EMAIL VERIFICATION --- */}
          <Route path='/auth-success' element={<AuthSuccess />} />
          <Route path='/verify-email' element={<VerifyEmail />} />

          <Route
            path='/secret-dashboard'
            element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login' />}
          />
          <Route path='/category/:category' element={<CategoryPage />} />
          <Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />
          <Route path='/purchase-success' element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' />} />
          <Route path='/purchase-cancel' element={user ? <PurchaseCancelPage /> : <Navigate to='/login' />} />
        </Routes>
      </div>

      {/* Footer Wrapper - Ensures it stays above the background gradient */}
      <div className='relative z-50'>
        <Footer />
      </div>

      <Toaster />
    </div>
  );
}

export default App;