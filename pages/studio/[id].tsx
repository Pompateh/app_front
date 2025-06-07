import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import useSWR from 'swr';
import { toast } from 'react-toastify';
import React from 'react';
import VerticalLine from '../../components/VerticalLine';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

interface StudioDetail {
  id: string;
  name: string;
  slogan: string;
  portfolio?: { id: string; title: string; image: string; type: string; year: number }[];
  fonts?: { id: string; name: string; image: string; type: string; price: number }[];
  artworks?: { id: string; name: string; author: string; image: string; type: string; }[];
  thumbnail?: string;
}

const fetcher = (url: string) =>
  fetch(`https://app-back-gc64.onrender.com${url}`, { headers: { 'Content-Type': 'application/json' } }).then(res =>
    res.json()
  );

const formatSlogan = (slogan: string) => {
  const lines = [
    "We are a Powerhouse crafting the",
    "next best sh*t on the net: Branding,",
    "Typeface, Illustration."
  ];
  
  return (
    <>
      {lines.map((line, index) => (
        <span key={index} className="block leading-tight tracking-wide w-full text-center" 
          style={{ 
            fontSize: '5.3rem',
            fontFamily: '"Crimson Pro", serif',
            fontWeight: 200,
            fontStyle: 'italic'
          }}>
          {line.split(' ').map((word, wordIndex) => (
            <span
              key={wordIndex}
              className={word === "Powerhouse" ? 'italic' : ''}
            >
              {word}{' '}
            </span>
          ))}
        </span>
      ))}
    </>
  );
};

const StudioHomepage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data, error } = useSWR<StudioDetail>(id ? `/api/studios/${id}` : null, fetcher);
  const [studio, setStudio] = useState<StudioDetail | null>(null);
  const { scrollYProgress } = useScroll();

  // Enhanced transform values for more noticeable parallax
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1]);

  useEffect(() => {
    if (data) {
      setStudio(data);
    }
    if (error) {
      toast.error('Failed to load studio details');
    }
  }, [data, error]);

  if (!studio) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gray-400 mr-4"></div>
          <p className="text-gray-400 text-lg">Loading studio details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <VerticalLine />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full"
      >
        <section className="w-full py-28 bg-black text-white">
          <motion.div 
            style={{ y: y1, scale }}
            className="max-w-screen-2xl mx-auto px-4"
          >
            <div className="flex flex-col items-center">
              <motion.img 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.3 }
                }}
                src="/assets/Layer 11.png" 
                alt="Studio Doodle" 
                className="w-40 h-25 object-cover mb-4" 
              />
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.05 }}
                className="text-lg text-center mb-4" 
                style={{
                  fontFamily: '"Gothic A1", sans-serif',
                  fontWeight: 800
                }}
              >
                Xin chào! Chúng tôi là {studio.name}
              </motion.p>
              <motion.h1 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.4,
                  type: "spring",
                  stiffness: 100
                }}
                className="text-center mb-6 leading-tight tracking-wide w-full custom-heading"
              >
                {formatSlogan(studio.slogan)}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.05 }}
                className="text-center" 
                style={{
                  fontFamily: '"Crimson Pro", serif',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  lineHeight: '1.1',
                  letterSpacing: '-0.02em'
                }}
              >
                You name it. We've got it
              </motion.p>
            </div>
          </motion.div>
        </section>

        {/* Work Portfolio Section */}
        {studio.portfolio && (
          <section className="w-full py-10 bg-black text-white">
            <div className="max-w-screen-2xl mx-auto px-4">
              <div className="space-y-12">
                {studio.portfolio.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.6,
                      delay: index * 0.15,
                      type: "spring",
                      stiffness: 50,
                      damping: 20
                    }}
                    viewport={{ once: true, margin: "-10%" }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { 
                          duration: 0.3,
                          ease: "easeOut"
                        }
                      }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.15 + 0.1
                      }}
                      className="transform transition-transform relative overflow-hidden"
                    >
                      <motion.img
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{ 
                          scale: 1.05,
                          transition: { 
                            duration: 0.3,
                            ease: "easeOut"
                          }
                        }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.15 + 0.2
                        }}
                        src={item.image}
                        alt={item.title}
                        className="w-full h-auto max-h-custom object-cover"
                      />
                    </motion.div>
                    
                    <div className="py-4">
                      <div className="flex justify-between items-center mb-2">
                        <div
                          className="text-gray-300"
                          style={{
                            fontFamily: '"Gothic A1", sans-serif',
                            fontWeight: 700
                          }}
                        >
                          {item.type}
                        </div>
                        <div
                          className="text-gray-300"
                          style={{
                            fontFamily: '"Gothic A1", sans-serif',
                            fontWeight: 700
                          }}
                        >
                          {item.year}
                        </div>
                      </div>
                      <h3
                        className="text-xl font-bold"
                        style={{
                          fontFamily: '"Crimson Pro", serif',
                          fontWeight: 400
                        }}
                      >
                        {item.title}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Fonts Section */}
        {studio.fonts && (
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 50
            }}
            viewport={{ once: true }}
            className="w-full pt-6 bg-gray-50"
          >
            <div className="max-w-screen-2xl mx-auto px-4">
              <motion.img 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.3 }
                }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                src="/assets/Layer 2.png" 
                alt="Fonts Doodle" 
                className="w-64 h-64 object-contain mx-auto" 
              />
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                transition={{ 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="text-center text-lg mb-2" 
                style={{
                  fontFamily: '"Gothic A1", sans-serif',
                  fontWeight: 800
                }}
              >
                Handcrafted Typefaces
              </motion.p>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                transition={{ 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="text-2xl text-center mb-4" 
                style={{
                  fontFamily: '"Crimson Pro", serif',
                  fontWeight: 200
                }}
              >
                Phông-chữ <span className="italic">Nhà-làm</span>
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="text-center mb-8" 
                style={{
                  fontFamily: '"Crimson Pro", serif',
                  fontWeight: 400
                }}
              >
                Bổn tiệm bán thiết kế nhà làm có tính cá nhân hóa - tất cả túi xách, con chữ và các sản phẩm khác<br />
                đều có thể được tùy chỉnh theo nhu cầu của khách
                Được làm từ nguyên liệu 100% hữu cơ (bắp),<br /> 
                nhập mới hàng ngày, đảm bảo chát lượng tốt nhất ngay từ khâu lên ý tưởng.
              </motion.p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {studio.fonts.map((item, index) => {
                  const imagePath = index === 0 
                    ? 'https://app-back-gc64.onrender.com/uploads/1748277600202-image 61.png'
                    : index === 1 
                    ? 'https://app-back-gc64.onrender.com/uploads/1748277637253-image 64.png'
                    : 'https://app-back-gc64.onrender.com/uploads/1748277657397-image 65.png';
                  const fallbackImage = index === 0 
                    ? '/assets/61.png'
                    : index === 1 
                    ? '/assets/64.png'
                    : '/assets/65.png';
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.6,
                        delay: index * 0.2,
                        type: "spring",
                        stiffness: 50
                      }}
                      viewport={{ once: true }}
                      className="overflow-hidden transform transition duration-300"
                    >
                      <motion.div 
                        className="bg-[#2A211C] px-14 py-12 overflow-hidden flex items-center justify-center aspect-[4/5]"
                        whileHover={{ 
                          scale: 1.02,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <motion.img
                          whileHover={{ 
                            scale: 1.05,
                            transition: { duration: 0.3 }
                          }}
                          src={imagePath}
                          alt={`${item.name} font preview`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = fallbackImage; // Fallback to local static image
                          }}
                        />
                      </motion.div>
                      <div className="py-2 bg-gray-50">
                        <div className="text-gray-700 uppercase">
                          {item.type}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                          {item.name}
                        </h3>
                        <div className="text-gray-700">
                          từ {item.price}đ
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}

        {/* Featured Artworks Section */}
        {studio.artworks && (
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 50
            }}
            viewport={{ once: true }}
            className="w-full pt-12 bg-white"
          >
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.img 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.3 }
                }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                src="/assets/Layer 15.png" 
                alt="Arts Doodle" 
                className="w-64 h-64 object-contain mx-auto mb-8" 
              />
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                transition={{ 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="text-center text-lg mb-2" 
                style={{
                  fontFamily: '"Gothic A1", sans-serif',
                  fontWeight: 800
                }}
              >
                Home-cooked Illustrations
              </motion.p>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                transition={{ 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="text-3xl text-center mb-4" 
                style={{
                  fontFamily: '"Crimson Pro", serif',
                  fontWeight: 200,
                  fontStyle: 'italic'
                }}
              >
                <span className="italic">Tranh-vẽ</span> Nhà-làm
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="text-center mb-8" 
                style={{
                  fontFamily: '"Crimson Pro", serif',
                  fontWeight: 400
                }}
              >
                Bổn tiệm bán thiết kế nhà làm có tính cá nhân hóa - tất cả túi xách, con chữ và các sản phẩm khác<br />
                đều có thể được tùy chỉnh theo nhu cầu của khách
                Được làm từ nguyên liệu 100% hữu cơ (bắp),<br /> 
                nhập mới hàng ngày, đảm bảo chát lượng tốt nhất ngay từ khâu lên ý tưởng.
              </motion.p>
              <div className="grid grid-cols-2 gap-0">
                {studio.artworks.slice(0, 2).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.6,
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 50
                    }}
                    viewport={{ once: true }}
                    className="overflow-hidden transform transition duration-300"
                  >
                    <motion.div
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.3 }
                      }}
                      className="overflow-hidden"
                    >
                      <motion.img
                        whileHover={{ 
                          scale: 1.05,
                          transition: { duration: 0.3 }
                        }}
                        src={item.image}
                        alt={item.name}
                        className="w-full object-cover"
                        style={{ aspectRatio: '1 / 1', height: 'auto' }}
                      />
                    </motion.div>
                    <div className="p-4">
                      <div className="text-gray-700 uppercase">
                        {item.author}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {item.name}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-0">
                {studio.artworks.slice(2, 6).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.6,
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 50
                    }}
                    viewport={{ once: true }}
                    className="overflow-hidden transform transition duration-300"
                  >
                    <motion.div
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.3 }
                      }}
                      className="overflow-hidden"
                    >
                      <motion.img
                        whileHover={{ 
                          scale: 1.05,
                          transition: { duration: 0.3 }
                        }}
                        src={item.image}
                        alt={item.name}
                        className="w-full object-cover"
                        style={{ width: '100%', height: '700px' }}
                      />
                    </motion.div>
                    <div className="p-4">
                      <div className="text-gray-700 uppercase">
                        {item.author}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {item.name}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Newsletter Section (temporarily hidden) */}
        {/* 
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            type: "spring",
            stiffness: 100
          }}
          viewport={{ once: true }}
          className="w-full py-32 bg-[#f9f6f1] newsletter"
          style={{ backgroundImage: 'url(/assets/background_sub.png)' }}
        >
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 flex justify-center items-center">
              <motion.div 
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="bg-[#fafaf0] border border-gray-200 shadow-md p-12 space-y-8 w-full"
              >
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                  className="text-2xl md:text-3xl text-gray-800" 
                  style={{
                    fontFamily: '"Crimson Pro", serif',
                    fontWeight: 400
                  }}
                >
                  Subscribe for <br /> <em className="italic font-semibold">Daily Goodness</em>
                </motion.h2>
                <motion.input
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                  type="text"
                  className="w-full px-6 py-3 border-b-2 border-gray-300 focus:border-b-2 focus:border-gray-500 bg-[#eae5db]"
                  placeholder="Your name*"
                  style={{
                    fontFamily: '"Gothic A1", sans-serif',
                    fontWeight: 800
                  }}
                />
                <motion.input
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                  type="email"
                  className="w-full px-6 py-3 border-b-2 border-gray-300 focus:border-b-2 focus:border-gray-500 bg-[#eae5db]"
                  placeholder="Your email*"
                  style={{
                    fontFamily: '"Gothic A1", sans-serif',
                    fontWeight: 800
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                  style={{
                    marginLeft: '-3rem',
                    marginRight: '-3rem',
                    marginBottom: '-3rem'
                  }}
                >
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "#f1c75d",
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-4 py-3 bg-[#f1c75d] text-gray-800 hover:bg-yellow-600 transition-colors border-wrapper subscribe-button"
                    style={{
                      fontFamily: '"Gothic A1", sans-serif',
                      fontWeight: 800
                    }}
                  >
                    Subscribe
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
            <div className="w-full md:w-1/2 flex flex-wrap justify-center items-center mt-8 md:mt-0 relative">
              {[1, 2, 3, 4].map((index) => (
                <motion.img
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.3 }
                  }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                  src="/assets/Layer 2.png"
                  alt={`Doodle ${index}`}
                  className={`w-32 h-32 object-contain absolute ${
                    index === 1 ? 'top-0 left-0' :
                    index === 2 ? 'top-0 right-0' :
                    index === 3 ? 'bottom-0 left-0' :
                    'bottom-0 right-0'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.section>
        */}
      </motion.div>
    </Layout>
  );
};

export default StudioHomepage;