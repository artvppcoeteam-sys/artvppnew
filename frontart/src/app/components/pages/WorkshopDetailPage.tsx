import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Users, MapPin, Check, Star, Award, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { workshops } from '../../data/mockData';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';

export function WorkshopDetailPage() {
  const { id: workshopId } = useParams();
  const navigate = useNavigate();
  const workshop = workshops.find(w => w.id === workshopId);
  const [seats, setSeats] = useState(1);

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Workshop not found</h2>
          <Button onClick={() => navigate('/services')}>Back to Services</Button>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    toast.success(`${seats} seat(s) for "${workshop.title}" added to cart!`);
  };

  const relatedWorkshops = workshops.filter(w => w.id !== workshop.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/services')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#a73f2b] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Creative Services
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative">
        <div className="aspect-[21/9] overflow-hidden bg-gray-900">
          <img
            src={workshop.image}
            alt={workshop.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-[1400px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="mb-4 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white border-0 text-base px-4 py-1">
                  {workshop.level}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-light mb-4 text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {workshop.title}
                </h1>
                <p className="text-xl text-white/90 mb-6 font-light">
                  with {workshop.instructor}
                </p>
                <div className="flex items-center gap-2 text-white/80">
                  <Star className="w-5 h-5 fill-[#a73f2b] text-[#a73f2b]" />
                  <span className="font-semibold text-white">4.8</span>
                  <span>(87 reviews)</span>
                  <span className="mx-2">•</span>
                  <span>243 students enrolled</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Workshop Overview
              </h2>
              <p className="text-lg text-gray-600 font-light leading-relaxed mb-6">
                {workshop.description}
              </p>
              <p className="text-gray-600 font-light leading-relaxed">
                This workshop is designed to provide you with hands-on experience and practical skills.
                Whether you're a beginner or looking to enhance your existing skills, our expert instructor
                will guide you through every step of the creative process.
              </p>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                What's Included
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {workshop.includes.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Curriculum */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                What You'll Learn
              </h2>
              <div className="space-y-4">
                {[
                  'Fundamental techniques and best practices',
                  'Step-by-step guidance from expert instructor',
                  'Hands-on practice with real projects',
                  'Tips and tricks from years of experience',
                  'Common mistakes and how to avoid them',
                  'Portfolio-ready work to showcase your skills'
                ].map((item, index) => (
                  <Card key={index} className="border-l-4 border-l-[#a73f2b] hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-light text-[#a73f2b]">{index + 1}</span>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Instructor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Meet Your Instructor
              </h2>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#a73f2b] to-[#a73f2b] rounded-full flex items-center justify-center text-3xl text-white font-light">
                      {workshop.instructor.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-medium mb-2 text-gray-900">{workshop.instructor}</h3>
                      <p className="text-gray-600 font-light mb-4">
                        Professional Artist & Educator
                      </p>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        With over 15 years of experience in the field, our instructor brings a wealth of knowledge
                        and practical insights to every workshop. Known for their patient teaching style and ability
                        to break down complex concepts into easy-to-understand steps.
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#a73f2b]" />
                          <span>15+ years experience</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#a73f2b]" />
                          <span>1,200+ students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 fill-[#a73f2b] text-[#a73f2b]" />
                          <span>4.9 rating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-light mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Student Reviews
              </h2>
              <div className="space-y-4">
                {[
                  { name: 'Priya Sharma', rating: 5, comment: 'Absolutely loved this workshop! The instructor was knowledgeable and patient. I learned so much!' },
                  { name: 'Amit Patel', rating: 5, comment: 'Best workshop I\'ve attended. Great hands-on practice and the materials provided were top-notch.' },
                  { name: 'Sneha Reddy', rating: 4, comment: 'Very informative and well-structured. Would definitely recommend to anyone interested in learning.' }
                ].map((review, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#a73f2b] to-[#a73f2b] rounded-full flex items-center justify-center text-white font-medium">
                          {review.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{review.name}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-[#a73f2b] text-[#a73f2b]' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 font-light">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-8"
            >
              <Card className="shadow-xl border-2 border-gray-100">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <p className="text-4xl font-light text-gray-900 mb-2">
                      ₹{workshop.price.toLocaleString()}
                    </p>
                    <p className="text-gray-600 font-light">per person</p>
                  </div>

                  <div className="space-y-4 mb-8 pb-8 border-b">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="w-5 h-5 text-[#a73f2b]" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{workshop.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="w-5 h-5 text-[#a73f2b]" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium">{workshop.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users className="w-5 h-5 text-[#a73f2b]" />
                      <div>
                        <p className="text-sm text-gray-600">Available Spots</p>
                        <p className="font-medium">{workshop.spots} remaining</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-[#a73f2b]" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">Mumbai Studio</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Seats
                    </label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSeats(Math.max(1, seats - 1))}
                        className="w-10 h-10 p-0"
                      >
                        -
                      </Button>
                      <span className="text-2xl font-light text-gray-900 min-w-[3rem] text-center">
                        {seats}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSeats(Math.min(workshop.spots, seats + 1))}
                        className="w-10 h-10 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-700">Total</span>
                      <span className="font-medium text-gray-900">
                        ₹{(workshop.price * seats).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleBookNow}
                    className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:from-[#a73f2b] hover:to-[#a73f2b] text-white py-6 text-base rounded-none font-medium mb-4"
                  >
                    BOOK NOW
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    Secure booking • Free cancellation up to 7 days before
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Related Workshops */}
      {relatedWorkshops.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-light mb-12 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
              More Workshops
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedWorkshops.map((relatedWorkshop, index) => (
                <motion.div
                  key={relatedWorkshop.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer h-full">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={relatedWorkshop.image}
                        alt={relatedWorkshop.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 right-4 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white border-0">
                        {relatedWorkshop.level}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-medium mb-2 text-gray-900">{relatedWorkshop.title}</h3>
                      <p className="text-sm text-gray-600 font-light mb-4">with {relatedWorkshop.instructor}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-light text-gray-900">
                          ₹{relatedWorkshop.price.toLocaleString()}
                        </span>
                        <Button variant="ghost" className="text-[#a73f2b]">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
