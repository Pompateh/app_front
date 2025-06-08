import React, { useState } from 'react';

const Footer: React.FC = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleComingSoon = () => {
    setShowComingSoon(true);
  };

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-[#221E1B] text-[#F5D76E] footer relative">
      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#3b322d] rounded-2xl shadow-lg p-8 flex flex-col items-center max-w-xs w-full border-2 border-[#F5D76E]">
            <span className="text-4xl mb-2 animate-bounce">🚧</span>
            <h2 className="text-xl font-bold mb-2 text-[#F5D76E]">Coming Soon!</h2>
            <p className="text-[#F5D76E] text-center mb-4">Coming soon!<br/>Stay tuned for more fun! 🎉</p>
            <button
              className="mt-2 px-4 py-2 bg-[#F5D76E] text-[#221E1B] rounded-full font-semibold hover:bg-[#ffe699] transition-colors"
              onClick={() => setShowComingSoon(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      <div className="max-w-[1500px] mx-auto px-6 py-12 flex flex-col md:flex-row">
        {/* Left half: Logo and Slogan */}
        <div className="w-full md:w-1/2 flex flex-col items-start">
          <img src="/assets/Layer_1.png" alt="NEWStalgia Logo" className="h-[7.5rem] mb-2" />
          <p className="text-left text-[#F5D76E] text-sm font-crimson font-medium">
            <span className="font-bold italic">Honor the Past</span>
            <span className="font-normal"> / </span>
            <span className="font-bold">Bridge the Future</span>
          </p>
        </div>
        {/* Right half: Navigation buttons with centered columns, moved slightly right */}
        <div className="w-full md:w-1/2 flex justify-center mt-4 md:mt-0 ml-40">
          <div className="flex space-x-24">
            {/* Column 1 */}
            <div className="flex flex-col text-left text-sm">
              <button className="mb-2 block text-left">Ấn-phẩm</button>
              <button className="mb-2 block text-left" onClick={handleComingSoon}>Tiệm-chữ</button>
              <button className="mb-2 block text-left" onClick={handleComingSoon}>Bảng-tin</button>
              <button className="block text-left" onClick={handleComingSoon}>Quy-trình</button>
            </div>
            {/* Column 2: Social Media */}
            <div className="flex flex-col text-left text-sm">
              <button 
                className="mb-2 block text-left hover:text-white transition-colors" 
                onClick={() => handleSocialClick('https://www.instagram.com/wearenewstalgia/')}
              >
                Instagram
              </button>
              <button 
                className="mb-2 block text-left hover:text-white transition-colors" 
                onClick={() => handleSocialClick('https://www.behance.net/hieu53')}
              >
                Behance
              </button>
              <button 
                className="block text-left hover:text-white transition-colors" 
                onClick={() => handleSocialClick('https://www.facebook.com/profile.php?id=61573128395554')}
              >
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Footer Content with lighter background full width */}
      <div className="w-full bg-[#3b322d] py-4">
        <div className="max-w-[1500px] mx-auto px-6">
          <p className="text-left text-sm">
            Bảo quyền thuộc về NewStalgia 2025
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
