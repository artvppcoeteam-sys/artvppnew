import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/artvpplogo.png';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const handleNavigation = (id: string) => {
    switch (id) {
      case 'shop': navigate('/marketplace'); break;
      case 'services': navigate('/services'); break;
      case 'about': navigate('/about'); break;
      case 'sell': navigate('/sell'); break;
      case 'contact': navigate('/contact'); break;
      case 'privacy': navigate('/privacy'); break;
      case 'terms': navigate('/terms'); break;
      case 'help': navigate('/help'); break;
      default: navigate('/');
    }
  };

  return (
    <footer className="bg-[#050816] text-gray-300">


      {/* Main footer content */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {/* Brand Section */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="ARTVPP" className="h-20 w-auto rounded-2xl shadow-lg bg-white/5 p-2" />
              </div>
              <p className="text-sm text-gray-400 mb-6 max-w-sm">
                Digital trade of creative products &amp; services. Your marketplace for art, creativity, and learning.
              </p>
              <div className="flex gap-4">
                <motion.a href="#" className="hover:text-white transition-colors" whileHover={{ scale: 1.1 }}>
                  <Facebook className="w-5 h-5" />
                </motion.a>
                <motion.a href="#" className="hover:text-white transition-colors" whileHover={{ scale: 1.1 }}>
                  <Twitter className="w-5 h-5" />
                </motion.a>
                <motion.a href="#" className="hover:text-white transition-colors" whileHover={{ scale: 1.1 }}>
                  <Instagram className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { name: 'About Us', id: 'about' },
                  { name: 'Artists', id: 'services' },
                  { name: 'Become an Artist', id: 'sell' },
                  { name: 'Contact Us', id: 'contact' }
                ].map((item) => (
                  <motion.li
                    key={item.name}
                    whileHover={{ x: 3 }}
                    className="cursor-pointer text-gray-400 hover:text-white transition-colors"
                  >
                    <button
                      onClick={() => handleNavigation(item.id)}
                      className="inline-block text-left w-full"
                    >
                      {item.name}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Categories */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <h3 className="font-semibold text-white mb-4">Categories</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { name: 'Physical Art', id: 'shop' },
                  { name: 'Digital Art', id: 'shop' },
                  { name: 'Custom Services', id: 'services' },
                  { name: 'Workshops', id: 'services' }
                ].map((item) => (
                  <motion.li
                    key={item.name}
                    whileHover={{ x: 3 }}
                    className="cursor-pointer text-gray-400 hover:text-white transition-colors"
                  >
                    <button
                      onClick={() => handleNavigation(item.id)}
                      className="inline-block text-left w-full"
                    >
                      {item.name}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Stay Connected */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <h3 className="font-semibold text-white mb-4">Stay Connected</h3>
              <ul className="space-y-3 text-sm mb-5">
                <li className="flex items-center gap-2">
                  <Mail className="w-5 h-5 flex-shrink-0 text-[#a73f2b]" />
                  <span>hello@artvpp.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-5 h-5 flex-shrink-0 text-[#a73f2b]" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 flex-shrink-0 text-[#a73f2b]" />
                  <span>Mumbai, Maharashtra, India</span>
                </li>
              </ul>

              <p className="text-sm text-gray-400 mb-2">Subscribe to our newsletter</p>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full rounded-[10px] bg-white/5 border border-white/10 px-4 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#a73f2b] transition-all"
                />
                <button className="px-5 py-2 rounded-[10px] bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0">
                  Subscribe
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-center md:text-left">
              &copy; {currentYear} ArtVPP. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleNavigation('privacy')}
                className="hover:text-gray-300 transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => handleNavigation('terms')}
                className="hover:text-gray-300 transition-colors"
              >
                Terms of Service
              </button>
              <button
                onClick={() => handleNavigation('help')}
                className="hover:text-gray-300 transition-colors"
              >
                Cookie Policy
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}