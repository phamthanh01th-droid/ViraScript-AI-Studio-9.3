import React from 'react';
import { EmailIcon } from './icons/EmailIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { TelegramIcon } from './icons/TelegramIcon';

const Footer: React.FC = () => {
  return (
    <footer className="container mx-auto px-4 py-8 text-center text-slate-500">
      <p className="mb-4">Công cụ được phát triển bởi <span className="font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Họ Nhà Phạm</span></p>
      <div className="flex justify-center items-center gap-6">
        <a href="#" aria-label="Email" className="hover:text-indigo-400 transition-colors">
          <EmailIcon className="w-6 h-6" />
        </a>
        <a href="#" aria-label="Facebook" className="hover:text-indigo-400 transition-colors">
          <FacebookIcon className="w-6 h-6" />
        </a>
        <a href="#" aria-label="Telegram" className="hover:text-indigo-400 transition-colors">
          <TelegramIcon className="w-6 h-6" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;