import { Home, Search, ShoppingBag, Palette, ArrowLeft } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Artistic 404 */}
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[180px] font-['Playfair_Display'] font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#a73f2b] to-[#a73f2b] leading-none">
            404
          </h1>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#a73f2b]"></div>
            <Palette className="w-8 h-8 text-[#a73f2b]" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#a73f2b]"></div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off into the gallery.
            Let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#a73f2b] to-[#C9A858] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>

          <button
            onClick={() => navigate('/marketplace')}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-[#a73f2b] text-[#a73f2b] rounded-full font-semibold hover:bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:text-white transition-all duration-300"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Art
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Popular Sections
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/marketplace')}
              className="p-4 rounded-lg border border-gray-200 hover:border-[#a73f2b] hover:shadow-md transition-all duration-300 group"
            >
              <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-[#a73f2b] group-hover:text-[#a73f2b] transition-colors" />
              <span className="text-sm font-medium text-gray-700">Shop</span>
            </button>

            <button
              onClick={() => navigate('/services')}
              className="p-4 rounded-lg border border-gray-200 hover:border-[#a73f2b] hover:shadow-md transition-all duration-300 group"
            >
              <Palette className="w-6 h-6 mx-auto mb-2 text-[#a73f2b] group-hover:text-[#a73f2b] transition-colors" />
              <span className="text-sm font-medium text-gray-700">Services</span>
            </button>

            <button
              onClick={() => navigate('/about')}
              className="p-4 rounded-lg border border-gray-200 hover:border-[#a73f2b] hover:shadow-md transition-all duration-300 group"
            >
              <Search className="w-6 h-6 mx-auto mb-2 text-[#a73f2b] group-hover:text-[#a73f2b] transition-colors" />
              <span className="text-sm font-medium text-gray-700">About</span>
            </button>

            <button
              onClick={() => navigate('/contact')}
              className="p-4 rounded-lg border border-gray-200 hover:border-[#a73f2b] hover:shadow-md transition-all duration-300 group"
            >
              <ArrowLeft className="w-6 h-6 mx-auto mb-2 text-[#a73f2b] group-hover:text-[#a73f2b] transition-colors" />
              <span className="text-sm font-medium text-gray-700">Contact</span>
            </button>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="mt-12 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] animate-pulse delay-75"></div>
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}
