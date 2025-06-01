
import React from 'react';
import { Card } from '@/components/ui/card';
import { Github, Linkedin, Youtube, Instagram, Phone } from 'lucide-react';

const SocialFooter: React.FC = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/starboyonkar',
      icon: Github,
      color: 'hover:text-white hover:bg-gray-800',
      bgColor: 'hover:shadow-gray-500/30'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/onkar-chaugule',
      icon: Linkedin,
      color: 'hover:text-white hover:bg-blue-600',
      bgColor: 'hover:shadow-blue-500/30'
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/channel/UCpzZr2eg1lsB6yALzsBTUlQ',
      icon: Youtube,
      color: 'hover:text-white hover:bg-red-600',
      bgColor: 'hover:shadow-red-500/30'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/onkar.chougule.73',
      icon: Instagram,
      color: 'hover:text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600',
      bgColor: 'hover:shadow-pink-500/30'
    },
    {
      name: 'Phone',
      url: 'tel:+919373261147',
      icon: Phone,
      color: 'hover:text-white hover:bg-green-600',
      bgColor: 'hover:shadow-green-500/30'
    }
  ];

  const handleSocialClick = (url: string, name: string) => {
    if (name === 'Phone') {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="glass border-futuristic-border backdrop-blur-xl bg-white/5 mx-6 mb-6">
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-futuristic-accent1 neon-text mb-2">
            Connect With Us
          </h3>
          <p className="text-futuristic-muted text-sm">
            Follow our journey and stay connected through social media
          </p>
        </div>

        <div className="flex justify-center items-center space-x-4 mb-6">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <button
                key={social.name}
                onClick={() => handleSocialClick(social.url, social.name)}
                className={`
                  group relative p-3 rounded-full border border-futuristic-border 
                  bg-black/20 backdrop-blur-sm transition-all duration-300 
                  transform hover:scale-110 hover:rotate-3 active:scale-95
                  ${social.color} ${social.bgColor}
                  focus:outline-none focus:ring-2 focus:ring-futuristic-accent1 focus:ring-opacity-50
                `}
                title={`Connect on ${social.name}`}
                aria-label={`Visit our ${social.name} profile`}
              >
                <IconComponent className="h-6 w-6 transition-all duration-300 group-hover:animate-pulse" />
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-futuristic-accent1/20 to-futuristic-accent2/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  {social.name}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center border-t border-futuristic-border/30 pt-4">
          <p className="text-futuristic-muted text-xs">
            © 2025 TUNE GUARD - OnkarNova Technologies Solapur, Maharashtra
          </p>
          <p className="text-futuristic-muted/70 text-xs mt-1">
            Crafted with ❤️ for the future of audio technology
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SocialFooter;
