import { motion } from 'motion/react';
import { Award, Heart, Users, Target, Palette, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { featuredArtists } from '../../data/mockData';

import { useNavigate } from 'react-router-dom';

export function AboutPage() {
  const navigate = useNavigate();
  const stats = [
    { label: 'Artists', value: '500+', icon: Users },
    { label: 'Artworks Sold', value: '10,000+', icon: TrendingUp },
    { label: 'Happy Customers', value: '5,000+', icon: Heart },
    { label: 'Years of Excellence', value: '5+', icon: Award },
  ];

  const values = [
    {
      icon: Palette,
      title: 'Artistic Excellence',
      description: 'We curate only the finest artworks from talented artists across India, ensuring quality and authenticity in every piece.'
    },
    {
      icon: Heart,
      title: 'Community First',
      description: 'Building a vibrant community of artists, collectors, and art enthusiasts who share a passion for creative expression.'
    },
    {
      icon: Target,
      title: 'Accessibility',
      description: 'Making art accessible to everyone by offering a wide range of products at various price points without compromising quality.'
    },
    {
      icon: Award,
      title: 'Fair Practice',
      description: 'Ensuring fair compensation for artists while providing transparent pricing and authentic artworks to our customers.'
    },
  ];

  const timeline = [
    { year: '2021', event: 'Artvpp Founded', description: 'Started with a vision to connect artists with art lovers' },
    { year: '2022', event: '100 Artists Onboarded', description: 'Reached our first milestone of partnering with talented artists' },
    { year: '2023', event: 'Launched Custom Commissions', description: 'Introduced personalized artwork services' },
    { year: '2024', event: 'Expanded to Digital Art', description: 'Added digital downloads and NFT marketplace' },
    { year: '2025', event: 'Workshops & Education', description: 'Started offering art education and skill development' },
    { year: '2026', event: 'Pan-India Presence', description: 'Serving customers across all major Indian cities' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl mb-6 text-[#111827]" style={{ fontFamily: 'Playfair Display, serif' }}>
              About <span className="text-[#a73f2b]">ArtVPP</span>
            </h1>
            <div className="w-24 h-1 bg-[#E5E7EB] mx-auto mb-8" />
            <p className="text-xl text-gray-600 leading-relaxed">
              India's Premier Platform for Art Commerce & Creative Services. We bridge the gap between talented artists
              and art enthusiasts, creating a vibrant marketplace for original artworks, custom commissions, and creative education.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 mb-3 rounded-full bg-[#FDE68A] text-[#92400E]">
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-[#F8F9FB]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border border-[#E5E7EB] hover:shadow-md transition-all">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Our Mission
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    To empower artists by providing them with a platform to showcase and sell their work while
                    making art accessible to everyone. We strive to preserve traditional art forms while embracing
                    contemporary creativity, fostering a sustainable ecosystem for the art community.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border border-[#E5E7EB] hover:shadow-md transition-all">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Our Vision
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    To become India's most trusted and comprehensive art commerce platform, where every artist
                    finds their audience and every art lover discovers their perfect piece. We envision a future
                    where art is an integral part of every home and business.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Our Core Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Artvpp
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-[#EEF2FF] text-[#4F46E5]">
                      <value.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Featured Artists */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Meet Our Featured Artists
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Talented creators who bring their unique vision to life
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredArtists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-transform hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {artist.name}
                      </h3>
                      <p className="text-sm text-[#4F46E5] mb-3">
                        {artist.specialty}
                      </p>
                      <div className="flex justify-center gap-4 text-sm text-gray-600">
                        <span>{artist.artworks} Artworks</span>
                        <span>•</span>
                        <span>{artist.followers} Followers</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#111827]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Join the Artvpp Community
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Whether you're an artist looking to showcase your work or an art lover seeking unique pieces,
              we welcome you to be part of our growing community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white font-medium rounded-[10px] hover:bg-[#d08e17] transition-colors"
              >
                Become a Vendor
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="px-8 py-3 bg-white text-[#111827] font-medium rounded-[10px] border border-[#E5E7EB] hover:bg-gray-50 transition-colors"
              >
                Explore Artworks
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
