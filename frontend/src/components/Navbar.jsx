import { ShoppingCart, UserPlus, LogIn, LogOut, Lock, Star, X, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
    const { user, logout } = useUserStore();
    const isAdmin = user?.role === "admin";
    const { cart } = useCartStore();

    // --- LOGOUT POPUP STATES ---
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    // Handle actual logout logic
    const handleFinalLogout = () => {
        setShowLogoutPopup(false);
        // Reset rating for next time
        setRating(0); 
        logout();
    };

    // Handle when a user selects a star
    const handleRateAndLogout = (starValue) => {
        setRating(starValue);
        // Optional: Send this rating to your backend here
        // console.log("User rated:", starValue);
        
        // Small delay to show user they clicked, then logout
        setTimeout(() => {
            handleFinalLogout();
        }, 600);
    };

    return (
        <>
            <header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800'>
                <div className='container mx-auto px-4 py-3'>
                    <div className='flex flex-wrap justify-between items-center'>
                        <Link to='/' className='text-2xl font-bold text-white-400 items-center space x-2 flex' >
                            E-Commerce
                        </Link>

                        <nav className='flex flex-wrap items-center gap-4'>
                            <Link to={"/"} className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'>
                                Home
                            </Link>
                            {user && (
                                <Link to={"/cart"} className='relative group text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'>
                                    <ShoppingCart className='inline-block mr-1 group-hover:text-emerald-400' size={20} />
                                    <span className='hidden sm-inline'>Cart</span>
                                    {cart.length > 0 && (
                                        <span
                                            className='absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 
                                            text-xs group-hover:bg-emerald-400 transition duration-300 ease-in-out'
                                        >
                                            {cart.length}
                                        </span>
                                    )}
                                </Link>
                            )}
                            {isAdmin && (
                                <Link
                                    className='bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium
                                             transition duration-300 ease-in-out flex items-center'
                                    to={"/secret-dashboard"}
                                >
                                    <Lock className='inline-block mr-1' size={18} />
                                    <span className='hidden sm:inline'>Dashboard</span>
                                </Link>
                            )}
                            {user ? (
                                <button
                                    className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
                                    rounded-md flex items-center transition duration-300 ease-in-out'
                                    onClick={() => setShowLogoutPopup(true)} // <--- TRIGGER POPUP INSTEAD OF LOGOUT
                                >
                                    <LogOut size={18} />
                                    <span className='hidden sm:inline ml-2'>Log Out</span>
                                </button>
                            ) : (
                                <>
                                    <Link
                                        to={"/signup"}
                                        className='bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 
                                        rounded-md flex items-center transition duration-300 ease-in-out'
                                    >
                                        <UserPlus className='mr-2' size={18} />
                                        Sign Up
                                    </Link>

                                    <Link
                                        to={"/login"}
                                        className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
                                        rounded-md flex items-center transition duration-300 ease-in-out'
                                    >
                                        <LogIn className='mr-2' size={18} />
                                        Login
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* --- LOGOUT RATING POPUP --- */}
            <AnimatePresence>
                {showLogoutPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-2xl max-w-sm w-full relative text-center"
                        >
                            {/* Close Button (Cancel Logout) */}
                            <button
                                onClick={() => setShowLogoutPopup(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Header */}
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ThumbsUp className="text-emerald-400 w-6 h-6" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2">Leaving so soon?</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Before you go, how would you rate your experience today?
                            </p>

                            {/* Stars Interaction */}
                            <div className="flex justify-center gap-3 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => handleRateAndLogout(star)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            size={32}
                                            className={`${
                                                star <= (hoverRating || rating)
                                                    ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                                                    : "text-gray-600"
                                            } transition-colors duration-200`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Skip Button */}
                            <button
                                onClick={handleFinalLogout}
                                className="text-gray-500 text-sm hover:text-white hover:underline transition-colors"
                            >
                                Skip & Log Out
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;