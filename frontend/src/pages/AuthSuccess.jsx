import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useUserStore } from "../stores/useUserStore"; // Import your store

const AuthSuccess = () => {
  const navigate = useNavigate();
  const processed = useRef(false);
  const { checkAuth } = useUserStore(); // Get checkAuth to update state

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    // 1. Let the backend set the cookies (it happened before redirect)
    // 2. Refresh the user state immediately
    checkAuth();

    // 3. Wait 2 seconds for animation, then go Home
    setTimeout(() => {
         navigate("/");
    }, 2000);
    
  }, [navigate, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center border border-gray-700"
      >
        <div className="flex flex-col items-center justify-center">
            <div className="relative mb-6">
                {/* Spinning outer ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full"
                />
                {/* Center Checkmark */}
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Check className="w-8 h-8 text-emerald-500" />
                </motion.div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
            <p className="text-gray-400">Taking you to the home page...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthSuccess;