import React from 'react';

const Footer: React.FC = () => {
  const handleComingSoon = () => {
    alert('Coming Soon!');
  };

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-[#221E1B] text-[#F5D76E] footer">
      <div className="max-w-[1500px] mx-auto px-6 py-12 flex flex-col md:flex-row">
        {/* Left half: Logo and Slogan */}
        <div className="w-full md:w-1/2 flex flex-col items-start">
          <img src="/assets/logo-02.png" alt="NEWStalgia Logo" className="h-[7.5rem] mb-2" />
          <p className="text-left text-sm">Honor the past / Bridge the future</p>
        </div>
        {/* Right half: Navigation buttons with centered columns, moved slightly right */}
        <div className="w-full md:w-1/2 flex justify-center mt-4 md:mt-0 ml-40">
          <div className="flex space-x-24">
            {/* Column 1 */}
            <div className="flex flex-col items-left text-sm">
              <button className="mb-2">Ấn-phẩm</button>
              <button className="mb-2" onClick={handleComingSoon}>Tiệm-chữ</button>
              <button className="mb-2" onClick={handleComingSoon}>Bảng-tin</button>
              <button onClick={handleComingSoon}>Quy-trình</button>
            </div>
            {/* Column 2: Social Media */}
            <div className="flex flex-col items-left text-sm">
              <button 
                className="mb-2 hover:text-white transition-colors" 
                onClick={() => handleSocialClick('https://www.instagram.com/wearenewstalgia/')}
              >
                Instagram
              </button>
              <button 
                className="mb-2 hover:text-white transition-colors" 
                onClick={() => handleSocialClick('https://www.behance.net/hieu53')}
              >
                Behance
              </button>
              <button 
                className="hover:text-white transition-colors" 
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
