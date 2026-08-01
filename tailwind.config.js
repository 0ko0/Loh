/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
          './components/**/*.{js,ts,jsx,tsx,mdx}',
              './app/**/*.{js,ts,jsx,tsx,mdx}',
                ],
                  theme: {
                      extend: {
                            colors: {
                                    lurix: {
                                              PRIMARY: '#6E96FF', // Color3.fromRGB(110, 150, 255)
                                                        DARK: '#050508',
                                                                  CARD: '#0D0D12',
                                                                          },
                                                                                },
                                                                                      boxShadow: {
                                                                                              'lurix-glow': '0 0 35px -5px rgba(110, 150, 255, 0.4)',
                                                                                                    }
                                                                                                        },
                                                                                                          },
                                                                                                            plugins: [],
                                                                                                            } 