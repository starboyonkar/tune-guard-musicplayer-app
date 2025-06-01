
import React from 'react';
import { Github, Linkedin, Youtube, Instagram, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SocialFooter: React.FC = () => {
  const socialLinks = [
    {
      icon: Github,
      href: "https://github.com/starboyonkar",
      label: "GitHub Profile",
      hoverColor: "hover:text-gray-400"
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/onkar-chaugule",
      label: "LinkedIn Profile",
      hoverColor: "hover:text-blue-400"
    },
    {
      icon: Youtube,
      href: "https://www.youtube.com/channel/UCpzZr2eg1lsB6yALzsBTUlQ",
      label: "YouTube Channel",
      hoverColor: "hover:text-red-400"
    },
    {
      icon: Instagram,
      href: "https://instagram.com/onkar.chougule.73",
      label: "Instagram Profile",
      hoverColor: "hover:text-pink-400"
    }
  ];

  const handlePhoneCall = () => {
    window.location.href = "tel:+919373261147";
  };

  return (
    <div className="mt-8 text-center space-y-4">
      {/* Social Media Icons */}
      <div className="flex justify-center items-center space-x-6">
        {socialLinks.map((social, index) => {
          const IconComponent = social.icon;
          return (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-white/70 ${social.hoverColor} transition-all duration-300 transform hover:scale-110 hover:animate-pulse`}
              aria-label={social.label}
              title={social.label}
            >
              <IconComponent className="h-6 w-6" />
            </a>
          );
        })}
        
        {/* Phone Icon */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePhoneCall}
          className="text-white/70 hover:text-green-400 transition-all duration-300 transform hover:scale-110 hover:animate-pulse p-0"
          aria-label="Call +91 9373261147"
          title="Call +91 9373261147"
        >
          <Phone className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Footer Text */}
      <div className="text-futuristic-muted text-sm leading-relaxed">
        © 2025 TUNE GUARD - OnkarNova Technologies<br />
        Solapur, Maharashtra
      </div>
    </div>
  );
};

export default SocialFooter;
