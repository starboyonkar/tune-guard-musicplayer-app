
import React from 'react';
import { Github, Linkedin, Youtube, Instagram, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SocialFooter: React.FC = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/starboyonkar',
      icon: Github,
      color: 'hover:text-gray-300',
      description: 'Check out my GitHub projects'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/onkar-chaugule',
      icon: Linkedin,
      color: 'hover:text-blue-400',
      description: 'Connect with me on LinkedIn'
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/channel/UCpzZr2eg1lsB6yALzsBTUlQ',
      icon: Youtube,
      color: 'hover:text-red-400',
      description: 'Subscribe to my YouTube channel'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/onkar.chougule.73',
      icon: Instagram,
      color: 'hover:text-pink-400',
      description: 'Follow me on Instagram'
    }
  ];

  const handlePhoneClick = () => {
    window.location.href = 'tel:+919373261147';
  };

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="mt-8 border-t border-futuristic-border/30 pt-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <p className="text-futuristic-muted text-sm mb-2">
            Connect with the developer
          </p>
          <div className="text-xs text-futuristic-muted/70">
            Built with ❤️ by Onkar Chaugule
          </div>
        </div>
        
        <TooltipProvider>
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <Tooltip key={social.name}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSocialClick(social.url)}
                      className={`
                        text-futuristic-muted transition-all duration-300 ease-in-out
                        hover:scale-110 hover:shadow-lg hover:shadow-futuristic-accent1/20
                        active:scale-95 ${social.color}
                        w-10 h-10 rounded-full
                        border border-transparent hover:border-futuristic-accent1/30
                        bg-black/20 hover:bg-black/40
                      `}
                      aria-label={`Visit ${social.name}`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-black/90 border-futuristic-border">
                    <p className="text-xs">{social.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            
            {/* Phone button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePhoneClick}
                  className="
                    text-futuristic-muted transition-all duration-300 ease-in-out
                    hover:scale-110 hover:shadow-lg hover:shadow-futuristic-accent2/20
                    active:scale-95 hover:text-green-400
                    w-10 h-10 rounded-full
                    border border-transparent hover:border-futuristic-accent2/30
                    bg-black/20 hover:bg-black/40
                  "
                  aria-label="Call phone number"
                >
                  <Phone className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-black/90 border-futuristic-border">
                <p className="text-xs">Call: +91 9373261147</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        
        <div className="text-center text-xs text-futuristic-muted/50 space-y-1">
          <p>© 2024 Tune Guard. All rights reserved.</p>
          <p>Built with React • TypeScript • Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
};

export default SocialFooter;
