
import { Facebook, Twitter, Instagram, Linkedin, Mail, Send } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  // Static handle submit (just prevents page reload)
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Thanks for subscribing.");
  };

  return (
    <footer className='bg-gray-900 text-white border-t border-gray-800 pt-12 pb-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
          
          {/* 1. BRAND & DESCRIPTION */}
          <div className='col-span-1'>
            <h2 className='text-2xl font-bold text-emerald-400 mb-4'>E-COMMERCE</h2>
            <p className='text-gray-400 text-sm leading-relaxed'>
              Empowering developers with modern solutions. Join our community today.
            </p>
          </div>

          {/* 2. SOCIAL LINKS */}
          <div className='flex flex-col justify-start'>
             <h3 className='text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4'>
                Follow Us
             </h3>
             <div className='flex space-x-6'>
                <SocialIcon href="https://facebook.com" icon={<Facebook className="h-5 w-5" />} />
                <SocialIcon href="https://twitter.com" icon={<Twitter className="h-5 w-5" />} />
                <SocialIcon href="https://instagram.com" icon={<Instagram className="h-5 w-5" />} />
                <SocialIcon href="https://linkedin.com" icon={<Linkedin className="h-5 w-5" />} />
             </div>
          </div>

          {/* 3. NEWSLETTER (Static) */}
          <div>
            <h3 className='text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4'>
              Weekly Newsletter
            </h3>
            <p className='text-gray-400 text-sm mb-4'>
              Get the latest updates directly to your inbox.
            </p>
            
            <form onSubmit={handleSubscribe} className='flex flex-col space-y-2'>
              <div className='relative'>
                <input
                  type='email'
                  placeholder='Enter your email'
                  className='w-full bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-700 
                  focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 
                  placeholder-gray-500 text-sm'
                />
                <Mail className='absolute right-3 top-2.5 h-4 w-4 text-gray-400' />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type='submit'
                className='w-full flex items-center justify-center py-2 px-4 border border-transparent 
                rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700'
              >
                Subscribe <Send className='ml-2 h-4 w-4' />
              </motion.button>
            </form>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className='border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center'>
          <p className='text-gray-400 text-sm'>
            &copy; {new Date().getFullYear()} E-Commerce. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

// Helper component for clean Social Icons
const SocialIcon = ({ href, icon }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer" // Security best practice for external links
    whileHover={{ scale: 1.1, color: "#34D399" }} // Turns emerald on hover
    whileTap={{ scale: 0.9 }}
    className="text-gray-400 transition-colors"
  >
    {icon}
  </motion.a>
);

export default Footer;