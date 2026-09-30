import React, { useState, useEffect, useRef } from 'react';
import {
  SketchLetterB,
  SketchLetterU,
  SketchLetterD,
  SketchLetterG1,
  SketchLetterE,
  SketchLetterT,
  SketchLetterI,
  SketchLetterN,
  SketchLetterG2,
  SketchBudgieBird,
} from './SketchLetters.tsx';

/**
 * BudgetingLogo
 * Renders the word "BUDGETING" where each letter is an individual geometric faceted SVG.
 * Colors follow the financial theme:
 * 1. B -> Entradas (Azul-ardósia #3b6790)
 * 2. U -> Saídas (Coral #e06a55)
 * 3. D -> A Pagar (Ocre #d99b26)
 * 4. G -> Caixinhas (Esmeralda #10b981)
 * 5. E -> Entradas (Azul-ardósia #3b6790)
 * 6. T -> Saídas (Coral #e06a55)
 * 7. I -> A Pagar (Ocre #d99b26) com ponto circular superior
 * 8. N -> Caixinhas (Esmeralda #10b981)
 * 9. G -> Dividido em 4 cores do calendário (Azul, Coral, Ocre, Esmeralda)
 * 
 * Styled with geometric facets, radial cuts, grooves and tactile depth matching the reference design.
 */

// Shared seam stroke between facets for the geometric cut aesthetic
const CUT_STROKE = 'rgba(0, 0, 0, 0.28)';
const CUT_STROKE_LIGHT = 'rgba(255, 255, 255, 0.25)';

export const LetterB: React.FC = () => (
  <svg
    viewBox="0 0 54 60"
    className="h-7 sm:h-8 md:h-9 w-auto select-none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="b-grad-1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5b8bb8" />
        <stop offset="100%" stopColor="#3b6790" />
      </linearGradient>
      <linearGradient id="b-grad-2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7baedc" />
        <stop offset="100%" stopColor="#4f7ea8" />
      </linearGradient>
      <linearGradient id="b-grad-3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3b6790" />
        <stop offset="100%" stopColor="#25486a" />
      </linearGradient>
      <linearGradient id="b-grad-4" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2b5074" />
        <stop offset="100%" stopColor="#18324a" />
      </linearGradient>
      <linearGradient id="b-cal-accent" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <filter id="shadow-letter" x="-10%" y="-10%" width="125%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.8" floodColor="#000000" floodOpacity="0.25" />
      </filter>
    </defs>

    <g filter="url(#shadow-letter)">
      {/* Outer base shape / facets */}
      {/* Top Left Facet */}
      <path
        d="M 6 4 L 26 4 L 26 28 L 6 28 Z"
        fill="url(#b-grad-2)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      {/* Top-Right Rounded Radial Lobe */}
      <path
        d="M 26 4 C 39 4 48 11 48 20 C 48 28 40 30 26 30 L 26 4 Z"
        fill="url(#b-grad-1)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      {/* Middle Calendar Slice Accent (toque esmeralda das caixinhas) */}
      <path
        d="M 26 26 L 46 26 L 40 33 L 26 31 Z"
        fill="url(#b-cal-accent)"
        stroke={CUT_STROKE}
        strokeWidth="0.6"
        opacity="0.9"
      />
      {/* Bottom-Left Spine Facet */}
      <path
        d="M 6 28 L 26 28 L 26 56 L 6 56 Z"
        fill="url(#b-grad-3)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      {/* Bottom-Right Rounded Radial Lobe */}
      <path
        d="M 26 30 C 42 30 50 37 50 44 C 50 52 41 56 26 56 L 26 30 Z"
        fill="url(#b-grad-4)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      {/* Radial slice cut lines across the lobes (like pie chart) */}
      <path d="M 26 17 L 48 10" stroke={CUT_STROKE_LIGHT} strokeWidth="1" strokeDasharray="3 2" />
      <path d="M 26 43 L 50 48" stroke={CUT_STROKE_LIGHT} strokeWidth="1" strokeDasharray="3 2" />

      {/* Holes / Counters of B */}
      {/* Top Counter */}
      <path
        d="M 17 12 L 27 12 C 32 12 36 14 36 19 C 36 23 32 24 27 24 L 17 24 Z"
        fill="#ffffff"
        className="dark:fill-zinc-950"
        stroke={CUT_STROKE}
        strokeWidth="1"
      />
      {/* Bottom Counter */}
      <path
        d="M 17 35 L 28 35 C 33 35 38 37 38 43 C 38 48 33 49 28 49 L 17 49 Z"
        fill="#ffffff"
        className="dark:fill-zinc-950"
        stroke={CUT_STROKE}
        strokeWidth="1"
      />
      {/* Subtle highlight sheen */}
      <path d="M 8 6 L 24 6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
);

export const LetterU: React.FC = () => (
  <svg
    viewBox="0 0 54 60"
    className="h-7 sm:h-8 md:h-9 w-auto select-none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="u-band-1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f5aba0" />
        <stop offset="100%" stopColor="#eb8573" />
      </linearGradient>
      <linearGradient id="u-band-2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#eb8573" />
        <stop offset="100%" stopColor="#e06a55" />
      </linearGradient>
      <linearGradient id="u-band-3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e06a55" />
        <stop offset="100%" stopColor="#b84733" />
      </linearGradient>
      <linearGradient id="u-band-4" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#b84733" />
        <stop offset="100%" stopColor="#872d1d" />
      </linearGradient>
      <clipPath id="u-letter-clip">
        <path d="M 6 4 L 18 4 L 18 36 C 18 41 22 44 27 44 C 32 44 36 41 36 36 L 36 4 L 48 4 L 48 36 C 48 48 39 56 27 56 C 15 56 6 48 6 36 Z" />
      </clipPath>
    </defs>

    <g filter="url(#shadow-letter)">
      {/* Clipped horizontal strata bands for flawless seamless curves */}
      <g clipPath="url(#u-letter-clip)">
        {/* Band 1 - Top level */}
        <rect x="5" y="4" width="44" height="13" fill="url(#u-band-1)" />
        {/* Band 2 - Middle upper */}
        <rect x="5" y="17" width="44" height="13" fill="url(#u-band-2)" />
        {/* Band 3 - Middle transition */}
        <rect x="5" y="30" width="44" height="13" fill="url(#u-band-3)" />
        {/* Band 4 - Deep curved bottom base */}
        <rect x="5" y="43" width="44" height="14" fill="url(#u-band-4)" />

        {/* Horizontal cut seam lines between strata */}
        <line x1="5" y1="17" x2="49" y2="17" stroke={CUT_STROKE} strokeWidth="0.8" />
        <line x1="5" y1="30" x2="49" y2="30" stroke={CUT_STROKE} strokeWidth="0.8" />
        <line x1="5" y1="43" x2="49" y2="43" stroke={CUT_STROKE} strokeWidth="0.8" />

        {/* Central vertical divider at the base curve */}
        <line x1="27" y1="44" x2="27" y2="56" stroke={CUT_STROKE} strokeWidth="1" />

        {/* Decorative seam line highlights */}
        <line x1="5" y1="17" x2="49" y2="17" stroke={CUT_STROKE_LIGHT} strokeWidth="0.8" strokeDasharray="3 2" />
        <line x1="5" y1="30" x2="49" y2="30" stroke={CUT_STROKE_LIGHT} strokeWidth="0.8" strokeDasharray="3 2" />
        <line x1="5" y1="43" x2="49" y2="43" stroke={CUT_STROKE_LIGHT} strokeWidth="0.8" strokeDasharray="3 2" />
      </g>

      {/* Crisp outer letter boundary stroke */}
      <path
        d="M 6 4 L 18 4 L 18 36 C 18 41 22 44 27 44 C 32 44 36 41 36 36 L 36 4 L 48 4 L 48 36 C 48 48 39 56 27 56 C 15 56 6 48 6 36 Z"
        fill="none"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Top highlight caps */}
      <path d="M 7 5 L 17 5 M 37 5 L 47 5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  </svg>
);

export const LetterD: React.FC = () => (
  <svg
    viewBox="0 0 54 60"
    className="h-7 sm:h-8 md:h-9 w-auto select-none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="d-spine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f6cb6e" />
        <stop offset="100%" stopColor="#d99b26" />
      </linearGradient>
      <linearGradient id="d-arc-top" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ebae3b" />
        <stop offset="100%" stopColor="#f6cb6e" />
      </linearGradient>
      <linearGradient id="d-arc-mid" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#d99b26" />
        <stop offset="100%" stopColor="#a67214" />
      </linearGradient>
      <linearGradient id="d-arc-bot" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a67214" />
        <stop offset="100%" stopColor="#7a5209" />
      </linearGradient>
    </defs>

    <g filter="url(#shadow-letter)">
      {/* Left straight vertical spine */}
      <path
        d="M 6 4 L 20 4 L 20 56 L 6 56 Z"
        fill="url(#d-spine)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Right radial sliced semicircle bowl */}
      {/* Top Sector */}
      <path
        d="M 20 4 C 36 4 48 14 48 25 L 20 30 Z"
        fill="url(#d-arc-top)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      {/* Middle Sector */}
      <path
        d="M 48 25 C 50 28 50 32 48 35 L 20 30 Z"
        fill="url(#d-arc-mid)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      {/* Bottom Sector */}
      <path
        d="M 48 35 C 48 46 36 56 20 56 L 20 30 Z"
        fill="url(#d-arc-bot)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Radial slice cut lines */}
      <line x1="20" y1="30" x2="44" y2="16" stroke={CUT_STROKE_LIGHT} strokeWidth="1" strokeDasharray="3 2" />
      <line x1="20" y1="30" x2="44" y2="44" stroke={CUT_STROKE_LIGHT} strokeWidth="1" strokeDasharray="3 2" />

      {/* Counter Hole */}
      <path
        d="M 18 16 L 25 16 C 33 16 38 22 38 30 C 38 38 33 44 25 44 L 18 44 Z"
        fill="#ffffff"
        className="dark:fill-zinc-950"
        stroke={CUT_STROKE}
        strokeWidth="1"
      />

      {/* Top highlight */}
      <path d="M 7 5 L 19 5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  </svg>
);

export const LetterG1: React.FC = () => (
  <svg
    viewBox="0 0 54 60"
    className="h-7 sm:h-8 md:h-9 w-auto select-none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="g1-top" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6ee7b7" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
      <linearGradient id="g1-mid" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="g1-bot" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="g1-bar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
    </defs>

    <g filter="url(#shadow-letter)">
      {/* 1. Top-Right Arm Terminal (Open throat of G) */}
      <path
        d="M 27 5 C 34 5 40 8 43 14 L 35 20 C 33 17 30 16 27 16 Z"
        fill="url(#g1-top)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* 2. Top-Left Arc */}
      <path
        d="M 27 5 C 16 5 7 15 7 30 L 18 30 C 18 21 21 16 27 16 Z"
        fill="url(#g1-top)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* 3. Bottom-Left Arc */}
      <path
        d="M 7 30 C 7 45 16 55 27 55 L 27 44 C 21 44 18 39 18 30 Z"
        fill="url(#g1-mid)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* 4. Bottom-Right Curve */}
      <path
        d="M 27 55 C 37 55 45 49 48 42 L 48 37 L 36 37 C 36 41 32 44 27 44 Z"
        fill="url(#g1-bot)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* 5. Inward Horizontal Crossbar & Vertical Spur (Distinct G Feature) */}
      <path
        d="M 48 26 L 48 38 L 25 38 L 25 26 Z"
        fill="url(#g1-bar)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Decorative Spur Vertical Cut & Diagonal Groove */}
      <line x1="36" y1="26" x2="36" y2="38" stroke={CUT_STROKE} strokeWidth="0.8" />
      <line x1="12" y1="18" x2="22" y2="10" stroke={CUT_STROKE_LIGHT} strokeWidth="1" strokeDasharray="3 2" />
      <line x1="12" y1="42" x2="22" y2="50" stroke={CUT_STROKE_LIGHT} strokeWidth="1" strokeDasharray="3 2" />

      {/* Top highlight arc */}
      <path d="M 12 10 C 16 7 21 5 27 5 C 33 5 38 7 42 12" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  </svg>
);

export const LetterE: React.FC = () => (
  <svg
    viewBox="0 0 50 60"
    className="h-7 sm:h-8 md:h-9 w-auto select-none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="e-spine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7baedc" />
        <stop offset="100%" stopColor="#3b6790" />
      </linearGradient>
      <linearGradient id="e-top" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#7baedc" />
        <stop offset="100%" stopColor="#5b8bb8" />
      </linearGradient>
      <linearGradient id="e-mid" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#4f7ea8" />
        <stop offset="100%" stopColor="#25486a" />
      </linearGradient>
      <linearGradient id="e-bot" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#3b6790" />
        <stop offset="100%" stopColor="#18324a" />
      </linearGradient>
    </defs>

    <g filter="url(#shadow-letter)">
      {/* Spine with diagonal faceted cuts */}
      <path
        d="M 6 4 L 18 4 L 18 24 L 6 30 Z"
        fill="url(#e-spine)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      <path
        d="M 6 30 L 18 24 L 18 56 L 6 56 Z"
        fill="url(#e-bot)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Top Bar with diagonal facet */}
      <path
        d="M 18 4 L 46 4 L 40 16 L 18 16 Z"
        fill="url(#e-top)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      {/* Mid Bar */}
      <path
        d="M 18 24 L 38 24 L 34 36 L 18 36 Z"
        fill="url(#e-mid)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      {/* Bottom Bar */}
      <path
        d="M 18 44 L 42 44 L 46 56 L 18 56 Z"
        fill="url(#e-bot)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Diagonal geometric facet cuts */}
      <line x1="6" y1="4" x2="40" y2="16" stroke={CUT_STROKE_LIGHT} strokeWidth="1" strokeDasharray="3 2" />
      <line x1="18" y1="44" x2="46" y2="56" stroke={CUT_STROKE_LIGHT} strokeWidth="1" strokeDasharray="3 2" />

      {/* Highlights */}
      <path d="M 7 5 L 44 5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  </svg>
);

export const LetterT: React.FC = () => (
  <svg
    viewBox="0 0 54 60"
    className="h-7 sm:h-8 md:h-9 w-auto select-none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="t-top-left" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f5aba0" />
        <stop offset="100%" stopColor="#e06a55" />
      </linearGradient>
      <linearGradient id="t-top-right" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#e06a55" />
        <stop offset="100%" stopColor="#b84733" />
      </linearGradient>
      <linearGradient id="t-stem-left" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#eb8573" />
        <stop offset="100%" stopColor="#e06a55" />
      </linearGradient>
      <linearGradient id="t-stem-right" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#b84733" />
        <stop offset="100%" stopColor="#872d1d" />
      </linearGradient>
    </defs>

    <g filter="url(#shadow-letter)">
      {/* Top Bar Left Half */}
      <path
        d="M 4 4 L 27 4 L 27 16 L 4 16 Z"
        fill="url(#t-top-left)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      {/* Top Bar Right Half */}
      <path
        d="M 27 4 L 50 4 L 50 16 L 27 16 Z"
        fill="url(#t-top-right)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Center Vertical Stem Left Half */}
      <path
        d="M 21 16 L 27 16 L 27 56 L 21 56 Z"
        fill="url(#t-stem-left)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      {/* Center Vertical Stem Right Half */}
      <path
        d="M 27 16 L 33 16 L 33 56 L 27 56 Z"
        fill="url(#t-stem-right)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Pill-shaped bevel detail in middle of stem like reference image */}
      <rect
        x="24.5"
        y="24"
        width="5"
        height="18"
        rx="2.5"
        fill="rgba(255, 255, 255, 0.22)"
        stroke={CUT_STROKE}
        strokeWidth="0.5"
      />

      {/* Top highlight bar */}
      <path d="M 5 5 L 49 5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  </svg>
);

export const LetterI: React.FC = () => (
  <svg
    viewBox="0 0 32 60"
    className="h-7 sm:h-8 md:h-9 w-auto select-none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="i-dot-top" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f6cb6e" />
        <stop offset="100%" stopColor="#ebae3b" />
      </linearGradient>
      <linearGradient id="i-dot-bot" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#d99b26" />
        <stop offset="100%" stopColor="#a67214" />
      </linearGradient>
      <linearGradient id="i-bar-top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ebae3b" />
        <stop offset="100%" stopColor="#d99b26" />
      </linearGradient>
      <linearGradient id="i-bar-bot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d99b26" />
        <stop offset="100%" stopColor="#7a5209" />
      </linearGradient>
    </defs>

    <g filter="url(#shadow-letter)">
      {/* Top Circular Dot (dividido como os círculos do calendário!) */}
      <path
        d="M 8 11 A 8 8 0 0 1 24 11 Z"
        fill="url(#i-dot-top)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      <path
        d="M 8 11 A 8 8 0 0 0 24 11 Z"
        fill="url(#i-dot-bot)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      <circle cx="16" cy="11" r="7.5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />

      {/* Bottom Segmented Vertical Bar */}
      <rect
        x="9"
        y="22"
        width="14"
        height="16"
        fill="url(#i-bar-top)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />
      <rect
        x="9"
        y="38"
        width="14"
        height="18"
        fill="url(#i-bar-bot)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Highlights */}
      <path d="M 10 23 L 22 23" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" />
    </g>
  </svg>
);

export const LetterN: React.FC = () => (
  <svg
    viewBox="0 0 54 60"
    className="h-7 sm:h-8 md:h-9 w-auto select-none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="n-left" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6ee7b7" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
      <linearGradient id="n-diag" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="n-right" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>

    <g filter="url(#shadow-letter)">
      {/* Left Vertical Pillar */}
      <path
        d="M 6 4 L 18 4 L 18 56 L 6 56 Z"
        fill="url(#n-left)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Diagonal Stroke */}
      <path
        d="M 18 4 L 36 38 L 36 56 L 18 20 Z"
        fill="url(#n-diag)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Right Vertical Pillar */}
      <path
        d="M 36 4 L 48 4 L 48 56 L 36 56 Z"
        fill="url(#n-right)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Textured Diagonal Facet Stripes across the diagonal (just like in reference image) */}
      <line x1="20" y1="12" x2="28" y2="28" stroke={CUT_STROKE_LIGHT} strokeWidth="1.2" />
      <line x1="24" y1="20" x2="32" y2="36" stroke={CUT_STROKE_LIGHT} strokeWidth="1.2" />
      <line x1="28" y1="28" x2="36" y2="44" stroke={CUT_STROKE_LIGHT} strokeWidth="1.2" />

      {/* Top highlights */}
      <path d="M 7 5 L 17 5 M 37 5 L 47 5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  </svg>
);

export const LetterG2: React.FC = () => (
  <svg
    viewBox="0 0 54 60"
    className="h-7 sm:h-8 md:h-9 w-auto select-none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* 4 cores do calendário: Coral (Saídas), Azul (Entradas), Ocre (A Pagar), Esmeralda (Caixinhas) */}
      <linearGradient id="cal-quad-coral" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f5aba0" />
        <stop offset="100%" stopColor="#e06a55" />
      </linearGradient>
      <linearGradient id="cal-quad-blue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5b8bb8" />
        <stop offset="100%" stopColor="#3b6790" />
      </linearGradient>
      <linearGradient id="cal-quad-ocre" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f6cb6e" />
        <stop offset="100%" stopColor="#d99b26" />
      </linearGradient>
      <linearGradient id="cal-quad-emerald" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
      <linearGradient id="cal-g2-bar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#eb8573" />
        <stop offset="100%" stopColor="#e06a55" />
      </linearGradient>
    </defs>

    <g filter="url(#shadow-letter)">
      {/* 1. Top-Right Arm Terminal: Coral (Saídas) - Com garganta aberta de G! */}
      <path
        d="M 27 5 C 34 5 40 8 43 14 L 35 20 C 33 17 30 16 27 16 Z"
        fill="url(#cal-quad-coral)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* 2. Top-Left Arc: Azul (Entradas) */}
      <path
        d="M 27 5 C 16 5 7 15 7 30 L 18 30 C 18 21 21 16 27 16 Z"
        fill="url(#cal-quad-blue)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* 3. Bottom-Left Arc: Ocre (A Pagar) */}
      <path
        d="M 7 30 C 7 45 16 55 27 55 L 27 44 C 21 44 18 39 18 30 Z"
        fill="url(#cal-quad-ocre)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* 4. Bottom-Right Curve: Esmeralda (Caixinhas) */}
      <path
        d="M 27 55 C 37 55 45 49 48 42 L 48 37 L 36 37 C 36 41 32 44 27 44 Z"
        fill="url(#cal-quad-emerald)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* 5. Inward Horizontal Crossbar & Vertical Spur (G Spur & Bar) */}
      <path
        d="M 48 26 L 48 38 L 25 38 L 25 26 Z"
        fill="url(#cal-g2-bar)"
        stroke={CUT_STROKE}
        strokeWidth="0.8"
      />

      {/* Divider between spur and crossbar */}
      <line x1="36" y1="26" x2="36" y2="38" stroke={CUT_STROKE} strokeWidth="0.8" />
      {/* Texture slice grooves */}
      <line x1="12" y1="18" x2="22" y2="10" stroke={CUT_STROKE_LIGHT} strokeWidth="1" strokeDasharray="3 2" />
      <line x1="12" y1="42" x2="22" y2="50" stroke={CUT_STROKE_LIGHT} strokeWidth="1" strokeDasharray="3 2" />

      {/* Highlight sheen */}
      <path d="M 12 10 C 16 7 21 5 27 5 C 33 5 38 7 42 12" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * BudgieBird
 * Australian green parakeet (periquito verde) that flies in, loops, and perches on 'G'.
 */
export const BudgieBird: React.FC<{
  isFlying: boolean;
  isPerched: boolean;
  isFlyingAway: boolean;
}> = ({ isFlying, isPerched, isFlyingAway }) => {
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
        className="w-full h-full filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bird-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="bird-head" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
          <linearGradient id="bird-wing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
        </defs>

        {/* Far Wing (Behind body, flapping in authentic 3D perspective during flight) */}
        {isFlying && (
          <g className="animate-[budgieFarWingFlap_0.13s_ease-in-out_infinite_alternate] origin-[34px_22px] opacity-85">
            <path
              d="M 28 20 C 26 10 32 3 38 1 C 41 8 40 18 34 22 Z"
              fill="#064e3b"
              stroke="#022c22"
              strokeWidth="0.8"
            />
            <path d="M 31 15 Q 36 12 37 4" stroke="#facc15" strokeWidth="1" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* 1. Long Slender Budgie Tail Feathers (hanging down naturally behind the letter) */}
        <path d="M 25 44 L 6 68 L 11 67 L 27 48 Z" fill="#047857" stroke="#064e3b" strokeWidth="0.8" />
        <path d="M 26 45 L 11 65 L 15 64 L 28 48 Z" fill="#0284c7" />

        {/* 2. Plump Aerodynamic Body */}
        <path
          d="M 22 24 C 20 33 24 45 33 47 C 42 49 46 38 44 26 C 42 19 30 18 22 24 Z"
          fill="url(#bird-body)"
          stroke="#065f46"
          strokeWidth="0.8"
        />
        {/* Soft belly curve */}
        <path
          d="M 27 26 C 25 35 29 44 36 46 C 42 47 45 39 44 28 Z"
          fill="#22c55e"
          opacity="0.6"
        />

        {/* 3. Sunny Yellow Head and Cheeks */}
        <circle cx="39" cy="18" r="11" fill="url(#bird-head)" stroke="#ca8a04" strokeWidth="0.7" />
        <path
          d="M 32 17 C 35 11 44 11 47 16 C 49 20 46 25 39 25 C 34 25 31 21 32 17 Z"
          fill="url(#bird-head)"
        />

        {/* Cheeks & Throat Spots */}
        <ellipse cx="38" cy="22" rx="2" ry="1.4" fill="#8b5cf6" />
        <circle cx="34" cy="24" r="0.8" fill="#18181b" />
        <circle cx="36" cy="25.2" r="0.8" fill="#18181b" />
        <circle cx="39" cy="24.4" r="0.8" fill="#18181b" />

        {/* 4. Beak & Cere */}
        <ellipse cx="47.5" cy="18.5" rx="2.2" ry="1.3" fill="#38bdf8" />
        <path
          d="M 47 19 C 51.5 19.5 52.5 22.5 48 24 C 46 23.5 46 20.5 47 19 Z"
          fill="#f59e0b"
          stroke="#b45309"
          strokeWidth="0.6"
        />

        {/* 5. Eye */}
        <circle cx="41" cy="16" r="2.2" fill="#18181b" />
        <circle cx="41.7" cy="15.3" r="0.8" fill="#ffffff" />

        {/* 6. Wing (flapping during flight, folded when perched) */}
        <g className={isFlying ? 'animate-[budgieWingFlap_0.13s_ease-in-out_infinite_alternate] origin-[32px_24px]' : ''}>
          <path
            d="M 26 23 C 22 32 23 42 29 45 C 34 40 37 32 36 23 Z"
            fill="url(#bird-wing)"
            stroke="#064e3b"
            strokeWidth="0.8"
          />
          <path d="M 26 28 Q 30 30 35 27" stroke="#facc15" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M 25 33 Q 30 35 34 31" stroke="#052e16" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M 26 38 Q 30 40 33 36" stroke="#facc15" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M 27 42 Q 29 43 32 40" stroke="#052e16" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        </g>

        {/* 7. Perching Feet & Claws (Visíveis o tempo todo, tanto em voo quanto ao pousar) */}
        <g id="budgie-perching-claws" className="opacity-100">
          {/* Sombra de contato diretamente contra o topo do 'G' (somente ao pousar) */}
          {isPerched && (
            <>
              <ellipse cx="31" cy="55.5" rx="5.5" ry="1.6" fill="rgba(0,0,0,0.32)" />
              <ellipse cx="42" cy="55.5" rx="5.5" ry="1.6" fill="rgba(0,0,0,0.32)" />
            </>
          )}

          {/* Soft green plumage feather puffs on lower thighs */}
          <path d="M 28 44 C 27 47 33 48 34 45 Z" fill="#10b981" stroke="#065f46" strokeWidth="0.6" />
          <path d="M 39 44 C 38 47 44 48 45 45 Z" fill="#10b981" stroke="#065f46" strokeWidth="0.6" />

          {/* Scaled parakeet legs (tarsus) */}
          <line x1="31" y1="45" x2="31" y2="51" stroke="#71717a" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="42" y1="45" x2="42" y2="51" stroke="#71717a" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="31" y1="46" x2="31" y2="50" stroke="#d4d4d8" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="42" y1="46" x2="42" y2="50" stroke="#d4d4d8" strokeWidth="1.2" strokeLinecap="round" />

          {/* Back toes wrapped around the rear of the arch */}
          <path d="M 30 50 C 27 51 26 53 27 54.5" stroke="#52525b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 43 50 C 46 51 47 53 46 54.5" stroke="#52525b" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Left Foot - 3 Front Toes tightly grasping over the top edge of 'G' */}
          {/* Left inner toe */}
          <path d="M 28 50 C 26 52 26 54.5 27 57" stroke="#71717a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="26.5" cy="53.5" r="0.8" fill="#d4d4d8" />
          <path d="M 27 57 L 28 58.5" stroke="#27272a" strokeWidth="1.6" strokeLinecap="round" />

          {/* Left middle toe (dominant grasping center toe) */}
          <path d="M 31 50 C 31 52.5 31 55 31.5 58" stroke="#71717a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <circle cx="31" cy="53.5" r="0.9" fill="#d4d4d8" />
          <path d="M 31.5 58 L 32 59.5" stroke="#27272a" strokeWidth="1.7" strokeLinecap="round" />

          {/* Left outer toe */}
          <path d="M 34 50 C 34.5 52 35 54.5 34.5 57" stroke="#71717a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="34.6" cy="53.5" r="0.8" fill="#d4d4d8" />
          <path d="M 34.5 57 L 34 58.5" stroke="#27272a" strokeWidth="1.6" strokeLinecap="round" />

          {/* Right Foot - 3 Front Toes tightly grasping over the top edge of 'G' */}
          {/* Right inner toe */}
          <path d="M 39 50 C 38.5 52 38 54.5 38.5 57" stroke="#71717a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="38.4" cy="53.5" r="0.8" fill="#d4d4d8" />
          <path d="M 38.5 57 L 39 58.5" stroke="#27272a" strokeWidth="1.6" strokeLinecap="round" />

          {/* Right middle toe (dominant grasping center toe) */}
          <path d="M 42 50 C 42 52.5 42 55 42.5 58" stroke="#71717a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <circle cx="42" cy="53.5" r="0.9" fill="#d4d4d8" />
          <path d="M 42.5 58 L 43 59.5" stroke="#27272a" strokeWidth="1.7" strokeLinecap="round" />

          {/* Right outer toe */}
          <path d="M 45 50 C 47 52 47 54.5 46 57" stroke="#71717a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="46.5" cy="53.5" r="0.8" fill="#d4d4d8" />
          <path d="M 46 57 L 45 58.5" stroke="#27272a" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

const INTRO_STORAGE_KEY = 'budgeting_chaotic_intro_seen_v1';

export interface BudgetingLogoProps {
  className?: string;
  onLoweredChange?: (isLowered: boolean) => void;
  isSketchMode?: boolean;
  isDark?: boolean;
}

export const BudgetingLogo: React.FC<BudgetingLogoProps> = ({
  className = '',
  onLoweredChange,
  isSketchMode = false,
  isDark = false,
}) => {
  // Executa exclusivamente no primeiro acesso do usuário
  const [isFirstAccess, setIsFirstAccess] = useState<boolean>(() => {
    try {
      const seen = localStorage.getItem(INTRO_STORAGE_KEY);
      return !seen;
    } catch {
      return false;
    }
  });

  const [replayKey, setReplayKey] = useState(0);

  // Palavra exibida: 'budgeting' ou 'budgie'
  const [displayWord, setDisplayWord] = useState<'budgeting' | 'budgie'>('budgeting');

  // Estado da transição entre Budgeting e Budgie
  const [transitionState, setTransitionState] = useState<
    'none' | 'dropping_to_budgie' | 'plunging_to_budgeting'
  >('none');

  // Estado do periquito em 'budgie': 'idle' | 'flying' | 'perched' | 'flying_away'
  const [budgieEasterEggState, setBudgieEasterEggState] = useState<
    'idle' | 'flying' | 'perched' | 'flying_away'
  >('idle');

  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef<number>(0);
  const flightTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isFirstAccess) {
      try {
        localStorage.setItem(INTRO_STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
      // Garante que a animação inicial de entrada pela esquerda expira após tocar uma vez
      const timer = setTimeout(() => {
        setIsFirstAccess(false);
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [isFirstAccess]);

  // Limpeza de timers ao desmontar
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (flightTimerRef.current) clearTimeout(flightTimerRef.current);
    };
  }, []);

  // Manipulador de duplo clique
  const handleDoubleClick = () => {
    if (displayWord === 'budgeting') {
      // Duplo clique em 'Budgeting' -> T, N, G caem da tela e E, I se reorganizam para formar 'Budgie'
      setIsFirstAccess(false);
      setTransitionState('dropping_to_budgie');
      setTimeout(() => {
        setDisplayWord('budgie');
        setTransitionState('none');
        setBudgieEasterEggState('idle');
      }, 1450);
    } else {
      // Duplo clique em 'Budgie' -> APENAS as letras voltam para seus devidos lugares
      // Desativa rigorosamente qualquer animação de entrada de letras pela esquerda
      if (flightTimerRef.current) clearTimeout(flightTimerRef.current);
      setIsFirstAccess(false);
      setBudgieEasterEggState('idle');
      setDisplayWord('budgeting');
      setTransitionState('plunging_to_budgeting');
      setTimeout(() => {
        setIsFirstAccess(false);
        setTransitionState('none');
      }, 1400);
    }
  };

  // Manipulador de clique simples
  const handleSingleClick = () => {
    if (displayWord === 'budgie') {
      if (budgieEasterEggState === 'idle') {
        // Inicia o voo com exatamente 3 voltas dinâmicas por toda a tela antes de pousar
        setBudgieEasterEggState('flying');
        if (flightTimerRef.current) clearTimeout(flightTimerRef.current);
        flightTimerRef.current = setTimeout(() => {
          // Pouso suave e agarre firme sobre o cume da letra G
          setBudgieEasterEggState('perched');
        }, 5380);
      } else if (budgieEasterEggState === 'perched') {
        // Volta ao 'Budgie' original sem o periquito, que alça voo e vai embora
        setBudgieEasterEggState('flying_away');
        if (flightTimerRef.current) clearTimeout(flightTimerRef.current);
        flightTimerRef.current = setTimeout(() => {
          setBudgieEasterEggState('idle');
        }, 1180);
      }
    } else {
      // Em Budgeting: rever a animação orgânica inicial
      setIsFirstAccess(true);
      setReplayKey((k) => k + 1);
    }
  };

  // Distingue com precisão estrita clique simples de duplo clique
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        handleSingleClick();
      }, 320);
    } else if (clickCountRef.current >= 2) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      clickCountRef.current = 0;
      handleDoubleClick();
    }
  };

  const B: React.FC = () => (isSketchMode ? <SketchLetterB isDark={isDark} /> : <LetterB />);
  const U: React.FC = () => (isSketchMode ? <SketchLetterU isDark={isDark} /> : <LetterU />);
  const D: React.FC = () => (isSketchMode ? <SketchLetterD isDark={isDark} /> : <LetterD />);
  const G1: React.FC = () => (isSketchMode ? <SketchLetterG1 isDark={isDark} /> : <LetterG1 />);
  const E: React.FC = () => (isSketchMode ? <SketchLetterE isDark={isDark} /> : <LetterE />);
  const T: React.FC = () => (isSketchMode ? <SketchLetterT isDark={isDark} /> : <LetterT />);
  const I: React.FC = () => (isSketchMode ? <SketchLetterI isDark={isDark} /> : <LetterI />);
  const N: React.FC = () => (isSketchMode ? <SketchLetterN isDark={isDark} /> : <LetterN />);
  const G2: React.FC = () => (isSketchMode ? <SketchLetterG2 isDark={isDark} /> : <LetterG2 />);
  const Bird: React.FC<any> = (props) => (isSketchMode ? <SketchBudgieBird isDark={isDark} {...props} /> : <BudgieBird {...props} />);

  const initialLetters = [
    { id: 'b', Component: B, anim: 'organicStumble1', delay: '0.00s' },
    { id: 'u', Component: U, anim: 'organicStumble2', delay: '0.08s' },
    { id: 'd', Component: D, anim: 'organicStumble3', delay: '0.16s' },
    { id: 'g1', Component: G1, anim: 'organicStumble1', delay: '0.24s' },
    { id: 'e', Component: E, anim: 'organicStumble4', delay: '0.32s' },
    { id: 't', Component: T, anim: 'organicStumble2', delay: '0.40s' },
    { id: 'i', Component: I, anim: 'organicStumble3', delay: '0.48s' },
    { id: 'n', Component: N, anim: 'organicStumble1', delay: '0.56s' },
    { id: 'g2', Component: G2, anim: 'organicStumble4', delay: '0.64s' },
  ];

  const isTitleLowered = budgieEasterEggState === 'perched';

  useEffect(() => {
    onLoweredChange?.(isTitleLowered);
  }, [isTitleLowered, onLoweredChange]);

  return (
    <div
      key={replayKey}
      onClick={handleClick}
      className={`inline-flex items-center gap-[1px] sm:gap-[2.5px] select-none opacity-85 dark:opacity-100 hover:opacity-100 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)] hover:scale-[1.015] cursor-pointer ${className}`}
      aria-label={displayWord === 'budgie' ? 'Budgie' : 'Budgeting'}
      title={
        displayWord === 'budgie'
          ? isTitleLowered
            ? 'Clique para o periquito voar embora. Duplo clique para voltar a Budgeting.'
            : 'Clique para chamar o periquito! Duplo clique para voltar a Budgeting.'
          : 'Duplo clique para transformar em Budgie!'
      }
    >
        {/* Renderização condicional conforme o modo e estado de transição */}
        {displayWord === 'budgeting' && transitionState === 'none' ? (
          // 1. TÍTULO ORIGINAL "BUDGETING"
          initialLetters.map(({ id, Component, anim, delay }) => (
            <span
              key={id}
              className="inline-flex items-center justify-center shrink-0 origin-bottom"
              style={
                isFirstAccess
                  ? {
                      animation: `${anim} 1.85s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay} both`,
                      transformOrigin: '50% 90%',
                      willChange: 'transform, opacity',
                    }
                  : undefined
              }
            >
              <Component />
            </span>
          ))
        ) : transitionState === 'dropping_to_budgie' ? (
          // 2. TRANSIÇÃO: T, N, G caem da tela enquanto E e I se reorganizam
          <>
            <span className="inline-flex items-center justify-center shrink-0"><B /></span>
            <span className="inline-flex items-center justify-center shrink-0"><U /></span>
            <span className="inline-flex items-center justify-center shrink-0"><D /></span>
            <span className="inline-flex items-center justify-center shrink-0"><G1 /></span>
            {/* E desliza para a direita */}
            <span
              className="inline-flex items-center justify-center shrink-0"
              style={{ animation: 'letterSwapE 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) both' }}
            >
              <E />
            </span>
            {/* T despenca para o fundo da tela e contrai a largura naturalmente */}
            <span
              className="inline-flex items-center justify-center shrink-0 overflow-visible"
              style={{
                animation: 'letterCollapseAndFall 1.35s cubic-bezier(0.4, 0, 0.2, 1) 0.04s both',
                willChange: 'transform, opacity, max-width',
              }}
            >
              <T />
            </span>
            {/* I salta por cima para a esquerda */}
            <span
              className="inline-flex items-center justify-center shrink-0"
              style={{ animation: 'letterSwapI 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) both' }}
            >
              <I />
            </span>
            {/* N despenca para o fundo da tela */}
            <span
              className="inline-flex items-center justify-center shrink-0 overflow-visible"
              style={{
                animation: 'letterCollapseAndFall 1.35s cubic-bezier(0.4, 0, 0.2, 1) 0.14s both',
                willChange: 'transform, opacity, max-width',
              }}
            >
              <N />
            </span>
            {/* G final despenca para o fundo da tela */}
            <span
              className="inline-flex items-center justify-center shrink-0 overflow-visible"
              style={{
                animation: 'letterCollapseAndFall 1.35s cubic-bezier(0.4, 0, 0.2, 1) 0.24s both',
                willChange: 'transform, opacity, max-width',
              }}
            >
              <G2 />
            </span>
          </>
        ) : transitionState === 'plunging_to_budgeting' ? (
          // 3. TRANSIÇÃO: T, N, G despencam do alto de volta para "Budgeting"
          <>
            <span className="inline-flex items-center justify-center shrink-0"><B /></span>
            <span className="inline-flex items-center justify-center shrink-0"><U /></span>
            <span className="inline-flex items-center justify-center shrink-0"><D /></span>
            <span className="inline-flex items-center justify-center shrink-0"><G1 /></span>
            {/* E retorna ao seu lugar à esquerda */}
            <span
              className="inline-flex items-center justify-center shrink-0"
              style={{ animation: 'letterReturnE 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) both' }}
            >
              <E />
            </span>
            {/* T despenca do alto */}
            <span
              className="inline-flex items-center justify-center shrink-0 overflow-visible"
              style={{
                animation: 'letterPlungeFromSky 1.25s cubic-bezier(0.2, 0.9, 0.3, 1) 0.04s both',
                willChange: 'transform, opacity, max-width',
              }}
            >
              <T />
            </span>
            {/* I retorna ao seu lugar à direita */}
            <span
              className="inline-flex items-center justify-center shrink-0"
              style={{ animation: 'letterReturnI 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) both' }}
            >
              <I />
            </span>
            {/* N despenca do alto */}
            <span
              className="inline-flex items-center justify-center shrink-0 overflow-visible"
              style={{
                animation: 'letterPlungeFromSky 1.25s cubic-bezier(0.2, 0.9, 0.3, 1) 0.14s both',
                willChange: 'transform, opacity, max-width',
              }}
            >
              <N />
            </span>
            {/* G2 despenca do alto */}
            <span
              className="inline-flex items-center justify-center shrink-0 overflow-visible"
              style={{
                animation: 'letterPlungeFromSky 1.25s cubic-bezier(0.2, 0.9, 0.3, 1) 0.24s both',
                willChange: 'transform, opacity, max-width',
              }}
            >
              <G2 />
            </span>
          </>
        ) : (
          // 4. PALAVRA "BUDGIE" (B - U - D - G/$ - I - E)
          <>
            <span className="inline-flex items-center justify-center shrink-0"><B /></span>
            <span className="inline-flex items-center justify-center shrink-0"><U /></span>
            <span className="inline-flex items-center justify-center shrink-0"><D /></span>

            {/* Letra G de Budgie + Periquito (em modo normal ou sketch feito a mão) */}
            <div className="relative inline-flex items-center justify-center shrink-0 overflow-visible">
              <span className="inline-flex items-center justify-center">
                <G1 />
              </span>

              {/* Animação do periquito: voando em 3 voltas pela tela, pousado ou voando embora */}
              {budgieEasterEggState !== 'idle' && (
                <Bird
                  isFlying={budgieEasterEggState === 'flying'}
                  isPerched={budgieEasterEggState === 'perched'}
                  isFlyingAway={budgieEasterEggState === 'flying_away'}
                />
              )}
            </div>

            <span className="inline-flex items-center justify-center shrink-0"><I /></span>
            <span className="inline-flex items-center justify-center shrink-0"><E /></span>
          </>
        )}
      </div>
  );
};
