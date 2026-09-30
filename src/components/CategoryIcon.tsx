import React from 'react';
import {
  Utensils,
  Home,
  Car,
  ShoppingBag,
  ShoppingCart,
  Receipt,
  Coffee,
  HeartPulse,
  BookOpen,
  Briefcase,
  Laptop,
  TrendingUp,
  Tag,
  DollarSign,
  Palmtree,
  Gift,
  Coins,
} from 'lucide-react';

interface CategoryIconProps {
  icon: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, className = 'w-4 h-4' }) => {
  switch (icon) {
    case 'Utensils':
      return <Utensils className={className} />;
    case 'ShoppingCart':
      return <ShoppingCart className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Receipt':
      return <Receipt className={className} />;
    case 'Coffee':
      return <Coffee className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Palmtree':
      return <Palmtree className={className} />;
    case 'Gift':
      return <Gift className={className} />;
    case 'Coins':
      return <Coins className={className} />;
    case 'Laptop':
      return <Laptop className={className} />;
    case 'TrendingUp':
      return <TrendingUp className={className} />;
    case 'DollarSign':
      return <DollarSign className={className} />;
    default:
      return <Tag className={className} />;
  }
};
