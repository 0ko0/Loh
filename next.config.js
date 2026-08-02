/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ĐÃ BỎ: ignoreDuringBuilds và ignoreBuildErrors để đảm bảo code sạch không có bug tiềm ẩn
  
  async headers() {
    return [
      {
        source: '/api/raw/:slug*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, x-lurix-token, x-lurix-time' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
