/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFFFF',
          100: '#FFF9F2',
          200: '#FBF2E9',
          300: '#F5E5D5',
        },
        pastel: {
          pink: '#FCECEF',
          lightpink: '#FDF2F5',
          softpink: '#FED7E2',
          blue: '#DDE8FA',
          yellow: '#FEF0C7',
          orange: '#FF6B4A',
          beige: '#FFF9EE',
        },
        brand: {
          pink: '#FF5C8D',
          rose: '#F43F5E',
          deeprose: '#E11D48',
          softpink: '#FDECEF',
          beige: '#FFF9EE',
          warmbeige: '#FDF6EC',
          mocha: '#2E1A12',
          espresso: '#2E1A12',
          green: '#00A86B',
          darkgreen: '#065F46',
          lightgreen: '#E8F8F2',
          coral: '#FF5C8D', // maps coral to sweet accent pink
          lightcoral: '#FFE8EC',
          amber: '#F59E0B',
          lightamber: '#FEF3C7',
          muted: '#786861',
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 5px 15px -3px rgba(0, 0, 0, 0.03)',
        'card': '0 14px 34px rgba(35, 24, 21, 0.06)',
        'floating': '0 20px 40px rgba(0, 168, 107, 0.12)',
        'coral-glow': '0 10px 25px rgba(250, 82, 82, 0.25)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
