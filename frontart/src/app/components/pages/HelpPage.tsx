import { useState } from 'react';
import {
  HelpCircle, Search, ShoppingCart, Package, CreditCard,
  Truck, RefreshCw, Shield, Mail, Phone, MessageCircle
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { motion } from 'motion/react';

import { useNavigate } from 'react-router-dom';



const faqCategories = [
  {
    id: 'general',
    title: 'General',
    icon: HelpCircle,
    faqs: [
      {
        question: 'What is Artvpp?',
        answer: 'Artvpp is an ArtCommerce & Creative Services Platform that connects art enthusiasts with talented artists. We offer a curated marketplace for original artworks, prints, and custom creative services including commissions and workshops.'
      },
      {
        question: 'How do I create an account?',
        answer: 'Click on the "Login" button in the header and select "Register". Fill in your details including name, email, and password. You\'ll receive a verification email to activate your account.'
      },
      {
        question: 'Is registration mandatory to browse products?',
        answer: 'No, you can browse our entire catalog without registering. However, you\'ll need an account to make purchases, save items to your wishlist, or access your order history.'
      },
      {
        question: 'How do I become a vendor?',
        answer: 'Go to your dashboard and apply to become a vendor. Our team will review your application and artwork samples. Once approved, you can start listing your products on our platform.'
      }
    ]
  },
  {
    id: 'orders',
    title: 'Orders',
    icon: ShoppingCart,
    faqs: [
      {
        question: 'How do I place an order?',
        answer: 'Browse our products, add items to your cart, and proceed to checkout. Fill in your shipping details, select a payment method, and confirm your order. You\'ll receive an order confirmation email.'
      },
      {
        question: 'Can I modify or cancel my order?',
        answer: 'You can cancel or modify your order within 24 hours of placement. After this period, please contact our support team for assistance. Orders that have already been shipped cannot be cancelled.'
      },
      {
        question: 'How can I track my order?',
        answer: 'Go to "My Orders" in your account dashboard. Click on the order you want to track to view real-time status updates and tracking information.'
      },
      {
        question: 'What if I receive a damaged item?',
        answer: 'We take great care in packaging, but if you receive a damaged item, please contact us within 48 hours with photos. We\'ll arrange for a replacement or full refund.'
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: CreditCard,
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept UPI, Credit/Debit Cards, Net Banking, and popular mobile wallets like Paytm, PhonePe, and Google Pay. All payments are processed through secure payment gateways.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, absolutely. We use industry-standard SSL encryption for all transactions. We never store your complete card details on our servers. All payments are processed through PCI-DSS compliant payment gateways.'
      },
      {
        question: 'When will my payment be deducted?',
        answer: 'For prepaid orders, payment is deducted immediately upon order confirmation. For Cash on Delivery orders (if available), payment is collected at the time of delivery.'
      },
      {
        question: 'How long do refunds take?',
        answer: 'Refunds are processed within 5-7 business days of approval. The amount will be credited to your original payment method. Bank processing may take an additional 2-3 business days.'
      }
    ]
  },
  {
    id: 'shipping',
    title: 'Shipping',
    icon: Truck,
    faqs: [
      {
        question: 'Where do you ship?',
        answer: 'We currently ship across India to all pin codes serviceable by our courier partners. International shipping is available for select products. Please check product details for shipping availability.'
      },
      {
        question: 'What are the shipping charges?',
        answer: 'Shipping charges vary based on product size, weight, and delivery location. Free shipping is available on orders above ₹5,000. Exact charges will be displayed at checkout before payment.'
      },
      {
        question: 'How long does delivery take?',
        answer: 'Metro cities: 3-5 business days. Other cities: 5-7 business days. Remote areas: 7-10 business days. Custom artworks may take longer depending on creation time.'
      },
      {
        question: 'Do you offer express shipping?',
        answer: 'Yes, express shipping is available for select products at an additional cost. Express delivery typically takes 1-2 business days for metro cities.'
      }
    ]
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    icon: RefreshCw,
    faqs: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 7-day return policy for most products. Items must be unused and in original packaging. Custom-made and commissioned artworks are non-returnable unless damaged.'
      },
      {
        question: 'How do I initiate a return?',
        answer: 'Go to "My Orders", select the order, and click "Return Item". Choose a return reason and submit. Our team will review and approve your return request within 24 hours.'
      },
      {
        question: 'Who pays for return shipping?',
        answer: 'If the return is due to our error (wrong item, damaged, etc.), we cover return shipping. For other reasons, return shipping charges apply as per our policy.'
      },
      {
        question: 'Can I exchange an item?',
        answer: 'Yes, exchanges are possible subject to availability. Initiate a return and place a new order for the desired item, or contact our support team for direct exchange assistance.'
      }
    ]
  },
  {
    id: 'custom',
    title: 'Custom Services',
    icon: Package,
    faqs: [
      {
        question: 'How do custom commissions work?',
        answer: 'Browse artists, view their portfolios, and send a commission request with your requirements. The artist will provide a quote and timeline. Once you approve and make payment, they\'ll start working on your custom piece.'
      },
      {
        question: 'How long do custom commissions take?',
        answer: 'Timeline varies by project complexity and artist availability, typically ranging from 2-8 weeks. Your artist will provide an estimated completion date when accepting the commission.'
      },
      {
        question: 'Can I request changes to a custom commission?',
        answer: 'Yes, most artists offer 2-3 rounds of revisions. Major changes after work begins may incur additional charges. Discuss revision policy with your artist before starting.'
      },
      {
        question: 'Are workshops available online and offline?',
        answer: 'We offer both online and in-person workshops. Check the workshop details page for format information, schedule, and location (for offline workshops).'
      }
    ]
  }
];

const quickLinks = [
  { icon: ShoppingCart, title: 'Track Order', description: 'Check your order status', page: 'orders' },
  { icon: CreditCard, title: 'Payment Methods', description: 'View accepted payments', category: 'payments' },
  { icon: RefreshCw, title: 'Returns', description: 'Return policy details', category: 'returns' },
  { icon: Shield, title: 'Privacy & Security', description: 'How we protect your data', page: 'contact' }
];

export function HelpPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would filter FAQ results
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HelpCircle className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">How Can We Help You?</h1>
            <p className="text-xl mb-8 opacity-90">
              Find answers to common questions or get in touch with our support team
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-full text-gray-900"
                />
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                  if (link.page) {
                    if (link.page === 'orders') navigate('/dashboard/user/orders');
                    else if (link.page === 'contact') navigate('/contact');
                    else navigate(`/${link.page}`);
                  }
                  else if (link.category) setSelectedCategory(link.category);
                }}>
                  <CardContent className="pt-6 text-center">
                    <link.icon className="w-10 h-10 text-[#a73f2b] mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
              {faqCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="gap-2">
                  <category.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {faqCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <Card>
                  <CardContent className="pt-6">
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* Contact Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-[#a73f2b]/10 to-[#a73f2b]/10">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Still Need Help?</h2>
                <p className="text-gray-600">Our support team is here to assist you</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <Mail className="w-10 h-10 text-[#a73f2b] mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Email Support</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      support@artvpp.com
                    </p>
                    <p className="text-xs text-gray-500">Response in 24 hours</p>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <Phone className="w-10 h-10 text-[#a73f2b] mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Phone Support</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      +91 98765 43210
                    </p>
                    <p className="text-xs text-gray-500">Mon-Sat, 10 AM - 6 PM</p>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <MessageCircle className="w-10 h-10 text-[#a73f2b] mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Live Chat</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Chat with us now
                    </p>
                    <p className="text-xs text-gray-500">Available 24/7</p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-8">
                <Button onClick={() => navigate('/contact')} className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:bg-[#B8941F]">
                  Contact Support Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
