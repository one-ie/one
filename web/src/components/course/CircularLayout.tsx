import React from 'react';

interface IconData {
  name: string;
  icon: string;
}

const aiProviders: IconData[] = [
  { name: 'OpenAI', icon: '/icons/openai.svg' },
  { name: 'Anthropic', icon: '/icons/anthropic.svg' },
  { name: 'Gemini', icon: '/icons/gemini.svg' },
  { name: 'Mistral', icon: '/icons/mistral.svg' },
  { name: 'DeepSeek', icon: '/icons/deepseek.svg' }
];

const ecommerceApps: IconData[] = [
  { name: 'Shopify', icon: '/icons/store.svg' },
  { name: 'WooCommerce', icon: '/icons/woo.svg' },
  { name: 'Magento', icon: '/icons/magento.svg' },
  { name: 'PrestaShop', icon: '/icons/prestashop.svg' }
];

export function CircularLayout() {
  // Calculate positions for outer circle (AI providers)
  const getOuterPosition = (index: number, total: number, radius: number) => {
    const angle = (index * 2 * Math.PI / total) - Math.PI/2; // Start from top
    return {
      left: `${radius * Math.cos(angle) + 250}px`,
      top: `${radius * Math.sin(angle) + 250}px`
    };
  };

  // Calculate positions for inner circle (ecommerce apps)
  const getInnerPosition = (index: number, total: number, radius: number) => {
    const angle = (index * 2 * Math.PI / total) - Math.PI/2; // Start from top
    return {
      left: `${radius * Math.cos(angle) + 250}px`,
      top: `${radius * Math.sin(angle) + 250}px`
    };
  };

  return (
    <div className="relative w-[500px] h-[500px] mx-auto my-12">
      {/* Outer circle - AI Providers */}
      {aiProviders.map((provider, index) => (
        <div
          key={provider.name}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 hover:scale-110"
          style={getOuterPosition(index, aiProviders.length, 200)}
        >
          <div className="w-16 h-16 rounded-full bg-white shadow-lg p-2 hover:shadow-xl transition-shadow">
            <img
              src={provider.icon}
              alt={provider.name}
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-sm font-medium text-center mt-2">{provider.name}</p>
        </div>
      ))}

      {/* Inner circle - Ecommerce Apps */}
      {ecommerceApps.map((app, index) => (
        <div
          key={app.name}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 hover:scale-110"
          style={getInnerPosition(index, ecommerceApps.length, 120)}
        >
          <div className="w-14 h-14 rounded-full bg-white shadow-lg p-2 hover:shadow-xl transition-shadow">
            <img
              src={app.icon}
              alt={app.name}
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-sm font-medium text-center mt-2">{app.name}</p>
        </div>
      ))}

      {/* Center - ONE Logo */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 hover:scale-110">
        <div className="w-20 h-20 rounded-full bg-white shadow-lg p-2 hover:shadow-xl transition-shadow">
          <img
            src="/icons/one.svg"
            alt="ONE"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-lg font-bold text-center mt-2">ONE</p>
      </div>

      {/* Decorative circles */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-2 border-gray-200 rounded-full" />
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] border-2 border-gray-200 rounded-full" />
    </div>
  );
} 