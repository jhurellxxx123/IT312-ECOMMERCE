import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { CheckCircle, XCircle, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (verificationAttempted.current) return;
      verificationAttempted.current = true;

      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        return;
      }

      try {
        await axios.post("/auth/verify-email", { token });
        setStatus("success");
        // Wait 3 seconds before redirecting so they see the confetti
        setTimeout(() => navigate("/"), 4000);
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 relative overflow-hidden">
      
      {/* Show Confetti only on success */}
      {status === "success" && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-gray-700 relative z-10"
      >
        {status === "verifying" && (
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Mail className="w-16 h-16 text-emerald-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Verifying...</h2>
            <p className="text-gray-400">Please wait while we confirm your email.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="mb-6"
            >
              <CheckCircle className="w-20 h-20 text-emerald-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-gray-400 mb-6">Thank you for confirming your email.</p>
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1 }} 
               className="text-sm text-gray-500"
            >
                Redirecting to home...
            </motion.div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ repeat: 5, duration: 0.2, repeatType: "mirror" }}
                className="mb-6"
            >
                <XCircle className="w-16 h-16 text-red-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-400 mb-6">This link is invalid or has expired.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <ArrowRight className="w-4 h-4" /> Back to Login
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;