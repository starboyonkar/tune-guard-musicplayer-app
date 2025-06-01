
import React from 'react';
import { Github, Linkedin, Youtube, Instagram, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/starboyonkar',
      icon: Github,
      color: 'hover:text-gray-400'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/onkar-chaugule',
      icon: Linkedin,
      color: 'hover:text-blue-400'
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/channel/UCpzZr2eg1lsB6yALzsBTUlQ',
      icon: Youtube,
      color: 'hover:text-red-400'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/onkar.chougule.73',
      icon: Instagram,
      color: 'hover:text-pink-400'
    },
    {
      name: 'Phone',
      url: 'tel:+919373261147',
      icon: Phone,
      color: 'hover:text-green-400'
    }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-t border-white/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center space-x-6">
          {socialLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <a
                key={link.name}
                href={link.url}
                target={link.name === 'Phone' ? '_self' : '_blank'}
                rel={link.name === 'Phone' ? undefined : 'noopener noreferrer'}
                className={`group relative transition-all duration-300 ${link.color}`}
                aria-label={link.name}
              >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-300 group-hover:scale-110">
                  <IconComponent 
                    size={20} 
                    className="text-white/70 group-hover:text-current transition-colors duration-300" 
                  />
                </div>
                
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                  {link.name}
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-current opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 pointer-events-none" />
              </a>
            );
          })}
        </div>
        
        {/* Copyright text */}
        <div className="text-center mt-2">
          <p className="text-xs text-white/50">
            © 2024 Tune Guard. Created by Onkar Chaugule
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
