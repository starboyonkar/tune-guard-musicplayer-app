
import React from 'react';
import { Github, Linkedin, Youtube, Instagram, Phone } from 'lucide-react';

interface SocialFooterProps {
  variant?: 'full' | 'compact';
}

const SocialFooter: React.FC<SocialFooterProps> = ({ variant = 'full' }) => {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/starboyonkar',
      icon: Github,
      hoverBg: 'hover:bg-gray-700'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/onkar-chaugule',
      icon: Linkedin,
      hoverBg: 'hover:bg-blue-600'
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/channel/UCpzZr2eg1lsB6yALzsBTUlQ',
      icon: Youtube,
      hoverBg: 'hover:bg-red-600'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/onkar.chougule.73',
      icon: Instagram,
      hoverBg: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600'
    },
    {
      name: 'Phone',
      url: 'tel:+919373261147',
      icon: Phone,
      hoverBg: 'hover:bg-green-600'
    }
  ];

  const handleSocialClick = (url: string, name: string) => {
    if (name === 'Phone') {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (variant === 'compact') {
    return (
      <footer className="w-full py-4 px-4">
        <div className="flex justify-center items-center gap-3 flex-wrap">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <button
                key={social.name}
                onClick={() => handleSocialClick(social.url, social.name)}
                className={`
                  group p-2.5 rounded-full border border-futuristic-border/50 
                  bg-black/30 backdrop-blur-sm transition-all duration-200 
                  hover:scale-105 hover:border-futuristic-accent1/50
                  ${social.hoverBg} hover:text-white
                  focus:outline-none focus:ring-2 focus:ring-futuristic-accent1/50
                `}
                title={social.name}
                aria-label={`Visit ${social.name}`}
              >
                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-futuristic-muted group-hover:text-white transition-colors duration-200" />
              </button>
            );
          })}
        </div>
        <p className="text-futuristic-muted/60 text-xs text-center mt-3">
          © 2025 TUNE GUARD - OnkarNova Technologies
        </p>
      </footer>
    );
  }

  return (
    <footer className="w-full px-4 sm:px-6 pb-4 sm:pb-6">
      <div className="glass border-futuristic-border backdrop-blur-xl bg-white/5 rounded-lg p-4 sm:p-6">
        <div className="text-center mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-futuristic-accent1 mb-1 sm:mb-2">
            Connect With Us
          </h3>
          <p className="text-futuristic-muted text-xs sm:text-sm">
            Follow our journey and stay connected
          </p>
        </div>

        <div className="flex justify-center items-center gap-3 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <button
                key={social.name}
                onClick={() => handleSocialClick(social.url, social.name)}
                className={`
                  group relative p-2.5 sm:p-3 rounded-full border border-futuristic-border 
                  bg-black/20 backdrop-blur-sm transition-all duration-200 
                  hover:scale-110 active:scale-95
                  ${social.hoverBg} hover:text-white
                  focus:outline-none focus:ring-2 focus:ring-futuristic-accent1/50
                `}
                title={`Connect on ${social.name}`}
                aria-label={`Visit our ${social.name} profile`}
              >
                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-futuristic-muted group-hover:text-white transition-colors duration-200" />
                
                {/* Tooltip - hidden on mobile */}
                <div className="hidden sm:block absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {social.name}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center border-t border-futuristic-border/30 pt-3 sm:pt-4">
          <p className="text-futuristic-muted text-xs">
            © 2025 TUNE GUARD - OnkarNova Technologies Solapur, Maharashtra
          </p>
          <p className="text-futuristic-muted/60 text-xs mt-1">
            Crafted with care for the future of audio technology
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SocialFooter;
