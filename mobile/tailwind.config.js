/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Design System v1 (claude.ai/design, "Booking Chef - Design System") —
      // Direção 1b, Cozinha: papel quente, laranja de brasa, serifado só em
      // títulos e números grandes. Substitui os gray-*/blue-*/red-*
      // espalhados pelo app antes disso — sempre usar estes tokens daqui
      // pra frente, nunca as cores cruas do Tailwind.
      colors: {
        brand: {
          DEFAULT: '#C2551F', // Brasa — ação: botão primário, FAB, aba ativa
          hover: '#B24C1A',
          pressed: '#A8471A',
          dark: '#E8763A', // mais claro no escuro — laranja saturado sobre preto perde contraste
        },
        secondary: {
          DEFAULT: '#4E6B3F', // Oliva — contraponto frio, módulo Cozinha
          dark: '#7FA05F',
        },
        danger: {
          DEFAULT: '#A82D22',
          hover: '#96271D',
          pressed: '#7C1F17',
          bg: '#FBE9E6',
          border: '#EFC9C2',
          dark: '#F0654A',
        },
        success: {
          DEFAULT: '#3E5732',
          text: '#28381F',
          bg: '#E9EFE4',
          border: '#CFDCC5',
          dark: '#7FA05F',
        },
        warning: {
          DEFAULT: '#B06A15', // versão texto do Âmbar #E0A64B (contraste AA)
          text: '#6E4209',
          bg: '#FBEEE2',
          border: '#EBD5BE',
          dark: '#E0A64B',
        },
        ink: {
          DEFAULT: '#1E1813', // texto primário — preto amarronzado, nunca puro
          secondary: '#7A6A5A', // 4,7:1 sobre o cartão — nunca mais claro
          dark: '#F6EFE6',
          'secondary-dark': '#9A8B7B',
        },
        surface: {
          page: '#EFE7DA', // fundo da tela — o "papel"
          card: '#FFFDFA', // cartão, input, superfície elevada
          alt: '#F4EADC', // fundo alternativo / pressed / seção destacada
          border: '#E8DDCC', // borda padrão de cartão
          'input-border': '#E0D0BE', // borda padrão de input (levemente mais escura)
          disabled: '#F7F0E6', // fundo de campo/estado disabled
          'page-dark': '#14100D',
          'card-dark': '#1D1814',
          'border-dark': '#2E2620',
        },
      },
      fontFamily: {
        // Duas famílias, sem exceção (ver seção 03 do design system).
        // Pesos permitidos em Archivo: 400/600/700 — cada peso é uma família
        // de fonte separada no React Native, por isso os nomes explícitos
        // (não dá pra usar font-bold em cima de font-archivo e esperar o
        // peso mudar sozinho, como no CSS web).
        archivo: ['Archivo_400Regular'],
        'archivo-medium': ['Archivo_500Medium'],
        'archivo-semibold': ['Archivo_600SemiBold'],
        'archivo-bold': ['Archivo_700Bold'],
        // Só em título de tela e número-herói (CMV, custo, saldo) — nunca
        // abaixo de 22px nem em texto corrido.
        display: ['InstrumentSerif_400Regular'],
      },
    },
  },
  plugins: [],
};
