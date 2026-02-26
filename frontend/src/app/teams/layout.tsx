import { ReactNode } from 'react';

export default function TeamsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Hero section com background image e navbar flutuante */}
      <div
        className="relative"
        style={{
          backgroundImage: 'var(--login-bg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingTop: '5rem',
          paddingBottom: '0',
          minHeight: '200px',
        }}
      >
        {/* Wave SVG de transição */}
        <div className="absolute bottom-0 left-0 right-0 text-blue-50 dark:text-slate-900 leading-[0]">
          <svg
            viewBox="0 0 1440 200"
            width="100%"
            height="200"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,120 C240,60 480,180 720,120 C960,60 1200,180 1440,120 L1440,200 L0,200 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Área de conteúdo com gradiente */}
      <div className="bg-gradient-to-b from-blue-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        {children}
      </div>
    </div>
  );
}
