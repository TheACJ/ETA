/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        colors: {
          'navbar': '#2F3030',
          'button-blue': '#007DFE',
          'primary': '#007DFE',
          'secondary': '#E1ad37'
        },
        fontFamily: {
          'inter': ['Inter', 'sans-serif'],
          'montserrat': ['Montserrat', 'sans-serif'],
          'poppins': ['Poppins', 'sans-serif'],
          'space': ['"Space Grotesk"', 'sans-serif'],
          'kalam': ['Kalam', 'cursive'],
        },
        borderWidth: {
          '1.5': '1.5px',
        },
        borderRadius: {
          'custom': '1rem',
        },
        textColor: {
          'custom-white': '#ffffff',
          'custom-gray-200': '#c7c7c7',
          'custom-gray-600': '#4b5563',
          'custom-gray-700': '#1f2937',
        },
        backgroundColor: {
          'custom-white': '#ffffff',
          'custom-gray-100': '#f3f4f6',
          'custom-gray-200': '#e5e7eb',
          'custom-gray-300': '#d1d5db',
          'custom-gray-400': '#9ca3af',
          'custom-blue-300': '#d1d5db',
          'custom-blue-400': '#6675df',
          'custom-blue-700': '#1d4ed8',
        },
        borderColor: {
          'custom-gray-400': '#9ca3af',
          'custom-blue-300': '#d1d5db',
        },
        boxShadow: {
          'custom': '0 1px 3px 0 rgba(0, 0, 0, 0.14), 0 1px 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.12)',
        },
        padding: {
          'custom-2.5': '0.625rem',
        },
        height: {
          'custom-12': '3rem',
        },
        width: {
          'custom-12': '3rem',
        },
      },
    },
    plugins: [],
  };