import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react';
import logo from '../../assets/artvpplogo.png';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { navigationMenu } from '../data/mockData';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const { user, cartCount, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'About ArtVPP', value: 'about', path: '/about', hasDropdown: false },
    { label: 'BuyART', value: 'shop', path: '/marketplace', subLabel: 'SHOP', hasDropdown: true },
    { label: 'SellArt', value: 'sell', path: '/sell', subLabel: 'SELL', hasDropdown: false },
    { label: 'Discover', value: 'discover', path: '/services', subLabel: 'SERVICES', hasDropdown: true },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getPrimaryDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin/overview';
    if (user.role === 'artist') return '/dashboard/vendor/overview';
    return '/dashboard/user/profile';
  };

  const getOrdersPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin/orders';
    if (user.role === 'artist') return '/dashboard/vendor/orders';
    return '/dashboard/user/orders';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 border-b border-gray-100 ${scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)]' : 'shadow-none'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-[auto_1fr_auto] items-center h-[80px] gap-4">

          {/* Logo Section - Left */}
          <div className="flex items-center justify-start">
            <motion.button
              onClick={() => navigate('/')}
              className="group relative flex items-center gap-1.5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={logo}
                alt="ARTVPP"
                className="h-14 md:h-16 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(255,122,24,0.55)]"
              />
            </motion.button>
          </div>

          {/* Center Navigation + Search */}
          <div className="hidden md:flex items-center justify-center gap-8 lg:gap-10">
            <nav className="flex items-center gap-6 lg:gap-8">
              {navItems.map((item) => (
                <div
                  key={item.value}
                  className="relative text-center group"
                >
                  <motion.button
                    onClick={() => {
                      if (item.hasDropdown) {
                        setActiveDropdown(activeDropdown === item.value ? null : item.value);
                      } else {
                        navigate(item.path);
                        setActiveDropdown(null);
                      }
                    }}
                    className="flex items-center py-1"
                  >
                    <span className={`text-sm font-medium transition-colors whitespace-nowrap ${isActive(item.path) || (activeDropdown === item.value)
                      ? 'text-slate-900'
                      : 'text-slate-700 hover:text-slate-900'
                      }`}>
                      {item.label}
                    </span>
                  </motion.button>

                  {/* Mega Menu Overlay */}
                  <AnimatePresence>
                    {activeDropdown === item.value && item.hasDropdown && (
                      <>
                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActiveDropdown(null)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 transform -translate-x-1/2 pt-4 w-auto min-w-[600px] z-50"
                        >
                          <div className="bg-white/98 backdrop-blur-md border border-slate-100 shadow-xl p-8 rounded-2xl">
                            <div className="flex gap-16 text-left">
                              {item.value === 'shop' && navigationMenu.shop.sections.map((section, idx) => (
                                <div key={idx}>
                                  <h3 className="text-xs font-semibold text-slate-900 mb-3 tracking-[0.25em] uppercase border-b border-slate-100 pb-2">
                                    {section.name}
                                  </h3>
                                  <ul className="space-y-2">
                                    {section.items.map((subItem, subIdx) => (
                                      <li key={subIdx}>
                                        <button
                                          onClick={() => {
                                            navigate('/marketplace');
                                            setActiveDropdown(null);
                                          }}
                                          className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-light block py-1"
                                        >
                                          {subItem.name}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}

                              {item.value === 'discover' && navigationMenu.discover.sections.map((section, idx) => (
                                <div key={idx}>
                                  <h3 className="text-xs font-semibold text-slate-900 mb-3 tracking-[0.25em] uppercase border-b border-slate-100 pb-2">
                                    {section.name}
                                  </h3>
                                  <ul className="space-y-2">
                                    {section.items.map((subItem, subIdx) => (
                                      <li key={subIdx}>
                                        <button
                                          onClick={() => {
                                            navigate('/' + subItem.link);
                                            setActiveDropdown(null);
                                          }}
                                          className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-light block py-1"
                                        >
                                          {subItem.name}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="w-full max-w-sm">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search artworks, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-10 w-full rounded-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus-visible:ring-2 focus-visible:ring-[#b30452]/30 focus-visible:border-[#b30452] focus:bg-white text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200"
                />
              </div>
            </form>
          </div>

          {/* Right Actions - Right */}
          <div className="flex items-center justify-end gap-3 lg:gap-4 text-xs lg:text-sm font-medium">
            <div className="hidden md:flex items-center gap-3 lg:gap-6">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hover:text-slate-900 text-slate-700 transition-colors uppercase flex items-center gap-2 whitespace-nowrap">
                      {user.name} <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(getPrimaryDashboardPath())}>
                      {user.role === 'user' ? 'My Profile' : 'My Dashboard'}
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/dashboard/admin')}>
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    {user.role === 'artist' && (
                      <DropdownMenuItem onClick={() => navigate('/dashboard/vendor')}>
                        Artist Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      logout();
                      navigate('/login');
                    }}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="flex items-center gap-1 text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
                  >
                    <User className="w-5 h-5" />
                    <span>Join</span>
                  </button>
                  <Button
                    onClick={() => navigate('/login')}
                    className="text-white px-5 py-2 text-xs lg:text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-250 border-0 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)]"
                    style={{ borderRadius: '10px' }}
                  >
                    Login / signup
                  </Button>
                </>
              )}

              <button onClick={() => navigate('/cart')} className="flex items-center gap-2 hover:text-slate-900 text-slate-700 transition-colors uppercase group whitespace-nowrap">
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 text-slate-700 group-hover:text-slate-900 transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#a73f2b] hover:bg-[#b30452] text-white text-[9px] w-3 h-3 flex items-center justify-center rounded-full font-medium shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </div>
                {user && <span className="hidden xl:inline">VIEW CART</span>}
              </button>
            </div>

            {/* Mobile Menu Button - Shown only on small screens */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-gray-100 bg-white overflow-y-auto max-h-[calc(100vh-80px)]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="px-6 py-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="pb-4 border-b border-gray-100">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="search"
                    placeholder="Search artworks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 w-full rounded-[10px] bg-white border border-gray-200 focus:border-[#b30452] focus:ring-1 focus:ring-[#b30452] shadow-sm transition-all text-sm"
                  />
                </div>
              </form>

              {navItems.map((item, index) => (
                <div key={item.value}>
                  <motion.button
                    onClick={() => {
                      if (item.hasDropdown) {
                        setActiveDropdown(activeDropdown === item.value ? null : item.value);
                      } else {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="flex items-center justify-between w-full text-left py-2 text-base font-medium text-gray-900 border-b border-gray-50 last:border-0"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.value ? 'rotate-180' : ''}`} />
                    )}
                  </motion.button>

                  {/* Mobile Accordion */}
                  <AnimatePresence>
                    {activeDropdown === item.value && item.hasDropdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-gray-50 rounded-lg mt-2"
                      >
                        <div className="p-4 space-y-4">
                          {(item.value === 'shop' ? navigationMenu.shop.sections : navigationMenu.discover.sections).map((section, idx) => (
                            <div key={idx}>
                              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{section.name}</h4>
                              <ul className="space-y-2 pl-2 border-l-2 border-gray-200">
                                {section.items.map((subItem, subIdx) => (
                                  <li key={subIdx}>
                                    <button
                                      onClick={() => {
                                        if (item.value === 'shop') {
                                          navigate('/marketplace');
                                        } else {
                                          navigate('/' + subItem.link);
                                        }
                                        setMobileMenuOpen(false);
                                      }}
                                      className="text-sm text-gray-700 block py-1"
                                    >
                                      {subItem.name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <motion.div
                className="pt-6 mt-6 border-t border-gray-100 space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: navItems.length * 0.05 }}
              >
                {user ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a73f2b] to-[#b30452] flex items-center justify-center text-white shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    {/* Mobile Dashboard Link */}
                    {user.role === 'admin' && (
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3"
                        onClick={() => {
                          navigate('/dashboard/admin');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Button>
                    )}

                    {user.role === 'artist' && (
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3"
                        onClick={() => {
                          navigate('/dashboard/vendor');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Artist Dashboard
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        navigate(getPrimaryDashboardPath());
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4" />
                      {user.role === 'user' ? 'My Profile' : 'My Dashboard'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        navigate(getOrdersPath());
                        setMobileMenuOpen(false);
                      }}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      My Orders
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        toast.success('Logged out successfully!');
                        logout();
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 w-full"
                      onClick={() => {
                        navigate('/register');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Join
                    </Button>
                  </div>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header >
  );
}
