import { Link } from 'react-router-dom';
import { Leaf, Facebook, Twitter, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  solutions: [
    { name: 'Seed Production', path: '/solutions/seed-production' },
    { name: 'Farm Operations', path: '/solutions/farm-operations' },
    { name: 'Digitization & AI', path: '/solutions/digitization' },
    { name: 'Enterprise', path: '/solutions/enterprise' },
    { name: 'Traceability', path: '/solutions/traceability' },
    { name: 'Climate-Smart', path: '/solutions/climate-smart' },
  ],
  products: [
    { name: 'Crop Grid', path: '/crop-grid' },
    { name: 'Voice AI', path: '/voice-ai' },
    { name: 'Disease Scanner', path: '/disease-scanner' },
    { name: 'Weather Intelligence', path: '/weather' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Marketplace', path: '/marketplace' },
  ],
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Careers', path: '/careers' },
    { name: 'Blog', path: '/blog' },
    { name: 'Press', path: '/press' },
    { name: 'Partners', path: '/partners' },
    { name: 'Contact', path: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Cookie Policy', path: '/cookies' },
    { name: 'Data Security', path: '/security' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-earth-dark text-white">
      {/* Main Footer */}
      <div className="container-max px-6 lg:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-serif font-bold">NobinKrishi</span>
            </Link>
            <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
              Empowering farmers with AI-driven insights for sustainable and profitable agriculture. প্রযুক্তি দিয়ে কৃষিতে বিপ্লব।
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:contact@nobinkrishi.com" className="flex items-center gap-2 text-white/70 hover:text-accent transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm">contact@nobinkrishi.com</span>
              </a>
              <a href="tel:+8801234567890" className="flex items-center gap-2 text-white/70 hover:text-accent transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+880 1234-567890</span>
              </a>
              <div className="flex items-center gap-2 text-white/70">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-bold text-lg mb-4">Solutions</h4>
            <ul className="space-y-2">
              {footerLinks.solutions.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-white/70 hover:text-accent text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold text-lg mb-4">Products</h4>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-white/70 hover:text-accent text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-white/70 hover:text-accent text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-white/70 hover:text-accent text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-max px-6 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} NobinKrishi. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
