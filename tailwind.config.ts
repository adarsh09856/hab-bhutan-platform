import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Public Design System tokens (README.md & BUILD-RULES.md)
        ink: {
          DEFAULT: '#33261F',
          2: '#4A3C33',
        },
        muted: '#6B5A4C',
        pagebg: '#F4F0E7',
        surface: '#FFFCF8',
        line: {
          DEFAULT: '#E4DDD1',
          soft: '#EFE9DE',
        },
        'field-border': '#CDBEA8',
        accent: {
          DEFAULT: '#8B2E24',
          hover: '#6E241C',
          deep: '#7A2820',
          rule: '#A85246',
          label: '#F0D2C9',
          body: '#F6E7E2',
          faint: '#EBC9C2',
          soft: '#F1E9DB',
        },
        brass: '#C9A46A',
        'on-dark': {
          DEFAULT: '#F1ECE2',
          body: '#D2C2AE',
          faint: '#A8947F',
        },
        'dark-line': {
          DEFAULT: '#4E3D2E',
          2: '#463629',
        },
        'dark-surface-2': '#42332A',
        verify: {
          bg: '#EFF0E4',
          fg: '#4C6B41',
        },
        'hover-nav': '#EDE5D6',
        'hover-menu': '#F1EADC',

        // Dedicated Internal CRM design system tokens (Dense Slate / Neutral)
        crm: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          text: '#0F172A',
          muted: '#64748B',
          primary: '#1E293B',
          'primary-hover': '#0F172A',
          success: '#16A34A',
          'success-light': '#DCFCE7',
          warning: '#D97706',
          'warning-light': '#FEF3C7',
          danger: '#DC2626',
          'danger-light': '#FEE2E2',
          info: '#2563EB',
          'info-light': '#DBEAFE',
        }
      },
      fontFamily: {
        // Public typography system (Empirically verified from prototype)
        marcellus: ['Marcellus', 'serif'],
        figtree: ['Figtree', 'sans-serif'],
        lora: ['Lora', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        // CRM typography
        crm: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // EXACTLY TWO SHADOWS ALLOWED ON PUBLIC SITE
        'mega-menu': '0 18px 44px rgba(58,42,33,.16)',
        'members-dropdown': '0 14px 34px rgba(27,26,24,.12)',
        // CRM shadows for operational modal/popover dialogs
        'crm-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'crm-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'public-btn': '7px',
        'public-input': '8px',
        'public-card': '12px',
        'public-feature': '14px',
        'public-hero': '16px',
      }
    },
  },
  plugins: [],
};

export default config;
