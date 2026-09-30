import React from 'react';

// Importa os avatares nativos embutidos diretamente no código-fonte como Data URLs Base64
import { NATIVE_AVATAR_DATA_URLS } from './avatarAssets.ts';

export interface AvatarItem {
  id: string;
  name: string;
  image: string;
  render: (className?: string) => React.ReactNode;
}

/**
 * Avatar padrão (silhueta neutra)
 */
export const DefaultEmptyAvatar: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Foto de perfil padrão"
  >
    <circle cx="50" cy="50" r="50" className="fill-zinc-200 dark:fill-zinc-700" />
    <circle cx="50" cy="38" r="17" className="fill-zinc-400 dark:fill-zinc-500" />
    <path
      d="M19 86C19 69 33 60 50 60C67 60 81 69 81 86C81 90 77 94 72 94H28C23 94 19 90 19 86Z"
      className="fill-zinc-400 dark:fill-zinc-500"
    />
  </svg>
);

/**
 * Retorna a imagem nativa do avatar a partir do seu ID em Base64
 */
export function getAvatarSrc(id: string): string {
  return NATIVE_AVATAR_DATA_URLS[id] || '';
}

/**
 * Lista dos 9 avatares nativos fixados na estrutura do aplicativo (100% portáteis via Base64)
 */
export const AVATARS: AvatarItem[] = [
  {
    id: '1',
    name: 'Avatar 1',
    image: NATIVE_AVATAR_DATA_URLS['1'] || '',
    render: (className = 'w-full h-full') => (
      <img
        src={NATIVE_AVATAR_DATA_URLS['1'] || ''}
        alt="Avatar 1"
        className={`${className} object-cover rounded-full select-none`}
        draggable={false}
        loading="eager"
      />
    ),
  },
  {
    id: '2',
    name: 'Avatar 2',
    image: NATIVE_AVATAR_DATA_URLS['2'] || '',
    render: (className = 'w-full h-full') => (
      <img
        src={NATIVE_AVATAR_DATA_URLS['2'] || ''}
        alt="Avatar 2"
        className={`${className} object-cover rounded-full select-none`}
        draggable={false}
        loading="eager"
      />
    ),
  },
  {
    id: '3',
    name: 'Avatar 3',
    image: NATIVE_AVATAR_DATA_URLS['3'] || '',
    render: (className = 'w-full h-full') => (
      <img
        src={NATIVE_AVATAR_DATA_URLS['3'] || ''}
        alt="Avatar 3"
        className={`${className} object-cover rounded-full select-none`}
        draggable={false}
        loading="eager"
      />
    ),
  },
  {
    id: '4',
    name: 'Avatar 4',
    image: NATIVE_AVATAR_DATA_URLS['4'] || '',
    render: (className = 'w-full h-full') => (
      <img
        src={NATIVE_AVATAR_DATA_URLS['4'] || ''}
        alt="Avatar 4"
        className={`${className} object-cover rounded-full select-none`}
        draggable={false}
        loading="eager"
      />
    ),
  },
  {
    id: '5',
    name: 'Avatar 5',
    image: NATIVE_AVATAR_DATA_URLS['5'] || '',
    render: (className = 'w-full h-full') => (
      <img
        src={NATIVE_AVATAR_DATA_URLS['5'] || ''}
        alt="Avatar 5"
        className={`${className} object-cover rounded-full select-none`}
        draggable={false}
        loading="eager"
      />
    ),
  },
  {
    id: '6',
    name: 'Avatar 6',
    image: NATIVE_AVATAR_DATA_URLS['6'] || '',
    render: (className = 'w-full h-full') => (
      <img
        src={NATIVE_AVATAR_DATA_URLS['6'] || ''}
        alt="Avatar 6"
        className={`${className} object-cover rounded-full select-none`}
        draggable={false}
        loading="eager"
      />
    ),
  },
  {
    id: '7',
    name: 'Avatar 7',
    image: NATIVE_AVATAR_DATA_URLS['7'] || '',
    render: (className = 'w-full h-full') => (
      <img
        src={NATIVE_AVATAR_DATA_URLS['7'] || ''}
        alt="Avatar 7"
        className={`${className} object-cover rounded-full select-none`}
        draggable={false}
        loading="eager"
      />
    ),
  },
  {
    id: '8',
    name: 'Avatar 8',
    image: NATIVE_AVATAR_DATA_URLS['8'] || '',
    render: (className = 'w-full h-full') => (
      <img
        src={NATIVE_AVATAR_DATA_URLS['8'] || ''}
        alt="Avatar 8"
        className={`${className} object-cover rounded-full select-none`}
        draggable={false}
        loading="eager"
      />
    ),
  },
  {
    id: '9',
    name: 'Avatar 9',
    image: NATIVE_AVATAR_DATA_URLS['9'] || '',
    render: (className = 'w-full h-full') => (
      <img
        src={NATIVE_AVATAR_DATA_URLS['9'] || ''}
        alt="Avatar 9"
        className={`${className} object-cover rounded-full select-none`}
        draggable={false}
        loading="eager"
      />
    ),
  },
];

export function getAvatarById(id?: string | null): AvatarItem | undefined {
  if (!id) return undefined;
  return AVATARS.find((a) => a.id === id);
}
