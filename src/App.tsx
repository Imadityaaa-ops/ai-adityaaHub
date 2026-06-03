/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Instagram, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  Menu, 
  X, 
  ArrowRight, 
  Clock, 
  Award, 
  Users, 
  Sparkles,
  MessageCircle,
  ChevronDown,
  Facebook,
  Twitter,
  Send,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring, useInView } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

import regeneratedHeroLogo from './assets/images/regenerated_image_1780323875191.png';
import regeneratedNavLogo from './assets/images/regenerated_image_1780323945968.png';
import regeneratedBookNowQr from './assets/images/regenerated_image_1780323981741.jpg';
import regeneratedContactQr from './assets/images/regenerated_image_1780323984767.jpg';

// --- Types ---
interface Service {
  id: string;
  category: 'Makeup' | 'Hair' | 'Training';
  name: string;
  price: string;
  description: string;
  image: string;
}

// --- Data ---
const SERVICES: Service[] = [
  // Makeup
  { id: 'm1', category: 'Makeup', name: '3D Makeup', price: '₹12,000 – ₹18,000', description: 'Advanced 3D contouring and highlighting for a sculpted, camera-ready look.', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=100&w=1200' },
  { id: 'm2', category: 'Makeup', name: 'Matte Glass Finish', price: '₹10,000 – ₹15,000', description: 'A perfect balance of matte longevity and glass-skin radiance.', image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=100&w=1200' },
  { id: 'm3', category: 'Makeup', name: 'Bridal Makeup', price: '₹18,000 – ₹35,000', description: 'Luxury bridal transformation including draping and hair styling.', image: 'https://images.unsplash.com/photo-1595475241949-0300362846f4?auto=format&fit=crop&q=100&w=1200' },
  { id: 'm4', category: 'Makeup', name: 'Party Makeup', price: '₹3,000 – ₹6,000', description: 'Elegant makeup for any special occasion or event.', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=100&w=1200' },
  { id: 'm5', category: 'Makeup', name: 'Engagement Makeup', price: '₹10,000 – ₹18,000', description: 'Sophisticated look tailored for your engagement ceremony.', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=100&w=1200' },
  { id: 'm6', category: 'Makeup', name: 'Maternity Shoot Makeup', price: '₹5,000 – ₹8,000', description: 'Soft, glowing makeup to celebrate your motherhood journey.', image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&q=100&w=1200' },
  
  // Hair
  { id: 'h1', category: 'Hair', name: 'Keratin Treatment', price: '₹4,000 – ₹8,000', description: 'Smooth, frizz-free hair with our premium keratin infusion.', image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=100&w=1200' },
  { id: 'h2', category: 'Hair', name: 'Hair Botox', price: '₹6,000 – ₹12,000', description: 'Deep conditioning treatment that repairs damaged hair fibers.', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=100&w=1200' },
  { id: 'h3', category: 'Hair', name: 'Hair Spa', price: '₹1,200 – ₹2,500', description: 'Relaxing scalp massage and deep nourishment for healthy hair.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=100&w=1200' },
  { id: 'h4', category: 'Hair', name: 'Smoothening', price: '₹3,500 – ₹7,000', description: 'Get sleek, straight hair that lasts for months.', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=100&w=1200' },
  { id: 'h5', category: 'Hair', name: 'Hair Color', price: '₹2,000 – ₹6,000', description: 'Professional global color or highlights using international brands.', image: 'https://images.unsplash.com/photo-1516914915600-896acb9c0373?auto=format&fit=crop&q=100&w=1200' },
  
  // Training
  { id: 't1', category: 'Training', name: 'Professional Makeup Course', price: '₹45,000', description: 'Comprehensive 3-month course covering all aspects of professional makeup.', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&q=100&w=1200' },
  { id: 't2', category: 'Training', name: 'Advanced Bridal Course', price: '₹35,000', description: 'Master the art of luxury Indian bridal transformations.', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=100&w=1200' },
  { id: 't3', category: 'Training', name: 'Self Makeup Course', price: '₹8,000', description: 'Learn to do your own makeup like a pro in just 5 days.', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=100&w=1200' },
];

const TESTIMONIALS = [
  { name: 'Priyanka S.', review: 'My bridal look was beyond expectations. The finish was flawless and long-lasting.', stars: 5 },
  { name: 'Sneha R.', review: 'Best makeup artist in Latur. Professional and very polite team.', stars: 5 },
  { name: 'Aarti P.', review: 'The keratin treatment transformed my damaged hair completely.', stars: 5 },
  { name: 'Komal T.', review: 'I completed the professional makeup course and now I work independently.', stars: 5 },
];

const FAQS = [
  { q: "How early should I book for my bridal makeup?", a: "We recommend booking at least 3-6 months in advance to secure your date, especially during peak wedding seasons." },
  { q: "Do you use international makeup brands?", a: "Yes, we use premium international brands like MAC, Huda Beauty, Estée Lauder, and Kryolan to ensure a flawless finish." },
  { q: "Is a trial session available for bridal makeup?", a: "Yes, we offer paid trial sessions where we can discuss and test your desired look before the big day." },
  { q: "What is the duration of the Professional Makeup Course?", a: "Our professional course typically lasts 3 months with daily practical sessions and theory." },
  { q: "Do you provide on-site services for weddings?", a: "Yes, our team is available for on-site bridal services across Maharashtra and beyond." },
];

// --- Components ---

const StatCounter = ({ end, label, suffix = "" }: { end: number, label: string, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, end]);

  return (
    <div ref={ref} className="text-center p-6">
      <div className="text-4xl md:text-5xl font-playfair font-bold text-gold mb-2">
        {count}{suffix}
      </div>
      <div className="text-stone-500 uppercase tracking-widest text-xs font-semibold">
        {label}
      </div>
    </div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'Makeup' | 'Hair' | 'Training'>('Makeup');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    phoneNumber: '',
    service: '',
    date: '',
    time: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // 1. Save to Cloud Firestore
      const firestorePayload: any = {
        fullName: bookingForm.fullName,
        phoneNumber: bookingForm.phoneNumber,
        service: bookingForm.service,
        date: bookingForm.date,
        createdAt: serverTimestamp()
      };
      if (bookingForm.time) {
        firestorePayload.time = bookingForm.time;
      }
      if (bookingForm.message) {
        firestorePayload.message = bookingForm.message;
      }

      try {
        await addDoc(collection(db, 'bookings'), firestorePayload);
      } catch (fbError) {
        // Instrument to parse and catch security/quota errors using specialized guidelines
        handleFirestoreError(fbError, OperationType.WRITE, 'bookings');
      }

      // 2. Forward to email dispatch service
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingForm),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSubmitStatus({ 
          type: 'success', 
          message: 'Booking request received! Your info is saved in our database and successfully sent to our email. We will contact you shortly.' 
        });
        setBookingForm({ fullName: '', phoneNumber: '', service: '', date: '', time: '', message: '' });
      } else {
        throw new Error(data.error || 'Failed to send email confirmation, but your booking is securely registered in our database.');
      }
    } catch (error: any) {
      setSubmitStatus({ 
        type: 'error', 
        message: error.message || 'Something went wrong. Please try again or contact us via WhatsApp.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const timer = setTimeout(() => setShowOfferPopup(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="relative overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gold z-[100] origin-left" style={{ scaleX }} />

      {/* Sticky Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-gold/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('hero')}>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold/50 shadow-xl bg-stone-950 flex items-center justify-center">
            <img 
              src={regeneratedNavLogo} 
              alt="Sejal Makeover Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-2xl font-playfair font-bold tracking-tighter text-stone-800">
            Sejal <span className="text-gold">Makeover</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {['About', 'Services', 'Gallery', 'Academy', 'Contact'].map((item) => (
            <button 
              key={item} 
              onClick={() => scrollTo(item.toLowerCase())}
              className="text-sm font-medium text-stone-600 hover:text-gold transition-colors uppercase tracking-widest"
            >
              {item}
            </button>
          ))}
          <button 
            onClick={() => scrollTo('booking')}
            className="bg-gold text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-gold/90 transition-all gold-glow"
          >
            Book Now
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-stone-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-cream flex flex-col items-center justify-center gap-8 pt-20"
          >
            {['About', 'Services', 'Gallery', 'Academy', 'Contact'].map((item) => (
              <button 
                key={item} 
                onClick={() => scrollTo(item.toLowerCase())}
                className="text-2xl font-playfair text-stone-800 hover:text-gold"
              >
                {item}
              </button>
            ))}
            <button 
              onClick={() => scrollTo('booking')}
              className="bg-gold text-white px-10 py-4 rounded-full text-lg font-semibold"
            >
              Book Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=100&w=1920" 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blush/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gold/50 shadow-2xl gold-glow bg-stone-950 flex items-center justify-center animate-pulse">
              <img 
                src={regeneratedHeroLogo} 
                alt="Sejal Makeover Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="inline-block px-4 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-[0.3em] mb-6">
            Latur's Finest Beauty Studio
          </div>
          <h1 className="text-5xl md:text-8xl font-playfair font-bold text-stone-800 leading-tight mb-6">
            Luxury Makeup & <br /> <span className="text-gold-gradient italic">Beauty Studio</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-600 font-light tracking-wide mb-10 max-w-2xl mx-auto">
            Bridal | HD | 3D | Hair Treatments | Professional Training
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => scrollTo('booking')}
              className="group relative bg-gold text-white px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-all gold-glow"
            >
              <span className="relative z-10 flex items-center gap-2">
                Book Your Glam Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            <button 
              onClick={() => scrollTo('academy')}
              className="px-8 py-4 rounded-full font-bold text-lg border-2 border-gold text-gold hover:bg-gold hover:text-white transition-all"
            >
              Enroll in Academy
            </button>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&q=100&w=1200" 
                alt="Sejal Makeover Studio" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 glass p-8 rounded-3xl shadow-xl hidden lg:block border border-gold/20">
              <div className="text-5xl font-playfair font-bold text-gold">15+</div>
              <div className="text-stone-500 uppercase tracking-widest text-xs font-bold">Years of Excellence</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-stone-800 mb-8">
              Elegance, Precision, <br /> & <span className="text-gold">Trust</span>
            </h2>
            <p className="text-stone-600 leading-relaxed mb-8 text-lg font-light">
              Sejal Makeover is a premium beauty and makeup studio in Latur delivering luxury bridal transformations, advanced hair treatments, and professional certification courses. With 15+ years of experience and 5000+ happy clients, we are known for precision, elegance, and trust.
            </p>
            
            <div className="space-y-4 mb-10">
              {[
                'Certified Makeup Artists',
                'Premium International Products',
                'Luxury Studio Ambience',
                'Personalized Consultation',
                '100% Satisfaction Rate'
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-gold w-5 h-5" />
                  <span className="text-stone-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-blush/30 rounded-2xl border border-blush">
              <h4 className="font-playfair font-bold text-xl text-stone-800 mb-2 italic">Our Mission</h4>
              <p className="text-stone-600 italic">"Empower women with confidence through professional beauty artistry."</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-cream border-y border-gold/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter end={5000} label="Happy Clients" suffix="+" />
          <StatCounter end={50} label="Premium Services" suffix="+" />
          <StatCounter end={100} label="Satisfaction Rate" suffix="%" />
          <StatCounter end={15} label="Years Experience" suffix="+" />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-playfair font-bold text-stone-800 mb-6">Our Signature <span className="text-gold">Services</span></h2>
          <p className="text-stone-500 max-w-2xl mx-auto">Indulge in our range of luxury beauty treatments designed to make you look and feel your absolute best.</p>
          
          <div className="flex justify-center gap-4 mt-12 flex-wrap">
            {['Makeup', 'Hair', 'Training'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                  ? 'bg-gold text-white gold-glow' 
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="wait">
            {SERVICES.filter(s => s.category === activeCategory).map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-6">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white font-bold flex items-center gap-2">View Details <ChevronRight className="w-4 h-4" /></span>
                  </div>
                </div>
                <h3 className="text-2xl font-playfair font-bold text-stone-800 mb-2">{service.name}</h3>
                <div className="text-gold font-bold text-lg mb-2">{service.price}</div>
                <p className="text-stone-500 text-sm line-clamp-2">{service.description}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Training Academy Section */}
      <section id="academy" className="py-24 px-6 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gold/5 -skew-x-12 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-4 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest mb-6">
              Empowering Future Artists
            </div>
            <h2 className="text-4xl md:text-6xl font-playfair font-bold mb-8 leading-tight">
              Sejal Makeover <br /> <span className="text-gold">Training Academy</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {[
                { icon: <Award />, title: 'Certification', desc: 'Government recognized certificates' },
                { icon: <Users />, title: 'Placement', desc: '100% placement assistance' },
                { icon: <Sparkles />, title: 'Hands-on', desc: 'Practical training on live models' },
                { icon: <CheckCircle2 />, title: 'Kit Guidance', desc: 'Professional product knowledge' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="text-gold mt-1">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-stone-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => scrollTo('booking')}
              className="bg-gold text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-gold/90 transition-all gold-glow"
            >
              Start Your Makeup Career Today
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=100&w=800" alt="Training" className="rounded-2xl w-full aspect-[3/4] object-cover" referrerPolicy="no-referrer" />
              <img src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&q=100&w=800" alt="Training" className="rounded-2xl w-full aspect-square object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-4 pt-8">
              <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=100&w=800" alt="Training" className="rounded-2xl w-full aspect-square object-cover" referrerPolicy="no-referrer" />
              <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=100&w=800" alt="Training" className="rounded-2xl w-full aspect-[3/4] object-cover" referrerPolicy="no-referrer" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-6 bg-cream">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-stone-800 mb-6">Our <span className="text-gold">Masterpieces</span></h2>
          <p className="text-stone-500">Witness the magic of our transformations.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'https://images.unsplash.com/photo-1595475241949-0300362846f4?auto=format&fit=crop&q=100&w=1200',
            'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=100&w=1200',
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=100&w=1200',
            'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=100&w=1200',
            'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=100&w=1200',
            'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=100&w=1200',
            'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&q=100&w=1200',
            'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&q=100&w=1200'
          ].map((img, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img 
                src={img} 
                alt={`Masterpiece ${i + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gold/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="text-white w-8 h-8" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-stone-800 mb-6">What Our <span className="text-gold">Clients Say</span></h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-cream border border-gold/10 relative"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-stone-600 italic mb-6 leading-relaxed">"{t.review}"</p>
                <div className="font-bold text-stone-800">— {t.name}</div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                  <Sparkles className="text-gold w-6 h-6" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Book Now Section with QR Codes */}
      <section id="book-now" className="py-24 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-playfair font-bold text-stone-800 mb-6">Book <span className="text-gold">Now</span></h2>
            <p className="text-stone-500 max-w-2xl mx-auto">Scan the QR codes below for quick payment and easy navigation to our studio.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Payment QR */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-6 rounded-[2.5rem] border border-[#00b9f5]/30 shadow-2xl text-center flex flex-col items-center bg-gradient-to-b from-[#e8f6ff] to-white"
            >
              <div className="w-full max-w-sm rounded-[2rem] bg-white border border-[#00b9f5]/15 overflow-hidden p-5 shadow-lg flex flex-col justify-between">
                {/* Header Row */}
                <div className="flex justify-between items-center mb-5 gap-3">
                  {/* Left Column logos */}
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-black text-[#00b9f5]">pay</span>
                      <span className="text-xl font-black text-[#002e6e]">tm</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] bg-stone-150 text-stone-500 font-bold px-1 py-0.5 rounded border border-stone-200 leading-none">से</span>
                      <span className="text-xs font-black italic tracking-tight text-[#005e82] flex items-center">
                        U<span className="text-[#e27d14]">P</span><span className="text-[#20a44d]">I</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column details */}
                  <div className="flex flex-col gap-1 items-end flex-1 max-w-[200px]">
                    <div className="bg-stone-50 border border-stone-100 rounded-md px-2 py-1 w-full text-center">
                      <div className="text-[10px] font-bold text-stone-800 uppercase tracking-tight truncate">
                        SEJAL BEAUTY PARLOR
                      </div>
                    </div>
                    <div className="bg-stone-50 border border-stone-100 rounded-md px-2 py-1 w-full text-center">
                      <div className="text-xs font-bold text-stone-900 tracking-wider">
                        8830719663
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main QR Area inside the Card */}
                <div className="bg-gradient-to-b from-[#00b9f5] to-[#005e82] p-5 rounded-3xl text-white shadow-inner flex flex-col items-center relative gap-4">
                  
                  {/* PayTM logo again white */}
                  <div className="text-center">
                    <span className="text-2xl font-black text-white">paytm</span>
                    <div className="text-[10px] tracking-widest font-bold uppercase opacity-90 mt-0.5">Accepted Here</div>
                  </div>

                  {/* Dynamic Clear QR */}
                  <a 
                    href="upi://pay?pa=paytmqr6krgi5@ptys&pn=SEJAL%20BEAUTY%20PARLOR&cu=INR" 
                    className="w-full aspect-square bg-white rounded-2xl p-4 flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer relative group"
                    title="Click to pay directly on mobile"
                  >
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=upi://pay?pa=paytmqr6krgi5@ptys%26pn=SEJAL%2520BEAUTY%2520PARLOR%26cu=INR" 
                      alt="Sejal Beauty Parlor Paytm QR" 
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </a>

                  {/* UPI ID Info Text */}
                  <div className="text-xs font-bold font-mono tracking-tight text-white bg-black/20 px-3 py-1.5 rounded-full">
                    UPI ID: paytmqr6krgi5@ptys
                  </div>

                  {/* BHIM UPI Bottom Logos */}
                  <div className="flex items-center justify-center gap-2 mt-1 py-1 px-3 border border-white/20 rounded-lg bg-white/5 w-full">
                    <span className="text-[10px] font-extrabold italic tracking-tight text-white">
                      BHIM <span className="text-[#f1ca49]">▶</span>
                    </span>
                    <span className="text-white/40">|</span>
                    <span className="text-[10px] font-black italic tracking-widest text-[#5de38f]">
                      UPI<span className="text-[#f1ca49]">▶</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-sm font-bold text-stone-700 uppercase tracking-widest">
                Scan or Tap to Pay securely via any UPI App
              </div>
            </motion.div>

            {/* Location QR */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative p-6 rounded-[2.5rem] border border-[#4285F4]/30 shadow-2xl text-center flex flex-col items-center bg-gradient-to-b from-[#f8f9fa] to-white"
            >
              <div className="w-full max-w-sm rounded-[2rem] bg-white border border-stone-150 overflow-hidden p-5 shadow-lg flex flex-col justify-between">
                {/* Header Row */}
                <div className="flex justify-between items-center mb-5 gap-3">
                  {/* Google Maps Brand Style */}
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] flex items-center justify-center text-[#4285F4] shadow-sm">
                      <MapPin className="w-6 h-6 text-[#ea4335] fill-[#ea4335]/20 animate-bounce" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-black tracking-tight text-stone-800">GOOGLE MAPS</span>
                      <span className="text-[10px] text-[#34a853] font-extrabold tracking-wider uppercase">Easy Navigation</span>
                    </div>
                  </div>

                  {/* Location Pin Details */}
                  <div className="flex flex-col gap-0.5 items-end max-w-[150px]">
                    <span className="text-[11px] font-bold text-stone-700 truncate w-full text-right">Sejal Makeover</span>
                    <span className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest text-right">Latur, MH</span>
                  </div>
                </div>

                {/* Main QR Area */}
                <div className="bg-gradient-to-b from-[#4285F4] to-[#1a73e8] p-5 rounded-3xl text-white shadow-inner flex flex-col items-center relative gap-4">
                  
                  {/* Header Title inside QR Area */}
                  <div className="text-center font-playfair">
                    <span className="text-xl font-bold text-white tracking-wide">Studio Location</span>
                    <div className="text-[9px] tracking-widest font-bold uppercase opacity-90 mt-0.5">Kulswamini Nagar</div>
                  </div>

                  {/* Guaranteed Dynamic QR Code Image */}
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Sejal+Makeover+Kulswamini+Nagar+Latur+Maharashtra" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full aspect-square bg-white rounded-2xl p-4 flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer relative group"
                    title="Click to open route in Google Maps"
                  >
                    <img 
                      src={regeneratedBookNowQr} 
                      alt="Sejal Makeover Location QR Code" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </a>

                  {/* Helpful Quick action line */}
                  <div className="text-[10px] font-bold tracking-wider text-white bg-black/20 px-3 py-1.5 rounded-full uppercase">
                    Scan or Tap to Open Route
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm font-bold text-stone-700 uppercase tracking-widest">
                Scan or Tap to Navigate instantly on Google Maps
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-24 px-6 bg-blush/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-playfair font-bold text-stone-800 mb-8 leading-tight">
              Book Your <br /> <span className="text-gold">Glam Session</span>
            </h2>
            <p className="text-stone-600 mb-10 text-lg">
              Fill out the form below or reach out to us directly via WhatsApp for instant booking and consultation.
            </p>

            <div className="space-y-6 mb-12">
              <a href="https://wa.me/918830719663" className="flex items-center gap-4 p-4 glass rounded-2xl hover:bg-white/50 transition-all group">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-stone-800">WhatsApp Booking</div>
                  <div className="text-stone-500 text-sm">Instant response & consultation</div>
                </div>
                <ChevronRight className="ml-auto text-stone-400 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass p-8 md:p-12 rounded-[2rem] border border-white/40 shadow-2xl"
          >
            <form className="space-y-6" onSubmit={handleBookingSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-gold/10 focus:border-gold focus:ring-0 transition-all outline-none" 
                    placeholder="Enter your name"
                    value={bookingForm.fullName}
                    onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-gold/10 focus:border-gold focus:ring-0 transition-all outline-none" 
                    placeholder="Your mobile number"
                    value={bookingForm.phoneNumber}
                    onChange={(e) => setBookingForm({ ...bookingForm, phoneNumber: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600 uppercase tracking-widest">Service Selection</label>
                <select 
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-gold/10 focus:border-gold focus:ring-0 transition-all outline-none appearance-none"
                  value={bookingForm.service}
                  onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })}
                >
                  <option value="">Select a service</option>
                  <optgroup label="Makeup">
                    <option>Bridal Makeup</option>
                    <option>3D Makeup</option>
                    <option>Party Makeup</option>
                  </optgroup>
                  <optgroup label="Hair">
                    <option>Keratin Treatment</option>
                    <option>Hair Botox</option>
                    <option>Hair Spa</option>
                  </optgroup>
                  <optgroup label="Training">
                    <option>Professional Makeup Course</option>
                    <option>Self Makeup Course</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600 uppercase tracking-widest">Preferred Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-gold/10 focus:border-gold focus:ring-0 transition-all outline-none"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600 uppercase tracking-widest">Preferred Time</label>
                  <input 
                    type="time" 
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-gold/10 focus:border-gold focus:ring-0 transition-all outline-none"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600 uppercase tracking-widest">Message (Optional)</label>
                <textarea 
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-gold/10 focus:border-gold focus:ring-0 transition-all outline-none min-h-[100px]"
                  placeholder="Any special requests?"
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                ></textarea>
              </div>

              {submitStatus && (
                <div className={`p-4 rounded-xl text-sm font-bold ${submitStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {submitStatus.message}
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold text-white py-5 rounded-2xl font-bold text-lg hover:bg-gold/90 transition-all gold-glow shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending Request...' : 'Confirm Booking Request'}
              </button>
              
              <p className="text-center text-stone-400 text-xs uppercase tracking-widest">We will contact you shortly to confirm your slot.</p>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-playfair font-bold text-stone-800 text-center mb-16">Frequently Asked <span className="text-gold">Questions</span></h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group glass rounded-2xl border border-gold/10 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-bold text-stone-700">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-gold group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-6 pt-0 text-stone-500 border-t border-gold/5">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Blog/Tips Section */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-stone-800 mb-4">Beauty <span className="text-gold">Journal</span></h2>
              <p className="text-stone-500">Expert tips and bridal care guides.</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-gold font-bold border-b-2 border-gold pb-1">View All Articles <ArrowRight className="w-4 h-4" /></button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Pre-Bridal Skincare Routine', date: 'March 10, 2026', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=100&w=800' },
              { title: 'Top 5 Hair Care Myths Debunked', date: 'March 05, 2026', img: 'https://images.unsplash.com/photo-1527799822344-429dfa851bc1?auto=format&fit=crop&q=100&w=800' },
              { title: 'How to Make Your Makeup Last All Day', date: 'Feb 28, 2026', img: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=100&w=800' },
            ].map((post, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-video rounded-3xl overflow-hidden mb-6">
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="text-xs text-gold font-bold uppercase tracking-widest mb-2">{post.date}</div>
                <h3 className="text-2xl font-playfair font-bold text-stone-800 group-hover:text-gold transition-colors">{post.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <h2 className="text-4xl font-playfair font-bold text-stone-800 mb-8">Get in <span className="text-gold">Touch</span></h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Call / WhatsApp</div>
                  <a href="tel:8830719663" className="text-xl font-bold text-stone-800 hover:text-gold transition-colors">8830719663</a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Email Us</div>
                  <a href="mailto:ranichame.makeupartist@gmail.com" className="text-lg font-bold text-stone-800 hover:text-gold transition-colors">ranichame.makeupartist@gmail.com</a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Our Studio</div>
                  <div className="text-lg font-bold text-stone-800 mb-4">Kulswamini Nagar, Latur, Maharashtra</div>
                  <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg border border-gold/10 bg-white p-1 flex items-center justify-center">
                    <a href="https://www.google.com/maps/search/?api=1&query=Sejal+Makeover+Kulswamini+Nagar+Latur+Maharashtra" target="_blank" rel="noopener noreferrer" title="Click to open in Google Maps">
                      <img 
                        src={regeneratedContactQr} 
                        alt="Studio Location QR" 
                        className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                      />
                    </a>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-gold uppercase tracking-widest">Scan for Location</div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <a href="https://www.instagram.com/ranichame_makeupartist_?igsh=em1tZGdydnFjMjVt" className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-gold hover:text-white transition-all">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-gold hover:text-white transition-all">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-gold hover:text-white transition-all">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-[2rem] overflow-hidden shadow-2xl h-[400px] lg:h-full border-8 border-white">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60505.4674716768!2d76.5332854817112!3d18.40005545217426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcf83949931899d%3A0x6e3160868f005a30!2sLatur%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1709450000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-6 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-playfair font-bold mb-6">Join Our <span className="text-gold">Inner Circle</span></h2>
          <p className="text-stone-400 mb-10">Subscribe to receive exclusive offers, beauty tips, and bridal trends directly in your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input type="email" placeholder="Your email address" className="flex-1 px-8 py-4 rounded-full bg-white/10 border border-white/20 focus:border-gold outline-none transition-all" />
            <button className="bg-gold text-white px-10 py-4 rounded-full font-bold hover:bg-gold/90 transition-all flex items-center justify-center gap-2">
              Subscribe <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream pt-24 pb-12 px-6 border-t border-gold/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold/50 shadow-xl bg-stone-950 flex items-center justify-center">
                <img 
                  src="/logo.svg" 
                  alt="Sejal Makeover Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-3xl font-playfair font-bold tracking-tighter text-stone-800">
                Sejal <span className="text-gold">Makeover</span>
              </span>
            </div>
            <p className="text-stone-500 max-w-sm mb-8">
              Latur's premier destination for luxury bridal transformations and professional beauty education. Experience the art of elegance.
            </p>
            <div className="flex gap-4 mb-8">
              <Instagram className="text-gold w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
              <Facebook className="text-gold w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
              <Twitter className="text-gold w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
            </div>

          </div>
          
          <div>
            <h4 className="font-bold text-stone-800 uppercase tracking-widest text-sm mb-6">Quick Links</h4>
            <ul className="space-y-4 text-stone-500">
              <li><button onClick={() => scrollTo('about')} className="hover:text-gold transition-colors">About Us</button></li>
              <li><button onClick={() => scrollTo('services')} className="hover:text-gold transition-colors">Our Services</button></li>
              <li><button onClick={() => scrollTo('gallery')} className="hover:text-gold transition-colors">Gallery</button></li>
              <li><button onClick={() => scrollTo('academy')} className="hover:text-gold transition-colors">Training Academy</button></li>
              <li><button onClick={() => scrollTo('booking')} className="hover:text-gold transition-colors">Book Appointment</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-stone-800 uppercase tracking-widest text-sm mb-6">Working Hours</h4>
            <ul className="space-y-4 text-stone-500">
              <li className="flex justify-between"><span>Mon - Sat</span> <span>10:00 AM - 8:00 PM</span></li>
              <li className="flex justify-between"><span>Sunday</span> <span>11:00 AM - 5:00 PM</span></li>
              <li className="pt-4 flex items-center gap-2 text-gold font-bold">
                <Clock className="w-4 h-4" /> Open for Bridal Bookings
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 border-t border-gold/10 flex flex-col md:row justify-between items-center gap-6 text-stone-400 text-sm">
          <p>© 2026 Sejal Makeover. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/918830719663" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform animate-float"
      >
        <MessageCircle className="w-8 h-8" />
      </a>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] max-w-2xl w-full overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-stone-800 z-10"
                onClick={() => setSelectedService(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <div className="aspect-video">
                <img src={selectedService.image} alt={selectedService.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-10">
                <div className="text-gold font-bold uppercase tracking-[0.3em] text-xs mb-4">{selectedService.category}</div>
                <h3 className="text-4xl font-playfair font-bold text-stone-800 mb-4">{selectedService.name}</h3>
                <div className="text-2xl font-bold text-gold mb-6">{selectedService.price}</div>
                <p className="text-stone-600 leading-relaxed mb-8 text-lg">{selectedService.description}</p>
                <button 
                  onClick={() => {
                    setSelectedService(null);
                    scrollTo('booking');
                  }}
                  className="w-full bg-gold text-white py-5 rounded-2xl font-bold text-lg hover:bg-gold/90 transition-all gold-glow"
                >
                  Book This Service Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offer Popup */}
      <AnimatePresence>
        {showOfferPopup && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-28 right-8 z-50 max-w-sm w-full"
          >
            <div className="glass p-8 rounded-3xl border border-gold/30 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
              <button 
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-800"
                onClick={() => setShowOfferPopup(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-gold w-6 h-6" />
                <span className="text-xs font-bold text-gold uppercase tracking-widest">Special Welcome Offer</span>
              </div>
              <h4 className="text-2xl font-playfair font-bold text-stone-800 mb-2">Get 10% Off</h4>
              <p className="text-stone-500 text-sm mb-6">On your first booking with Sejal Makeover. Limited time offer!</p>
              <button 
                onClick={() => {
                  setShowOfferPopup(false);
                  scrollTo('booking');
                }}
                className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-stone-800 transition-all"
              >
                Claim Discount Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEO & Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BeautySalon",
          "name": "Sejal Makeover",
          "image": "/logo.svg",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Kulswamini Nagar",
            "addressLocality": "Latur",
            "addressRegion": "Maharashtra",
            "postalCode": "413512",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 18.400055,
            "longitude": 76.533285
          },
          "url": "https://sejalmakeover.com",
          "telephone": "+918830719663",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "10:00",
              "closes": "20:00"
            }
          ],
          "priceRange": "₹₹₹"
        })}
      </script>
    </div>
  );
}
