import { ArrowRight, CheckCircle, HandHeart, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

const PurchaseSuccessPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const { clearCart } = useCartStore();
  const [error, setError] = useState(null);

  // --- POPUP STATES ---
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const handleCheckoutSuccess = async (sessionId) => {
      try {
        await axios.post("/payments/checkout-success", {
          sessionId,
        });
        clearCart();
      } catch (error) {
        console.log(error);
      } finally {
        setIsProcessing(false);
        // Trigger the popup 2.5 seconds after loading
        setTimeout(() => setShowRatingPopup(true), 2500);
      }
    };

    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (sessionId) {
      handleCheckoutSuccess(sessionId);
    } else {
      setIsProcessing(false);
      setError("No session ID found in the URL");
    }
  }, [clearCart]);

  const handleRate = (star) => {
    setRating(star);
    // Simulate submission delay
    setTimeout(() => {
        setIsSubmitted(true);
        // Close popup automatically 2 seconds after rating
        setTimeout(() => setShowRatingPopup(false), 2000);
    }, 500);
  };

  if (isProcessing) return "Processing...";
  if (error) return `Error: ${error}`;

  return (
    <div className='h-screen flex items-center justify-center px-4 bg-gray-900 relative'>
      {/* Confetti Background */}
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 0 }} // Lower z-index so popup sits on top
        numberOfPieces={400}
        recycle={false}
      />

      {/* --- MAIN CONTENT (SUCCESS CARD) --- */}
      <div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10 p-6 sm:p-8 border border-gray-700'>
        <div className='flex justify-center'>
          <CheckCircle className='text-emerald-400 w-16 h-16 mb-4' />
        </div>

        <h1 className='text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2'>
          Purchase Successful!
        </h1>

        <p className='text-gray-300 text-center mb-2'>
          Thank you for your order. We're processing it now.
        </p>
        <p className='text-emerald-400 text-center text-sm mb-6'>
          Check your email for order details and updates.
        </p>

        <div className='bg-gray-700 rounded-lg p-4 mb-6'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-gray-400'>Order number</span>
            <span className='text-sm font-semibold text-emerald-400'>#12345</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-400'>Estimated delivery</span>
            <span className='text-sm font-semibold text-emerald-400'>3-5 business days</span>
          </div>
        </div>

        <div className='space-y-4'>
          <button
            className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4
            rounded-lg transition duration-300 flex items-center justify-center shadow-lg'
          >
            <HandHeart className='mr-2' size={18} />
            Thanks for trusting us!
          </button>
          
          <Link
            to={"/"}
            className='w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 
            rounded-lg transition duration-300 flex items-center justify-center'
          >
            Continue Shopping
            <ArrowRight className='ml-2' size={18} />
          </Link>
        </div>
      </div>

      {/* --- RATING POPUP MODAL --- */}
      <AnimatePresence>
        {showRatingPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative"
            >
                {/* Close Button */}
                <button 
                    onClick={() => setShowRatingPopup(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {!isSubmitted ? (
                    <div className="text-center">
                        <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">Survey Form</p>
                        <h3 className="text-xl font-bold text-white mb-4">Review Us</h3>
                        <p className="text-gray-300 text-sm mb-6">How was your shopping experience?</p>
                        
                        {/* Stars */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRate(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110 duration-200"
                                >
                                    <Star
                                        size={32}
                                        className={`${
                                            star <= (hoverRating || rating)
                                            ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                                            : "text-gray-600"
                                        } transition-all duration-200`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Success State after Rating
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="text-center py-4"
                    >
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                             <CheckCircle className="text-emerald-400 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Thank You!</h3>
                        <p className="text-gray-400 text-sm">We appreciate your feedback.</p>
                    </motion.div>
                )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PurchaseSuccessPage;