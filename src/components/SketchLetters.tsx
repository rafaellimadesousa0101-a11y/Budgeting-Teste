import React from 'react';

export interface SketchLetterProps {
  isDark?: boolean;
}

// Function to get pencil colors based on dark mode (inverting black and white)
export const getPencilColors = (isDark: boolean = false) => {
  if (isDark) {
    return {
      PENCIL_DARK: '#ffffff',
      PENCIL_MED: '#e4e4e7',
      PENCIL_LIGHT: '#a1a1aa',
      PENCIL_FAINT: '#71717a',
      PAPER_FILL: '#09090b',
      SHADOW_COLOR: '#ffffff',
      SHADOW_OPACITY: '0.18',
    };
  }
  return {
    PENCIL_DARK: '#18181b',
    PENCIL_MED: '#3f3f46',
    PENCIL_LIGHT: '#71717a',
    PENCIL_FAINT: '#a1a1aa',
    PAPER_FILL: '#ffffff',
    SHADOW_COLOR: '#27272a',
    SHADOW_OPACITY: '0.25',
  };
};

// Shared SVG defs for pencil textures, hatching and shading
export const SketchDefs: React.FC<{ isDark?: boolean }> = ({ isDark = false }) => {
  const c = getPencilColors(isDark);
  const hatchId = isDark ? 'sketch-hatch-45-dark' : 'sketch-hatch-45';
  const washId = isDark ? 'pencil-wash-dark' : 'pencil-wash';
  const shadowId = isDark ? 'sketch-paper-shadow-dark' : 'sketch-paper-shadow';

  return (
    <defs>
      {/* Fine 45-degree graphite pencil hatching */}
      <pattern
        id={hatchId}
        width="5"
        height="5"
        patternTransform="rotate(45 0 0)"
        patternUnits="userSpaceOnUse"
      >
        <line x1="0" y1="0" x2="0" y2="5" stroke={c.PENCIL_LIGHT} strokeWidth="0.8" opacity="0.65" />
      </pattern>

      {/* Secondary crosshatching for deep pencil shading */}
      <pattern
        id={isDark ? 'sketch-crosshatch-dark' : 'sketch-crosshatch'}
        width="6"
        height="6"
        patternTransform="rotate(45 0 0)"
        patternUnits="userSpaceOnUse"
      >
        <line x1="0" y1="0" x2="0" y2="6" stroke={c.PENCIL_MED} strokeWidth="0.75" opacity="0.6" />
        <line x1="0" y1="0" x2="6" y2="0" stroke={c.PENCIL_MED} strokeWidth="0.75" opacity="0.6" />
      </pattern>

      {/* Soft graphite wash on paper */}
      <linearGradient id={washId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={isDark ? '#09090b' : '#ffffff'} />
        <stop offset="50%" stopColor={isDark ? '#18181b' : '#f4f4f5'} />
        <stop offset="100%" stopColor={isDark ? '#27272a' : '#e4e4e7'} />
      </linearGradient>

      {/* Soft pencil paper shadow */}
      <filter id={shadowId} x="-10%" y="-10%" width="125%" height="130%">
        <feDropShadow dx="1" dy="1.5" stdDeviation="1" floodColor={c.SHADOW_COLOR} floodOpacity={c.SHADOW_OPACITY} />
      </filter>
    </defs>
  );
};

export const SketchLetterB: React.FC<SketchLetterProps> = ({ isDark = false }) => {
  const c = getPencilColors(isDark);
  const hatchUrl = isDark ? 'url(#sketch-hatch-45-dark)' : 'url(#sketch-hatch-45)';
  const washUrl = isDark ? 'url(#pencil-wash-dark)' : 'url(#pencil-wash)';
  const shadowUrl = isDark ? 'url(#sketch-paper-shadow-dark)' : 'url(#sketch-paper-shadow)';

  return (
    <svg
      viewBox="0 0 54 60"
      className="h-7 sm:h-8 md:h-9 w-auto select-none overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <SketchDefs isDark={isDark} />
      <g filter={shadowUrl}>
        {/* Draft construction guidelines (artist pencil marks) */}
        <line x1="6" y1="4" x2="48" y2="4" stroke={c.PENCIL_FAINT} strokeWidth="0.6" strokeDasharray="3 2" />
        <line x1="6" y1="56" x2="48" y2="56" stroke={c.PENCIL_FAINT} strokeWidth="0.6" strokeDasharray="3 2" />

        {/* Main B body fill with pencil shading and hatching */}
        <path
          d="M 8 4 L 30 4 C 42 4 48 11 48 19 C 48 27 41 30 28 30 C 43 30 50 36 50 44 C 50 52 42 56 28 56 L 8 56 Z"
          fill={washUrl}
        />
        <path
          d="M 8 4 L 30 4 C 42 4 48 11 48 19 C 48 27 41 30 28 30 C 43 30 50 36 50 44 C 50 52 42 56 28 56 L 8 56 Z"
          fill={hatchUrl}
          opacity="0.8"
        />

        {/* Counter holes (paper showing through) */}
        <path
          d="M 18 12 L 28 12 C 34 12 38 14 38 19 C 38 24 34 24 28 24 L 18 24 Z"
          fill={c.PAPER_FILL}
          stroke={c.PENCIL_DARK}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M 18 35 L 29 35 C 36 35 40 37 40 43 C 40 48 35 49 29 49 L 18 49 Z"
          fill={c.PAPER_FILL}
          stroke={c.PENCIL_DARK}
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Hand-drawn primary pencil outline */}
        <path
          d="M 8 4 L 30 4 C 42 4 48 11 48 19 C 48 27 41 30 28 30 C 43 30 50 36 50 44 C 50 52 42 56 28 56 L 8 56 Z"
          stroke={c.PENCIL_DARK}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary sketchy pencil overlap stroke for authentic graphite jitter */}
        <path
          d="M 7.5 3.5 L 30.5 4.5 C 41.5 4 47.5 11.5 47.5 19 C 47.5 26.5 41.5 29.5 28.5 29.5 C 42.5 30.5 49.5 36.5 49.5 44 C 49.5 51.5 41.5 55.5 28 56.5 L 7.5 55.5 Z"
          stroke={c.PENCIL_MED}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Spine vertical accent stroke */}
        <line x1="8" y1="3" x2="8" y2="57" stroke={c.PENCIL_DARK} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="9" y1="5" x2="9" y2="55" stroke={c.PENCIL_LIGHT} strokeWidth="0.8" />
      </g>
    </svg>
  );
};

export const SketchLetterU: React.FC<SketchLetterProps> = ({ isDark = false }) => {
  const c = getPencilColors(isDark);
  const hatchUrl = isDark ? 'url(#sketch-hatch-45-dark)' : 'url(#sketch-hatch-45)';
  const washUrl = isDark ? 'url(#pencil-wash-dark)' : 'url(#pencil-wash)';
  const shadowUrl = isDark ? 'url(#sketch-paper-shadow-dark)' : 'url(#sketch-paper-shadow)';

  return (
    <svg
      viewBox="0 0 54 60"
      className="h-7 sm:h-8 md:h-9 w-auto select-none overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <SketchDefs isDark={isDark} />
      <g filter={shadowUrl}>
        {/* Draft construction line */}
        <line x1="6" y1="4" x2="48" y2="4" stroke={c.PENCIL_FAINT} strokeWidth="0.6" strokeDasharray="3 2" />

        {/* Main U body fill with pencil shading and hatching */}
        <path
          d="M 8 4 L 18 4 L 18 36 C 18 42 22 45 27 45 C 32 45 36 42 36 36 L 36 4 L 46 4 L 46 36 C 46 48 38 56 27 56 C 16 56 8 48 8 36 Z"
          fill={washUrl}
        />
        <path
          d="M 8 4 L 18 4 L 18 36 C 18 42 22 45 27 45 C 32 45 36 42 36 36 L 36 4 L 46 4 L 46 36 C 46 48 38 56 27 56 C 16 56 8 48 8 36 Z"
          fill={hatchUrl}
          opacity="0.8"
        />

        {/* Main hand-sketched graphite contour */}
        <path
          d="M 8 4 L 18 4 L 18 36 C 18 42 22 45 27 45 C 32 45 36 42 36 36 L 36 4 L 46 4 L 46 36 C 46 48 38 56 27 56 C 16 56 8 48 8 36 Z"
          stroke={c.PENCIL_DARK}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hand-drawn sketchy jitter trace */}
        <path
          d="M 7.5 4.5 L 18.5 4.5 L 18.5 35.5 C 18.5 41.5 22.5 44.5 27 44.5 C 31.5 44.5 35.5 41.5 35.5 35.5 L 35.5 4.5 L 46.5 4.5 L 46.5 36.5 C 46.5 47.5 37.5 55.5 27 55.5 C 16.5 55.5 7.5 47.5 7.5 36.5 Z"
          stroke={c.PENCIL_MED}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Pencil hatch crossbars at bottom curve */}
        <path d="M 12 40 L 16 46" stroke={c.PENCIL_MED} strokeWidth="1" strokeLinecap="round" />
        <path d="M 24 50 L 29 50" stroke={c.PENCIL_MED} strokeWidth="1" strokeLinecap="round" />
        <path d="M 38 46 L 42 40" stroke={c.PENCIL_MED} strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export const SketchLetterD: React.FC<SketchLetterProps> = ({ isDark = false }) => {
  const c = getPencilColors(isDark);
  const hatchUrl = isDark ? 'url(#sketch-hatch-45-dark)' : 'url(#sketch-hatch-45)';
  const washUrl = isDark ? 'url(#pencil-wash-dark)' : 'url(#pencil-wash)';
  const shadowUrl = isDark ? 'url(#sketch-paper-shadow-dark)' : 'url(#sketch-paper-shadow)';

  return (
    <svg
      viewBox="0 0 54 60"
      className="h-7 sm:h-8 md:h-9 w-auto select-none overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <SketchDefs isDark={isDark} />
      <g filter={shadowUrl}>
        {/* Draft construction lines */}
        <line x1="6" y1="4" x2="50" y2="4" stroke={c.PENCIL_FAINT} strokeWidth="0.6" strokeDasharray="3 2" />
        <line x1="6" y1="56" x2="50" y2="56" stroke={c.PENCIL_FAINT} strokeWidth="0.6" strokeDasharray="3 2" />

        {/* Main D body fill */}
        <path
          d="M 8 4 L 26 4 C 42 4 48 14 48 30 C 48 46 42 56 26 56 L 8 56 Z"
          fill={washUrl}
        />
        <path
          d="M 8 4 L 26 4 C 42 4 48 14 48 30 C 48 46 42 56 26 56 L 8 56 Z"
          fill={hatchUrl}
          opacity="0.8"
        />

        {/* Counter hole */}
        <path
          d="M 18 14 L 26 14 C 36 14 38 20 38 30 C 38 40 36 46 26 46 L 18 46 Z"
          fill={c.PAPER_FILL}
          stroke={c.PENCIL_DARK}
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Main hand-sketched graphite contour */}
        <path
          d="M 8 4 L 26 4 C 42 4 48 14 48 30 C 48 46 42 56 26 56 L 8 56 Z"
          stroke={c.PENCIL_DARK}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary jitter outline */}
        <path
          d="M 7.5 4.5 L 26.5 4.5 C 41.5 4.5 47.5 14.5 47.5 30 C 47.5 45.5 41.5 55.5 26.5 55.5 L 7.5 55.5 Z"
          stroke={c.PENCIL_MED}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Spine vertical accent stroke */}
        <line x1="8" y1="3" x2="8" y2="57" stroke={c.PENCIL_DARK} strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export const SketchLetterG1: React.FC<SketchLetterProps> = ({ isDark = false }) => {
  const c = getPencilColors(isDark);
  const hatchUrl = isDark ? 'url(#sketch-hatch-45-dark)' : 'url(#sketch-hatch-45)';
  const washUrl = isDark ? 'url(#pencil-wash-dark)' : 'url(#pencil-wash)';
  const shadowUrl = isDark ? 'url(#sketch-paper-shadow-dark)' : 'url(#sketch-paper-shadow)';

  return (
    <svg
      viewBox="0 0 54 60"
      className="h-7 sm:h-8 md:h-9 w-auto select-none overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <SketchDefs isDark={isDark} />
      <g filter={shadowUrl}>
        {/* Draft construction line */}
        <line x1="6" y1="4" x2="50" y2="4" stroke={c.PENCIL_FAINT} strokeWidth="0.6" strokeDasharray="3 2" />

        {/* Main G body with firm upper perching ledge for the budgie */}
        <path
          d="M 46 16 L 38 16 C 35 11 31 10 26 10 C 16 10 10 18 10 30 C 10 42 16 50 27 50 C 37 50 42 45 42 36 L 28 36 L 28 27 L 49 27 L 49 42 C 49 51 40 56 27 56 C 12 56 3 45 3 30 C 3 15 12 4 27 4 C 38 4 45 9 48 17 Z"
          fill={washUrl}
        />
        <path
          d="M 46 16 L 38 16 C 35 11 31 10 26 10 C 16 10 10 18 10 30 C 10 42 16 50 27 50 C 37 50 42 45 42 36 L 28 36 L 28 27 L 49 27 L 49 42 C 49 51 40 56 27 56 C 12 56 3 45 3 30 C 3 15 12 4 27 4 C 38 4 45 9 48 17 Z"
          fill={hatchUrl}
          opacity="0.8"
        />

        {/* Main hand-sketched graphite contour */}
        <path
          d="M 46 16 L 38 16 C 35 11 31 10 26 10 C 16 10 10 18 10 30 C 10 42 16 50 27 50 C 37 50 42 45 42 36 L 28 36 L 28 27 L 49 27 L 49 42 C 49 51 40 56 27 56 C 12 56 3 45 3 30 C 3 15 12 4 27 4 C 38 4 45 9 48 17 Z"
          stroke={c.PENCIL_DARK}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary jitter outline */}
        <path
          d="M 45.5 16.5 L 38.5 16.5 C 34.5 11.5 30.5 10.5 26 10.5 C 16.5 10.5 10.5 18.5 10.5 30 C 10.5 41.5 16.5 49.5 27 49.5 C 36.5 49.5 41.5 44.5 41.5 36.5 L 28.5 36.5 L 28.5 27.5 L 48.5 27.5 L 48.5 41.5 C 48.5 50.5 39.5 55.5 27 55.5 C 12.5 55.5 3.5 44.5 3.5 30 C 3.5 15.5 12.5 4.5 27 4.5 C 37.5 4.5 44.5 9.5 47.5 16.5 Z"
          stroke={c.PENCIL_MED}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Crossbar emphasis */}
        <line x1="28" y1="36" x2="44" y2="36" stroke={c.PENCIL_DARK} strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export const SketchLetterE: React.FC<SketchLetterProps> = ({ isDark = false }) => {
  const c = getPencilColors(isDark);
  const hatchUrl = isDark ? 'url(#sketch-hatch-45-dark)' : 'url(#sketch-hatch-45)';
  const washUrl = isDark ? 'url(#pencil-wash-dark)' : 'url(#pencil-wash)';
  const shadowUrl = isDark ? 'url(#sketch-paper-shadow-dark)' : 'url(#sketch-paper-shadow)';

  return (
    <svg
      viewBox="0 0 54 60"
      className="h-7 sm:h-8 md:h-9 w-auto select-none overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <SketchDefs isDark={isDark} />
      <g filter={shadowUrl}>
        {/* Draft line */}
        <line x1="6" y1="4" x2="48" y2="4" stroke={c.PENCIL_FAINT} strokeWidth="0.6" strokeDasharray="3 2" />

        {/* E Body fill */}
        <path
          d="M 8 4 L 46 4 L 46 14 L 18 14 L 18 24 L 40 24 L 40 33 L 18 33 L 18 46 L 48 46 L 48 56 L 8 56 Z"
          fill={washUrl}
        />
        <path
          d="M 8 4 L 46 4 L 46 14 L 18 14 L 18 24 L 40 24 L 40 33 L 18 33 L 18 46 L 48 46 L 48 56 L 8 56 Z"
          fill={hatchUrl}
          opacity="0.8"
        />

        {/* Main contour */}
        <path
          d="M 8 4 L 46 4 L 46 14 L 18 14 L 18 24 L 40 24 L 40 33 L 18 33 L 18 46 L 48 46 L 48 56 L 8 56 Z"
          stroke={c.PENCIL_DARK}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary jitter trace */}
        <path
          d="M 7.5 4.5 L 45.5 4.5 L 45.5 13.5 L 18.5 13.5 L 18.5 24.5 L 39.5 24.5 L 39.5 32.5 L 18.5 32.5 L 18.5 46.5 L 47.5 46.5 L 47.5 55.5 L 7.5 55.5 Z"
          stroke={c.PENCIL_MED}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Spine line */}
        <line x1="8" y1="3" x2="8" y2="57" stroke={c.PENCIL_DARK} strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export const SketchLetterT: React.FC<SketchLetterProps> = ({ isDark = false }) => {
  const c = getPencilColors(isDark);
  const hatchUrl = isDark ? 'url(#sketch-hatch-45-dark)' : 'url(#sketch-hatch-45)';
  const washUrl = isDark ? 'url(#pencil-wash-dark)' : 'url(#pencil-wash)';
  const shadowUrl = isDark ? 'url(#sketch-paper-shadow-dark)' : 'url(#sketch-paper-shadow)';

  return (
    <svg
      viewBox="0 0 54 60"
      className="h-7 sm:h-8 md:h-9 w-auto select-none overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <SketchDefs isDark={isDark} />
      <g filter={shadowUrl}>
        {/* Draft line */}
        <line x1="4" y1="4" x2="50" y2="4" stroke={c.PENCIL_FAINT} strokeWidth="0.6" strokeDasharray="3 2" />

        {/* T Body fill */}
        <path
          d="M 6 4 L 48 4 L 48 14 L 32 14 L 32 56 L 22 56 L 22 14 L 6 14 Z"
          fill={washUrl}
        />
        <path
          d="M 6 4 L 48 4 L 48 14 L 32 14 L 32 56 L 22 56 L 22 14 L 6 14 Z"
          fill={hatchUrl}
          opacity="0.8"
        />

        {/* Main contour */}
        <path
          d="M 6 4 L 48 4 L 48 14 L 32 14 L 32 56 L 22 56 L 22 14 L 6 14 Z"
          stroke={c.PENCIL_DARK}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary jitter trace */}
        <path
          d="M 5.5 4.5 L 47.5 4.5 L 47.5 13.5 L 32.5 13.5 L 32.5 55.5 L 21.5 55.5 L 21.5 13.5 L 5.5 13.5 Z"
          stroke={c.PENCIL_MED}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Top bar underline sketch */}
        <line x1="8" y1="14" x2="46" y2="14" stroke={c.PENCIL_LIGHT} strokeWidth="0.8" />
      </g>
    </svg>
  );
};

export const SketchLetterI: React.FC<SketchLetterProps> = ({ isDark = false }) => {
  const c = getPencilColors(isDark);
  const hatchUrl = isDark ? 'url(#sketch-hatch-45-dark)' : 'url(#sketch-hatch-45)';
  const washUrl = isDark ? 'url(#pencil-wash-dark)' : 'url(#pencil-wash)';
  const shadowUrl = isDark ? 'url(#sketch-paper-shadow-dark)' : 'url(#sketch-paper-shadow)';

  return (
    <svg
      viewBox="0 0 54 60"
      className="h-7 sm:h-8 md:h-9 w-auto select-none overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <SketchDefs isDark={isDark} />
      <g filter={shadowUrl}>
        {/* Draft line */}
        <line x1="12" y1="4" x2="42" y2="4" stroke={c.PENCIL_FAINT} strokeWidth="0.6" strokeDasharray="3 2" />

        {/* I Body fill */}
        <path
          d="M 16 4 L 38 4 L 38 14 L 32 14 L 32 46 L 38 46 L 38 56 L 16 56 L 16 46 L 22 46 L 22 14 L 16 14 Z"
          fill={washUrl}
        />
        <path
          d="M 16 4 L 38 4 L 38 14 L 32 14 L 32 46 L 38 46 L 38 56 L 16 56 L 16 46 L 22 46 L 22 14 L 16 14 Z"
          fill={hatchUrl}
          opacity="0.8"
        />

        {/* Main contour */}
        <path
          d="M 16 4 L 38 4 L 38 14 L 32 14 L 32 46 L 38 46 L 38 56 L 16 56 L 16 46 L 22 46 L 22 14 L 16 14 Z"
          stroke={c.PENCIL_DARK}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary jitter trace */}
        <path
          d="M 15.5 4.5 L 37.5 4.5 L 37.5 13.5 L 32.5 13.5 L 32.5 46.5 L 37.5 46.5 L 37.5 55.5 L 15.5 55.5 L 15.5 46.5 L 21.5 46.5 L 21.5 13.5 L 15.5 13.5 Z"
          stroke={c.PENCIL_MED}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  );
};

export const SketchLetterN: React.FC<SketchLetterProps> = ({ isDark = false }) => {
  const c = getPencilColors(isDark);
  const hatchUrl = isDark ? 'url(#sketch-hatch-45-dark)' : 'url(#sketch-hatch-45)';
  const washUrl = isDark ? 'url(#pencil-wash-dark)' : 'url(#pencil-wash)';
  const shadowUrl = isDark ? 'url(#sketch-paper-shadow-dark)' : 'url(#sketch-paper-shadow)';

  return (
    <svg
      viewBox="0 0 54 60"
      className="h-7 sm:h-8 md:h-9 w-auto select-none overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <SketchDefs isDark={isDark} />
      <g filter={shadowUrl}>
        {/* Draft line */}
        <line x1="6" y1="4" x2="48" y2="4" stroke={c.PENCIL_FAINT} strokeWidth="0.6" strokeDasharray="3 2" />

        {/* N Body fill */}
        <path
          d="M 8 4 L 19 4 L 36 38 L 36 4 L 46 4 L 46 56 L 35 56 L 18 22 L 18 56 L 8 56 Z"
          fill={washUrl}
        />
        <path
          d="M 8 4 L 19 4 L 36 38 L 36 4 L 46 4 L 46 56 L 35 56 L 18 22 L 18 56 L 8 56 Z"
          fill={hatchUrl}
          opacity="0.8"
        />

        {/* Main contour */}
        <path
          d="M 8 4 L 19 4 L 36 38 L 36 4 L 46 4 L 46 56 L 35 56 L 18 22 L 18 56 L 8 56 Z"
          stroke={c.PENCIL_DARK}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary jitter trace */}
        <path
          d="M 7.5 4.5 L 19.5 4.5 L 36.5 37.5 L 36.5 4.5 L 45.5 4.5 L 45.5 55.5 L 34.5 55.5 L 17.5 22.5 L 17.5 55.5 L 7.5 55.5 Z"
          stroke={c.PENCIL_MED}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Stems emphasis */}
        <line x1="8" y1="3" x2="8" y2="57" stroke={c.PENCIL_DARK} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="46" y1="3" x2="46" y2="57" stroke={c.PENCIL_DARK} strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export const SketchLetterG2: React.FC<SketchLetterProps> = ({ isDark = false }) => {
  const c = getPencilColors(isDark);
  const hatchUrl = isDark ? 'url(#sketch-hatch-45-dark)' : 'url(#sketch-hatch-45)';
  const washUrl = isDark ? 'url(#pencil-wash-dark)' : 'url(#pencil-wash)';
  const shadowUrl = isDark ? 'url(#sketch-paper-shadow-dark)' : 'url(#sketch-paper-shadow)';

  return (
    <svg
      viewBox="0 0 54 60"
      className="h-7 sm:h-8 md:h-9 w-auto select-none overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <SketchDefs isDark={isDark} />
      <g filter={shadowUrl}>
        {/* Draft construction line */}
        <line x1="6" y1="4" x2="50" y2="4" stroke={c.PENCIL_FAINT} strokeWidth="0.6" strokeDasharray="3 2" />

        {/* Main G body with firm upper perching ledge */}
        <path
          d="M 46 16 L 38 16 C 35 11 31 10 26 10 C 16 10 10 18 10 30 C 10 42 16 50 27 50 C 37 50 42 45 42 36 L 28 36 L 28 27 L 49 27 L 49 42 C 49 51 40 56 27 56 C 12 56 3 45 3 30 C 3 15 12 4 27 4 C 38 4 45 9 48 17 Z"
          fill={washUrl}
        />
        <path
          d="M 46 16 L 38 16 C 35 11 31 10 26 10 C 16 10 10 18 10 30 C 10 42 16 50 27 50 C 37 50 42 45 42 36 L 28 36 L 28 27 L 49 27 L 49 42 C 49 51 40 56 27 56 C 12 56 3 45 3 30 C 3 15 12 4 27 4 C 38 4 45 9 48 17 Z"
          fill={hatchUrl}
          opacity="0.8"
        />

        {/* Main hand-sketched graphite contour */}
        <path
          d="M 46 16 L 38 16 C 35 11 31 10 26 10 C 16 10 10 18 10 30 C 10 42 16 50 27 50 C 37 50 42 45 42 36 L 28 36 L 28 27 L 49 27 L 49 42 C 49 51 40 56 27 56 C 12 56 3 45 3 30 C 3 15 12 4 27 4 C 38 4 45 9 48 17 Z"
          stroke={c.PENCIL_DARK}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary jitter outline */}
        <path
          d="M 45.5 16.5 L 38.5 16.5 C 34.5 11.5 30.5 10.5 26 10.5 C 16.5 10.5 10.5 18.5 10.5 30 C 10.5 41.5 16.5 49.5 27 49.5 C 36.5 49.5 41.5 44.5 41.5 36.5 L 28.5 36.5 L 28.5 27.5 L 48.5 27.5 L 48.5 41.5 C 48.5 50.5 39.5 55.5 27 55.5 C 12.5 55.5 3.5 44.5 3.5 30 C 3.5 15.5 12.5 4.5 27 4.5 C 37.5 4.5 44.5 9.5 47.5 16.5 Z"
          stroke={c.PENCIL_MED}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Crossbar emphasis */}
        <line x1="28" y1="36" x2="44" y2="36" stroke={c.PENCIL_DARK} strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
};

// ==============================================================================
// SKETCH BUDGIE BIRD (Pencil / Chalk Drawn, with full light/dark inversion)
// Hand-sketched budgie with pencil cross-hatching, stippling, and claws
// ==============================================================================

export const SketchBudgieBird: React.FC<{
  isFlying: boolean;
  isPerched: boolean;
  isFlyingAway: boolean;
  isDark?: boolean;
}> = ({ isFlying, isPerched, isFlyingAway, isDark = false }) => {
  const c = getPencilColors(isDark);
  const budgieHatchId = isDark ? 'budgie-sketch-hatch-dark' : 'budgie-sketch-hatch';
  const bodyGradId = isDark ? 'graphite-body-grad-dark' : 'graphite-body-grad';
  const wingGradId = isDark ? 'graphite-wing-grad-dark' : 'graphite-wing-grad';

  return (
    <div
      className={`absolute pointer-events-none z-50 select-none ${
        isFlying
          ? 'animate-[budgieFlightExtended_5.4s_cubic-bezier(0.25,0.1,0.25,1)_both]'
          : isFlyingAway
          ? 'animate-[budgieFlyAway_1.2s_cubic-bezier(0.4,0,0.2,1)_both]'
          : isPerched
          ? 'animate-[budgieIdle_2.4s_ease-in-out_infinite]'
          : 'hidden'
      }`}
      style={{
        left: '50%',
        bottom: 'calc(100% - 16px)',
        transformOrigin: '50% 75%',
        width: '54px',
        height: '52px',
        marginLeft: '-27px',
      }}
    >
      <svg
        viewBox="0 0 72 70"
        className={`w-full h-full filter ${
          isDark
            ? 'drop-shadow-[0_2px_5px_rgba(255,255,255,0.25)]'
            : 'drop-shadow-[0_2px_4px_rgba(39,39,42,0.35)]'
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={budgieHatchId}
            width="3.5"
            height="3.5"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="3.5"
              stroke={isDark ? '#a1a1aa' : '#52525b'}
              strokeWidth="0.7"
              opacity="0.6"
            />
          </pattern>
          <linearGradient id={bodyGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={isDark ? '#09090b' : '#ffffff'} />
            <stop offset="50%" stopColor={isDark ? '#18181b' : '#f4f4f5'} />
            <stop offset="100%" stopColor={isDark ? '#27272a' : '#d4d4d8'} />
          </linearGradient>
          <linearGradient id={wingGradId} x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor={isDark ? '#18181b' : '#f4f4f5'} />
            <stop offset="60%" stopColor={isDark ? '#27272a' : '#d4d4d8'} />
            <stop offset="100%" stopColor={isDark ? '#3f3f46' : '#71717a'} />
          </linearGradient>
        </defs>

        {/* 1. Far Wing (Behind body in flight, flapping in 3D perspective) */}
        {isFlying && (
          <g className="animate-[budgieFarWingFlap_0.13s_ease-in-out_infinite_alternate] origin-[34px_22px] opacity-80">
            <path
              d="M 28 20 C 26 10 32 3 38 1 C 41 8 40 18 34 22 Z"
              fill={`url(#${wingGradId})`}
              stroke={c.PENCIL_DARK}
              strokeWidth="0.9"
            />
            {/* Wing hatch barbs */}
            <path d="M 30 15 Q 35 12 37 4" stroke={c.PENCIL_MED} strokeWidth="0.8" strokeLinecap="round" fill="none" />
            <path d="M 32 18 Q 36 14 38 8" stroke={c.PENCIL_MED} strokeWidth="0.8" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* 2. Long Slender Tail Feathers (hanging down naturally behind the letter) */}
        <path
          d="M 25 44 L 6 68 L 11 67 L 27 48 Z"
          fill={`url(#${bodyGradId})`}
          stroke={c.PENCIL_DARK}
          strokeWidth="0.9"
        />
        <path d="M 25 44 L 6 68" stroke={c.PENCIL_DARK} strokeWidth="0.8" />
        <path
          d="M 26 45 L 11 65 L 15 64 L 28 48 Z"
          fill={isDark ? '#27272a' : '#e4e4e7'}
          stroke={c.PENCIL_MED}
          strokeWidth="0.6"
        />
        {/* Tail feather hatch lines */}
        <path d="M 21 51 L 18 52" stroke={c.PENCIL_LIGHT} strokeWidth="0.7" />
        <path d="M 17 56 L 14 57" stroke={c.PENCIL_LIGHT} strokeWidth="0.7" />
        <path d="M 13 61 L 10 62" stroke={c.PENCIL_LIGHT} strokeWidth="0.7" />

        {/* 3. Aerodynamic Plump Body (Pencil-sketched) */}
        <path
          d="M 22 24 C 20 33 24 45 33 47 C 42 49 46 38 44 26 C 42 19 30 18 22 24 Z"
          fill={`url(#${bodyGradId})`}
          stroke={c.PENCIL_DARK}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        {/* Body pencil hatching */}
        <path
          d="M 22 24 C 20 33 24 45 33 47 C 42 49 46 38 44 26 C 42 19 30 18 22 24 Z"
          fill={`url(#${budgieHatchId})`}
          opacity="0.7"
        />
        {/* Secondary sketch jitter line */}
        <path
          d="M 22.5 24.5 C 20.5 33.5 24.5 45.5 33 47.5 C 41.5 48.5 45.5 38 43.5 26.5"
          stroke={c.PENCIL_LIGHT}
          strokeWidth="0.7"
          fill="none"
        />

        {/* 4. Head and Crown (Hand-sketched) */}
        <circle
          cx="39"
          cy="18"
          r="11"
          fill={`url(#${bodyGradId})`}
          stroke={c.PENCIL_DARK}
          strokeWidth="1.1"
        />
        <path
          d="M 32 17 C 35 11 44 11 47 16 C 49 20 46 25 39 25 C 34 25 31 21 32 17 Z"
          fill={`url(#${bodyGradId})`}
        />

        {/* Crown and Nape Tiger Stripes (Bold pencil hatch bars) */}
        <path d="M 33 13 Q 36 11 39 12" stroke={c.PENCIL_DARK} strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M 34 16 Q 37 14 41 15" stroke={c.PENCIL_DARK} strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M 34 19 Q 37 17 41 18" stroke={c.PENCIL_DARK} strokeWidth="0.9" strokeLinecap="round" fill="none" />

        {/* Cheeks & Throat Spots */}
        <ellipse
          cx="38"
          cy="22"
          rx="2"
          ry="1.4"
          fill={isDark ? '#3f3f46' : '#a1a1aa'}
          stroke={c.PENCIL_MED}
          strokeWidth="0.6"
        />
        <circle cx="34" cy="24" r="0.8" fill={c.PENCIL_DARK} />
        <circle cx="36" cy="25.2" r="0.8" fill={c.PENCIL_DARK} />
        <circle cx="39" cy="24.4" r="0.8" fill={c.PENCIL_DARK} />

        {/* Beak & Cere */}
        <ellipse
          cx="47.5"
          cy="18.5"
          rx="2.2"
          ry="1.3"
          fill={isDark ? '#27272a' : '#e4e4e7'}
          stroke={c.PENCIL_DARK}
          strokeWidth="0.7"
        />
        <circle cx="47.2" cy="18.3" r="0.4" fill={c.PENCIL_DARK} />
        <path
          d="M 47 19 C 51.5 19.5 52.5 22.5 48 24 C 46 23.5 46 20.5 47 19 Z"
          fill={isDark ? '#18181b' : '#f4f4f5'}
          stroke={c.PENCIL_DARK}
          strokeWidth="0.8"
        />

        {/* Sketched Eye (black with white reflection in light, white with dark pupil in dark) */}
        <circle cx="41" cy="16" r="2.4" fill={c.PENCIL_DARK} />
        <circle cx="41.7" cy="15.3" r="0.8" fill={c.PAPER_FILL} />

        {/* 5. Near Wing (Flapping during flight, folded when perched) */}
        <g className={isFlying ? 'animate-[budgieWingFlap_0.13s_ease-in-out_infinite_alternate] origin-[32px_24px]' : ''}>
          <path
            d="M 26 23 C 22 32 23 42 29 45 C 34 40 37 32 36 23 Z"
            fill={`url(#${wingGradId})`}
            stroke={c.PENCIL_DARK}
            strokeWidth="1.1"
          />
          {/* Wing quill and flight feather scallops in pencil */}
          <path d="M 26 28 Q 30 30 35 27" stroke={c.PENCIL_DARK} strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M 25 33 Q 30 35 34 31" stroke={c.PENCIL_MED} strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M 26 38 Q 30 40 33 36" stroke={c.PENCIL_DARK} strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M 27 42 Q 29 43 32 40" stroke={c.PENCIL_MED} strokeWidth="0.9" strokeLinecap="round" fill="none" />
          {/* Subtle wing crosshatching */}
          <path
            d="M 26 23 C 22 32 23 42 29 45 C 34 40 37 32 36 23 Z"
            fill={`url(#${budgieHatchId})`}
            opacity="0.5"
          />
        </g>

        {/* 6. Perching Feet & Claws (Visíveis o tempo todo, tanto em voo quanto ao pousar) */}
        <g id="budgie-sketch-claws" className="opacity-100">
          {/* Sombra suave quando pousado */}
          {isPerched && (
            <>
              <ellipse
                cx="31"
                cy="55.5"
                rx="5.5"
                ry="1.6"
                fill={isDark ? 'rgba(255,255,255,0.18)' : 'rgba(39,39,42,0.25)'}
              />
              <ellipse
                cx="42"
                cy="55.5"
                rx="5.5"
                ry="1.6"
                fill={isDark ? 'rgba(255,255,255,0.18)' : 'rgba(39,39,42,0.25)'}
              />
            </>
          )}

          {/* Feather puffs on thighs */}
          <path
            d="M 28 44 C 27 47 33 48 34 45 Z"
            fill={isDark ? '#27272a' : '#e4e4e7'}
            stroke={c.PENCIL_DARK}
            strokeWidth="0.7"
          />
          <path
            d="M 39 44 C 38 47 44 48 45 45 Z"
            fill={isDark ? '#27272a' : '#e4e4e7'}
            stroke={c.PENCIL_DARK}
            strokeWidth="0.7"
          />

          {/* Scaled parakeet legs (tarsus in pencil) */}
          <line x1="31" y1="45" x2="31" y2="51" stroke={c.PENCIL_MED} strokeWidth="2.8" strokeLinecap="round" />
          <line x1="42" y1="45" x2="42" y2="51" stroke={c.PENCIL_MED} strokeWidth="2.8" strokeLinecap="round" />
          <line x1="31" y1="46" x2="31" y2="50" stroke={c.PAPER_FILL} strokeWidth="1" strokeLinecap="round" />
          <line x1="42" y1="46" x2="42" y2="50" stroke={c.PAPER_FILL} strokeWidth="1" strokeLinecap="round" />

          {/* Back claws */}
          <path d="M 30 50 C 27 51 26 53 27 54.5" stroke={c.PENCIL_DARK} strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M 43 50 C 46 51 47 53 46 54.5" stroke={c.PENCIL_DARK} strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Left Foot - 3 Front Toes grasping tightly over the sketched G */}
          <path d="M 28 50 C 26 52 26 54.5 27 57" stroke={c.PENCIL_MED} strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 27 57 L 28 58.5" stroke={c.PENCIL_DARK} strokeWidth="1.6" strokeLinecap="round" />

          <path d="M 31 50 C 31 52.5 31 55 31.5 58" stroke={c.PENCIL_MED} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 31.5 58 L 32 59.5" stroke={c.PENCIL_DARK} strokeWidth="1.7" strokeLinecap="round" />

          <path d="M 33 50 C 34 52 35 54.5 34.5 57" stroke={c.PENCIL_MED} strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 34.5 57 L 34 58.5" stroke={c.PENCIL_DARK} strokeWidth="1.6" strokeLinecap="round" />

          {/* Right Foot - 3 Front Toes */}
          <path d="M 39 50 C 37 52 37 54.5 38 57" stroke={c.PENCIL_MED} strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 38 57 L 39 58.5" stroke={c.PENCIL_DARK} strokeWidth="1.6" strokeLinecap="round" />

          <path d="M 42 50 C 42 52.5 42 55 42.5 58" stroke={c.PENCIL_MED} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 42.5 58 L 43 59.5" stroke={c.PENCIL_DARK} strokeWidth="1.7" strokeLinecap="round" />

          <path d="M 44 50 C 45 52 46 54.5 45.5 57" stroke={c.PENCIL_MED} strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 45.5 57 L 45 58.5" stroke={c.PENCIL_DARK} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
