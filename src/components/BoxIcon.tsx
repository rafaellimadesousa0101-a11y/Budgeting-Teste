import React from 'react';
import {
  Plane,
  Home,
  Umbrella,
  Palmtree,
  Car,
  Plus,
  HeartPulse,
  Cross,
  Hammer,
  Paintbrush,
  GraduationCap,
  Laptop,
  Smartphone,
  Heart,
  ShieldCheck,
  TrendingUp,
  Gift,
  ShoppingBag,
  PiggyBank,
  Wrench,
  Baby,
  Sparkles,
  Building,
  LandPlot,
  Trees,
  Tractor,
  Armchair,
  Bed,
  Palette,
  Waves,
  Castle,
  Warehouse,
  Truck,
  Ship,
  Caravan,
  Bike,
  Luggage,
  BookOpen,
  Languages,
  Briefcase,
  Store,
  Stethoscope,
  Mic,
  Cog,
  Lightbulb,
  Package,
  Code,
  Gamepad2,
  Camera,
  Tablet,
  Tv,
  Projector,
  Speaker,
  Cpu,
  Glasses,
  Syringe,
  Smile,
  Activity,
  Cake,
  PartyPopper,
  Compass,
  Binoculars,
  Music,
  Trophy,
  Sun,
  Key,
  Award,
  Coins,
  Wallet,
  Bitcoin,
  CircleDollarSign,
  Guitar,
  Gem,
  Watch,
  Shirt,
  Footprints,
  Dumbbell,
  Fish,
  Wind,
  Mountain,
  Tent,
  Disc,
  Dog,
  Cat,
  RotateCcw,
  Beer,
  Wine,
  Star,
  Coffee,
  Utensils,
  Pizza,
  CookingPot,
  Salad,
  Apple,
  Flame,
  Shield,
  Scale,
  Gavel,
  Landmark,
  CreditCard,
  Receipt,
  Target,
  Medal,
  Zap,
  BatteryCharging,
  PaintBucket,
  Flower2,
  Sprout,
  Lock,
  Clapperboard,
  Film,
  Drama,
  Dice5,
  ToyBrick,
  Puzzle,
  PenTool,
  Church,
  Sunrise,
  Scissors,
  Eye,
  Crown,
  Bird,
  Rabbit,
  Sailboat,
  Anchor,
  Map,
  Navigation,
  Server,
  Printer,
  Wifi,
  HardDrive,
  Flag,
  TreePine,
  Ghost,
  BadgePercent,
  Candy,
} from 'lucide-react';

interface BoxIconProps {
  icon: string;
  className?: string;
}

// Clean inline SVG for Motorcycle (matching Lucide 2px stroke style)
export const MotorcycleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Wheels */}
    <circle cx="5" cy="17" r="3" />
    <circle cx="19" cy="17" r="3" />
    {/* Chassis & Fork */}
    <path d="M5 17h4l4-6h4l2 3h-4" />
    <path d="M15 7l-2 4" />
    <path d="M13 7h4" />
    {/* Handlebar */}
    <circle cx="17" cy="6" r="0.5" />
    <path d="M12 11l-3 6" />
    {/* Seat */}
    <path d="M9 13h3" />
  </svg>
);

// Clean inline SVG for Medical Cross (+)
export const MedicalCrossIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 5v14M5 12h14" />
    <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="2" />
  </svg>
);

export const BoxIcon: React.FC<BoxIconProps> = ({ icon, className = 'w-5 h-5' }) => {
  switch (icon) {
    case 'Plane':
    case 'viagem':
      return <Plane className={className} />;
    case 'Home':
    case 'casa':
      return <Home className={className} />;
    case 'Umbrella':
    case 'Palmtree':
    case 'ferias':
      return <Palmtree className={className} />;
    case 'Motorcycle':
    case 'moto':
      return <MotorcycleIcon className={className} />;
    case 'Car':
    case 'carro':
      return <Car className={className} />;
    case 'Plus':
    case 'Cross':
    case 'saude':
      return <MedicalCrossIcon className={className} />;
    case 'Hammer':
    case 'construcao':
    case 'obra':
      return <Hammer className={className} />;
    case 'Paintbrush':
    case 'pintura':
      return <Paintbrush className={className} />;
    case 'GraduationCap':
    case 'educacao':
      return <GraduationCap className={className} />;
    case 'Laptop':
    case 'tech':
      return <Laptop className={className} />;
    case 'Smartphone':
    case 'celular':
      return <Smartphone className={className} />;
    case 'Heart':
    case 'casamento':
      return <Heart className={className} />;
    case 'ShieldCheck':
    case 'reserva':
      return <ShieldCheck className={className} />;
    case 'TrendingUp':
    case 'investimento':
      return <TrendingUp className={className} />;
    case 'Gift':
    case 'presente':
      return <Gift className={className} />;
    case 'ShoppingBag':
    case 'compras':
      return <ShoppingBag className={className} />;
    case 'Baby':
    case 'filho':
      return <Baby className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Building':
      return <Building className={className} />;
    case 'LandPlot':
      return <LandPlot className={className} />;
    case 'Trees':
      return <Trees className={className} />;
    case 'Tractor':
      return <Tractor className={className} />;
    case 'Armchair':
      return <Armchair className={className} />;
    case 'Bed':
      return <Bed className={className} />;
    case 'Palette':
      return <Palette className={className} />;
    case 'Waves':
      return <Waves className={className} />;
    case 'Castle':
      return <Castle className={className} />;
    case 'Warehouse':
      return <Warehouse className={className} />;
    case 'Truck':
      return <Truck className={className} />;
    case 'Ship':
      return <Ship className={className} />;
    case 'Caravan':
      return <Caravan className={className} />;
    case 'Bike':
      return <Bike className={className} />;
    case 'Luggage':
      return <Luggage className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Languages':
      return <Languages className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Store':
      return <Store className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'Mic':
      return <Mic className={className} />;
    case 'Cog':
      return <Cog className={className} />;
    case 'Lightbulb':
      return <Lightbulb className={className} />;
    case 'Package':
      return <Package className={className} />;
    case 'Code':
      return <Code className={className} />;
    case 'Gamepad2':
      return <Gamepad2 className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'Tablet':
      return <Tablet className={className} />;
    case 'Tv':
      return <Tv className={className} />;
    case 'Projector':
      return <Projector className={className} />;
    case 'Speaker':
      return <Speaker className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Glasses':
      return <Glasses className={className} />;
    case 'Syringe':
      return <Syringe className={className} />;
    case 'Smile':
      return <Smile className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Cake':
      return <Cake className={className} />;
    case 'PartyPopper':
      return <PartyPopper className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Binoculars':
      return <Binoculars className={className} />;
    case 'Music':
      return <Music className={className} />;
    case 'Trophy':
      return <Trophy className={className} />;
    case 'Sun':
      return <Sun className={className} />;
    case 'Key':
      return <Key className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Coins':
      return <Coins className={className} />;
    case 'Wallet':
      return <Wallet className={className} />;
    case 'Bitcoin':
      return <Bitcoin className={className} />;
    case 'CircleDollarSign':
      return <CircleDollarSign className={className} />;
    case 'Guitar':
      return <Guitar className={className} />;
    case 'Gem':
      return <Gem className={className} />;
    case 'Watch':
      return <Watch className={className} />;
    case 'Shirt':
      return <Shirt className={className} />;
    case 'Footprints':
      return <Footprints className={className} />;
    case 'Dumbbell':
      return <Dumbbell className={className} />;
    case 'Fish':
      return <Fish className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'Mountain':
      return <Mountain className={className} />;
    case 'Tent':
      return <Tent className={className} />;
    case 'Disc':
      return <Disc className={className} />;
    case 'Dog':
      return <Dog className={className} />;
    case 'Cat':
      return <Cat className={className} />;
    case 'RotateCcw':
      return <RotateCcw className={className} />;
    case 'Beer':
      return <Beer className={className} />;
    case 'Wine':
      return <Wine className={className} />;
    case 'Star':
      return <Star className={className} />;
    case 'Coffee':
      return <Coffee className={className} />;
    case 'Utensils':
      return <Utensils className={className} />;
    case 'Pizza':
      return <Pizza className={className} />;
    case 'CookingPot':
      return <CookingPot className={className} />;
    case 'Salad':
      return <Salad className={className} />;
    case 'Apple':
      return <Apple className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'Scale':
      return <Scale className={className} />;
    case 'Gavel':
      return <Gavel className={className} />;
    case 'Landmark':
      return <Landmark className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Receipt':
      return <Receipt className={className} />;
    case 'Target':
      return <Target className={className} />;
    case 'Medal':
      return <Medal className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'BatteryCharging':
      return <BatteryCharging className={className} />;
    case 'PaintBucket':
      return <PaintBucket className={className} />;
    case 'Flower2':
      return <Flower2 className={className} />;
    case 'Sprout':
      return <Sprout className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    case 'Clapperboard':
      return <Clapperboard className={className} />;
    case 'Film':
      return <Film className={className} />;
    case 'Drama':
      return <Drama className={className} />;
    case 'Dice5':
      return <Dice5 className={className} />;
    case 'ToyBrick':
      return <ToyBrick className={className} />;
    case 'Puzzle':
      return <Puzzle className={className} />;
    case 'PenTool':
      return <PenTool className={className} />;
    case 'Church':
      return <Church className={className} />;
    case 'Sunrise':
      return <Sunrise className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'Eye':
      return <Eye className={className} />;
    case 'Crown':
      return <Crown className={className} />;
    case 'Bird':
      return <Bird className={className} />;
    case 'Rabbit':
      return <Rabbit className={className} />;
    case 'Sailboat':
      return <Sailboat className={className} />;
    case 'Anchor':
      return <Anchor className={className} />;
    case 'Map':
      return <Map className={className} />;
    case 'Navigation':
      return <Navigation className={className} />;
    case 'Server':
      return <Server className={className} />;
    case 'Printer':
      return <Printer className={className} />;
    case 'Wifi':
      return <Wifi className={className} />;
    case 'HardDrive':
      return <HardDrive className={className} />;
    case 'Flag':
      return <Flag className={className} />;
    case 'TreePine':
      return <TreePine className={className} />;
    case 'Ghost':
      return <Ghost className={className} />;
    case 'BadgePercent':
      return <BadgePercent className={className} />;
    case 'Candy':
      return <Candy className={className} />;
    default:
      return <PiggyBank className={className} />;
  }
};

/**
 * Helper to detect icon based on keywords in custom category name or description
 */
export function detectIconFromText(text: string): { icon: string; matchedLabel: string } {
  if (!text || !text.trim()) return { icon: 'PiggyBank', matchedLabel: 'Caixinha Geral' };

  const n = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const has = (regex: RegExp) => regex.test(n);

  if (has(/\b(oculos\s*vr|oculosvr|vr|meta\s*quest|oculus|realidade\s*virtual|apple\s*vision)\b/)) {
    return { icon: 'Glasses', matchedLabel: 'Óculos VR' };
  }
  if (has(/\b(silicone|lipo|lipoaspiracao|lipo\s*lad|cirurgia|operacao|protese|rinoplastia|mamoplastia)\b/)) {
    return { icon: 'Syringe', matchedLabel: 'Cirurgia / Procedimento' };
  }
  if (has(/\b(odontologia|odonto|dentista|dente|dentes|aparelho|aparelho\s*dental|aparelho\s*ortodontico|clareamento)\b/)) {
    return { icon: 'Smile', matchedLabel: 'Odontologia' };
  }
  if (has(/\b(tratamento|terapia|fisioterapia|psicolog|psicanalise|psiquiatr)\b/)) {
    return { icon: 'Activity', matchedLabel: 'Tratamento / Terapia' };
  }
  if (has(/\b(tatuagem|tattoo|estetica|botox|harmonizacao|preenchimento|skincare|peeling)\b/)) {
    return { icon: 'Sparkles', matchedLabel: 'Estética / Tatuagem' };
  }
  if (has(/\b(saude|emergencia|reserva|medico|hospital|remedio)\b/)) {
    return { icon: 'HeartPulse', matchedLabel: 'Saúde / Reserva' };
  }
  if (has(/\b(apartamento|apto|kitnet|studio|cobertura|duplex)\b/) || (has(/\bap\b/) && !has(/\baparelho\b/))) {
    return { icon: 'Building', matchedLabel: 'Apartamento' };
  }
  if (has(/\b(terreno|lote|loteamento)\b/)) {
    return { icon: 'LandPlot', matchedLabel: 'Terreno' };
  }
  if (has(/\b(sitio|chacara)\b/)) {
    return { icon: 'Trees', matchedLabel: 'Sítio / Chácara' };
  }
  if (has(/\b(fazendinha|fazenda|trator|gado|rebanho|boi|vaca)\b/)) {
    return { icon: 'Tractor', matchedLabel: 'Fazenda / Agro' };
  }
  if (has(/\b(construcao|construir|obra|tijolo|cimento)\b/)) {
    return { icon: 'Hammer', matchedLabel: 'Construção' };
  }
  if (has(/\b(reforma|reformar)\b/)) {
    return { icon: 'Wrench', matchedLabel: 'Reforma' };
  }
  if (has(/\b(mobilia|moveis|movel|sofa|poltrona|armario)\b/)) {
    return { icon: 'Armchair', matchedLabel: 'Mobília' };
  }
  if (has(/\b(enxoval|cama\s*mesa|lencol|colcha)\b/)) {
    return { icon: 'Bed', matchedLabel: 'Enxoval' };
  }
  if (has(/\b(decoracao|decorar|design\s*de\s*interiores)\b/)) {
    return { icon: 'Palette', matchedLabel: 'Decoração' };
  }
  if (has(/\b(piscina|jacuzzi|ofuro|hidro|hidromassagem)\b/)) {
    return { icon: 'Waves', matchedLabel: 'Piscina' };
  }
  if (has(/\b(mansao|palacio)\b/)) {
    return { icon: 'Castle', matchedLabel: 'Mansão' };
  }
  if (has(/\b(refugio|cabana|chale)\b/)) {
    return { icon: 'Tent', matchedLabel: 'Refúgio' };
  }
  if (has(/\b(galpao|armazem|hangar)\b/)) {
    return { icon: 'Warehouse', matchedLabel: 'Galpão' };
  }
  if (has(/\b(casa|moradia|lar)\b/)) {
    return { icon: 'Home', matchedLabel: 'Casa' };
  }
  if (has(/\b(caminhonete|caminhao|picape|pickup|carreta|truck|hilux|ranger|s10|toro)\b/)) {
    return { icon: 'Truck', matchedLabel: 'Caminhonete / Caminhão' };
  }
  if (has(/\b(lancha|barco|iate|yacht|jetski|jet\s*ski|veleiro|canoa|cruzeiro|transatlantico)\b/)) {
    return { icon: 'Ship', matchedLabel: 'Náutica' };
  }
  if (has(/\b(motorhome|motor\s*home|trailer|kombihome|camper|campervan)\b/)) {
    return { icon: 'Caravan', matchedLabel: 'Motorhome / Trailer' };
  }
  if (has(/\b(bicicleta|bike|ciclismo|pedal|mtb|patinete|patins|scooter|skate)\b/)) {
    return { icon: 'Bike', matchedLabel: 'Bicicleta / Patinete' };
  }
  if (has(/\b(helicoptero|aviao|aeronave|voo)\b/)) {
    return { icon: 'Plane', matchedLabel: 'Aeronave / Voo' };
  }
  if (has(/\b(quadriciclo|quad|buggy|kart|habilitacao|cnh|autoescola|carro|moto|motocicleta|veiculo|automovel)\b/)) {
    return { icon: 'Car', matchedLabel: 'Carro / Veículo' };
  }
  if (has(/\b(faculdade|universidade|facul|mestrado|doutorado|phd|graduacao|formatura|pos-graduacao|pos\s*graduacao)\b/)) {
    return { icon: 'GraduationCap', matchedLabel: 'Educação Superior' };
  }
  if (has(/\b(curso|workshop|treinamento|bootcamp|livro|livros|leitura|kindle|ebook|biblioteca)\b/)) {
    return { icon: 'BookOpen', matchedLabel: 'Curso / Livros' };
  }
  if (has(/\b(idioma|ingles|espanhol|frances|alemao|italiano|lingua)\b/)) {
    return { icon: 'Languages', matchedLabel: 'Idiomas' };
  }
  if (has(/\b(franquia|loja|comercio|boutique|varejo)\b/)) {
    return { icon: 'Store', matchedLabel: 'Loja / Comércio' };
  }
  if (has(/\b(consultorio|clinica)\b/)) {
    return { icon: 'Stethoscope', matchedLabel: 'Consultório' };
  }
  if (has(/\b(estudio|podcast)\b/)) {
    return { icon: 'Mic', matchedLabel: 'Estúdio' };
  }
  if (has(/\b(empresa|negocio|escritorio|startup|cnpj|firma|empreendimento)\b/)) {
    return { icon: 'Briefcase', matchedLabel: 'Negócios' };
  }
  if (has(/\b(equipamentos|equipamento|maquinario|maquina|ferramentas)\b/)) {
    return { icon: 'Cog', matchedLabel: 'Equipamentos' };
  }
  if (has(/\b(patente|invento|invencao|marca\s*registrada)\b/)) {
    return { icon: 'Lightbulb', matchedLabel: 'Patente / Invento' };
  }
  if (has(/\b(estoque|mercadoria|insumos)\b/)) {
    return { icon: 'Package', matchedLabel: 'Estoque' };
  }
  if (has(/\b(prototipo|aplicativo|app|software|sistema|programacao)\b/)) {
    return { icon: 'Code', matchedLabel: 'Aplicativo / Protótipo' };
  }
  if (has(/\b(celular|smartphone|iphone|samsung|xiaomi|motorola)\b/)) {
    return { icon: 'Smartphone', matchedLabel: 'Celular' };
  }
  if (has(/\b(computador|notebook|macbook|setup|setup\s*gamer|desktop|laptop)\b/) || has(/\bpc\b/)) {
    return { icon: 'Laptop', matchedLabel: 'Computador / Setup' };
  }
  if (has(/\b(videogame|video\s*game|console|playstation|ps5|ps4|xbox|nintendo|switch|games?)\b/)) {
    return { icon: 'Gamepad2', matchedLabel: 'Videogame / Console' };
  }
  if (has(/\b(drone|camera|lentes?|lente\s*fotografica|fotografia|gopro|canon|nikon)\b/)) {
    return { icon: 'Camera', matchedLabel: 'Câmera / Lentes / Drone' };
  }
  if (has(/\b(tablet|ipad)\b/)) {
    return { icon: 'Tablet', matchedLabel: 'Tablet' };
  }
  if (has(/\b(televisao|televisor|smart\s*tv)\b/) || has(/\btvs?\b/)) {
    return { icon: 'Tv', matchedLabel: 'Televisão' };
  }
  if (has(/\b(projetor|datashow)\b/)) {
    return { icon: 'Projector', matchedLabel: 'Projetor' };
  }
  if (has(/\b(som|caixa\s*de\s*som|soundbar|subwoofer|home\s*theater|audio|fone|headphones?)\b/)) {
    return { icon: 'Speaker', matchedLabel: 'Som / Áudio' };
  }
  if (has(/\b(automacao|smart\s*home|alexa|casa\s*inteligente)\b/)) {
    return { icon: 'Cpu', matchedLabel: 'Automação' };
  }
  if (has(/\b(casamento|bodas|noivado|noivos)\b/)) {
    return { icon: 'Heart', matchedLabel: 'Casamento' };
  }
  if (has(/\b(aniversario|bday)\b/)) {
    return { icon: 'Cake', matchedLabel: 'Aniversário' };
  }
  if (has(/\b(debutante|15\s*anos|festa|balada|comemoracao|confraternizacao)\b/)) {
    return { icon: 'PartyPopper', matchedLabel: 'Festa / Celebração' };
  }
  if (has(/\b(ferias|praia|resort|descanso|litoral)\b/)) {
    return { icon: 'Palmtree', matchedLabel: 'Férias' };
  }
  if (has(/\b(mochilao|expedicao|eurotrip)\b/)) {
    return { icon: 'Compass', matchedLabel: 'Mochilão / Expedição' };
  }
  if (has(/\b(passaporte|cidadania|imigracao|visto|green\s*card)\b/)) {
    return { icon: 'Luggage', matchedLabel: 'Passaporte / Imigração' };
  }
  if (has(/\b(viagem|viajar|turismo)\b/)) {
    return { icon: 'Plane', matchedLabel: 'Viagem' };
  }
  if (has(/\b(safari)\b/)) {
    return { icon: 'Binoculars', matchedLabel: 'Safari' };
  }
  if (has(/\b(festival|show|concerto|turne|lollapalooza|rock\s*in\s*rio|coachella|tomorrowland)\b/)) {
    return { icon: 'Music', matchedLabel: 'Show / Festival' };
  }
  if (has(/\b(copa|olimpiada|olimpiadas|campeonato|mundial|champions|libertadores)\b/)) {
    return { icon: 'Trophy', matchedLabel: 'Copa / Olimpíadas' };
  }
  if (has(/\b(reveillon|ano\s*novo|virada)\b/)) {
    return { icon: 'Sparkles', matchedLabel: 'Réveillon' };
  }
  if (has(/\b(aposentadoria|aposentar|inss|liberdade|independencia\s*financeira)\b/)) {
    return { icon: 'Sun', matchedLabel: 'Aposentadoria / Liberdade' };
  }
  if (has(/\b(investimento|investir|acao|acoes|bolsa\s*de\s*valores|b3|tesouro|cdb|fiis?)\b/)) {
    return { icon: 'TrendingUp', matchedLabel: 'Investimentos' };
  }
  if (has(/\b(quitacao|quitar|emancipacao)\b/)) {
    return { icon: 'Key', matchedLabel: 'Quitação' };
  }
  if (has(/\b(heranca|legado|patrimonio|partilha)\b/)) {
    return { icon: 'Award', matchedLabel: 'Herança / Legado' };
  }
  if (has(/\b(renda|pensao|dividendo|provento)\b/)) {
    return { icon: 'Coins', matchedLabel: 'Renda / Pensão' };
  }
  if (has(/\b(carteira|wallet)\b/)) {
    return { icon: 'Wallet', matchedLabel: 'Carteira' };
  }
  if (has(/\b(cripto|crypto|bitcoin|btc|ethereum|eth|satoshis)\b/)) {
    return { icon: 'Bitcoin', matchedLabel: 'Cripto' };
  }
  if (has(/\b(ouro|prata|lingote)\b/)) {
    return { icon: 'CircleDollarSign', matchedLabel: 'Ouro' };
  }
  if (has(/\b(guitarra|violao|baixo|contrabaixo|cavaquinho|ukulele)\b/)) {
    return { icon: 'Guitar', matchedLabel: 'Guitarra / Violão' };
  }
  if (has(/\b(instrumento|piano|bateria|teclado\s*musical|sintetizador|percussao)\b/)) {
    return { icon: 'Music', matchedLabel: 'Instrumento / Piano' };
  }
  if (has(/\b(colecao|arte|artes|quadro|pintura|escultura)\b/)) {
    return { icon: 'Palette', matchedLabel: 'Arte / Coleção' };
  }
  if (has(/\b(joias?|anel|alianca|diamante|colar|brinco)\b/)) {
    return { icon: 'Gem', matchedLabel: 'Joias' };
  }
  if (has(/\b(relogio|rolex|smartwatch)\b/)) {
    return { icon: 'Watch', matchedLabel: 'Relógio' };
  }
  if (has(/\b(bolsa|malas?|mochila)\b/)) {
    return { icon: 'ShoppingBag', matchedLabel: 'Bolsa' };
  }
  if (has(/\b(roupas?|vestuario|look|moda|vestido|terno)\b/)) {
    return { icon: 'Shirt', matchedLabel: 'Roupas' };
  }
  if (has(/\b(tenis|calcado|sapato|sneaker)\b/)) {
    return { icon: 'Footprints', matchedLabel: 'Tênis' };
  }
  if (has(/\b(album|disco\s*de\s*vinil|vinil)\b/)) {
    return { icon: 'Disc', matchedLabel: 'Álbum' };
  }
  if (has(/\b(esporte|futebol|basquete|volei|corrida|maratona)\b/)) {
    return { icon: 'Trophy', matchedLabel: 'Esporte' };
  }
  if (has(/\b(academia|musculacao|fitness|crossfit|treino|pesos)\b/)) {
    return { icon: 'Dumbbell', matchedLabel: 'Academia' };
  }
  if (has(/\b(prancha|surf|surfe|bodyboard|snowboard)\b/)) {
    return { icon: 'Waves', matchedLabel: 'Prancha' };
  }
  if (has(/\b(mergulho|mergulhar|scuba|snorkel)\b/)) {
    return { icon: 'Fish', matchedLabel: 'Mergulho' };
  }
  if (has(/\b(paraquedas|skydive|paraquedismo)\b/)) {
    return { icon: 'Wind', matchedLabel: 'Paraquedas' };
  }
  if (has(/\b(trilha|trekking|montanhismo)\b/)) {
    return { icon: 'Mountain', matchedLabel: 'Trilha' };
  }
  if (has(/\b(acampamento|acampar|camping)\b/)) {
    return { icon: 'Tent', matchedLabel: 'Acampamento' };
  }
  if (has(/\b(filho|filha|bebe|adocao|fertilizacao|fiv|maternidade|parto|berco)\b/)) {
    return { icon: 'Baby', matchedLabel: 'Filhos / Bebê' };
  }
  if (has(/\b(cachorro|cadela|cao|caes|pet|pets|dog|filhote)\b/)) {
    return { icon: 'Dog', matchedLabel: 'Cachorro' };
  }
  if (has(/\b(gato|gata|felino|gatinh)\b/)) {
    return { icon: 'Cat', matchedLabel: 'Gato' };
  }
  if (has(/\b(cavalo|egua|haras|hipismo|montaria|equitacao)\b/)) {
    return { icon: 'Sparkles', matchedLabel: 'Cavalo' };
  }
  if (has(/\b(aquario|peixe|peixes)\b/)) {
    return { icon: 'Fish', matchedLabel: 'Aquário' };
  }
  if (has(/\b(mudanca|mudar\s*de\s*casa|carreto)\b/)) {
    return { icon: 'Truck', matchedLabel: 'Mudança' };
  }
  if (has(/\b(recomeco|recomecar|nova\s*vida)\b/)) {
    return { icon: 'RotateCcw', matchedLabel: 'Recomeço' };
  }
  if (has(/\b(doacao|doar|ong|caridade|filantropia|voluntariado)\b/)) {
    return { icon: 'Gift', matchedLabel: 'Doação / ONG' };
  }
  if (has(/\b(cervejaria|cerveja|chopp)\b/)) {
    return { icon: 'Beer', matchedLabel: 'Cervejaria' };
  }
  if (has(/\b(adega|vinho|vinicola)\b/)) {
    return { icon: 'Wine', matchedLabel: 'Adega' };
  }
  if (has(/\b(sonho)\b/)) {
    return { icon: 'Star', matchedLabel: 'Sonho' };
  }

  // 14. Gastronomia, Culinária, Café & Churrasco
  if (has(/\b(cafe|cafeteira|nespresso|espresso|cafeteria|barista|graos\s*de\s*cafe)\b/)) {
    return { icon: 'Coffee', matchedLabel: 'Café / Cafeteria' };
  }
  if (has(/\b(pizza|pizzaria|hamburguer|hamburger|lanche|fast\s*food|delivery)\b/)) {
    return { icon: 'Pizza', matchedLabel: 'Pizza / Lanches' };
  }
  if (has(/\b(restaurante|jantar|almoco|gastronomia|bistro|chef|comer\s*fora)\b/)) {
    return { icon: 'Utensils', matchedLabel: 'Gastronomia / Restaurante' };
  }
  if (has(/\b(panela|panelas|airfryer|geladeira|fogao|cooktop|microondas|micro-ondas|lava\s*loucas|lava-loucas|thermomix|cozinha)\b/)) {
    return { icon: 'CookingPot', matchedLabel: 'Cozinha / Eletrodomésticos' };
  }
  if (has(/\b(dieta|salada|marmita\s*fit|nutricionista|emagrecimento)\b/)) {
    return { icon: 'Salad', matchedLabel: 'Dieta / Vida Saudável' };
  }
  if (has(/\b(nutricao|frutas|organicos|alimentacao|suplementos|whey|creatina)\b/)) {
    return { icon: 'Apple', matchedLabel: 'Nutrição / Suplementação' };
  }
  if (has(/\b(churrasco|churrasqueira|parrilla|picanha|fogo\s*de\s*chao|lareira|lenha)\b/)) {
    return { icon: 'Flame', matchedLabel: 'Churrasco / Lareira' };
  }

  // 15. Finanças, Jurídico, Segurança & Metas
  if (has(/\b(seguro|seguro\s*auto|seguro\s*de\s*vida|seguro\s*residencial|blindagem|blindagem\s*patrimonial|protecao\s*familiar)\b/)) {
    return { icon: 'ShieldCheck', matchedLabel: 'Seguro / Proteção' };
  }
  if (has(/\b(processo|advogado|justica|indenizacao|tribunal|cartorio|escritura|partilha\s*judicial)\b/)) {
    return { icon: 'Scale', matchedLabel: 'Jurídico / Processo' };
  }
  if (has(/\b(banco|prefeitura|impostos|tributos|ipva|iptu|holding|leilao)\b/)) {
    return { icon: 'Landmark', matchedLabel: 'Tributos / Órgãos Públicos' };
  }
  if (has(/\b(cartao|cartao\s*de\s*credito|fatura|milhas|pontos|anuidade)\b/)) {
    return { icon: 'CreditCard', matchedLabel: 'Cartão de Crédito' };
  }
  if (has(/\b(divida|consorcio|emprestimo|boleto|parcela|parcelas|parcelamento|renegociacao|limpar\s*nome|serasa)\b/)) {
    return { icon: 'Receipt', matchedLabel: 'Quitação de Dívida / Boletos' };
  }
  if (has(/\b(meta|foco|alvo|conquista|desafio)\b/)) {
    return { icon: 'Target', matchedLabel: 'Foco / Conquista' };
  }
  if (has(/\b(medalha|podio|premiacao|campeao|campeonato|vitoria|torneio)\b/)) {
    return { icon: 'Medal', matchedLabel: 'Premiação / Vitória' };
  }

  // 16. Casa Sustentável, Energia & Reforma Especial
  if (has(/\b(energia\s*solar|placas?\s*solares|painel\s*solar|fotovoltaica|eletricidade|conta\s*de\s*luz)\b/)) {
    return { icon: 'Zap', matchedLabel: 'Energia Solar' };
  }
  if (has(/\b(carro\s*eletrico|veiculo\s*eletrico|hibrido|wallbox|carregador\s*wallbox|byd|tesla|eletroposto|bateria\s*solar)\b/)) {
    return { icon: 'BatteryCharging', matchedLabel: 'Veículo Elétrico / Bateria' };
  }
  if (has(/\b(pintura|pintar\s*casa|tintas?|pintor|textura|massa\s*corrida)\b/)) {
    return { icon: 'PaintBucket', matchedLabel: 'Pintura' };
  }
  if (has(/\b(jardim|jardinagem|paisagismo|flores|horta|plantas|mudas|pomar|irrigacao)\b/)) {
    return { icon: 'Flower2', matchedLabel: 'Jardim / Paisagismo' };
  }
  if (has(/\b(fechadura\s*eletronica|fechadura\s*digital|alarme|cerca\s*eletrica|interfone|tranca)\b/)) {
    return { icon: 'Lock', matchedLabel: 'Segurança / Fechadura Digital' };
  }

  // 17. Cinema, Entretenimento, Hobbies & Arte Digital
  if (has(/\b(cinema|filmes?|streaming|netflix|cinema\s*em\s*casa|home\s*cinema|audiovisual|roteiro)\b/)) {
    return { icon: 'Clapperboard', matchedLabel: 'Cinema / Streaming' };
  }
  if (has(/\b(teatro|opera|musical|comedia|standup|stand-up|peca\s*teatral|dramaturgia)\b/)) {
    return { icon: 'Drama', matchedLabel: 'Teatro / Espetáculo' };
  }
  if (has(/\b(jogos?\s*de\s*tabuleiro|board\s*games?|rpg|cartas|poker|xadrez|cassino|baralho)\b/)) {
    return { icon: 'Dice5', matchedLabel: 'Jogos de Tabuleiro / RPG' };
  }
  if (has(/\b(lego|quebra-cabeca|quebra\s*cabeca|colecionaveis|miniaturas|action\s*figures?)\b/)) {
    return { icon: 'ToyBrick', matchedLabel: 'Lego / Colecionáveis' };
  }
  if (has(/\b(desenho|ilustracao|mesa\s*digitalizadora|design\s*grafico|artes\s*visuais|wacom)\b/)) {
    return { icon: 'PenTool', matchedLabel: 'Ilustração / Design Gráfico' };
  }

  // 18. Espiritualidade, Beleza & Cuidado Pessoal
  if (has(/\b(igreja|batismo|crisma|retiro\s*espiritual|peregrinacao|terra\s*santa|templo|santuario|caminho\s*de\s*santiago|missa)\b/)) {
    return { icon: 'Church', matchedLabel: 'Espiritualidade / Fé' };
  }
  if (has(/\b(meditacao|yoga|paz|mindfulness|zen|espiritualidade|amanhecer)\b/)) {
    return { icon: 'Sunrise', matchedLabel: 'Meditação / Yoga' };
  }
  if (has(/\b(cabelo|salao|cabeleireiro|barbearia|barba|transplante\s*capilar|mega\s*hair|corte\s*de\s*cabelo)\b/)) {
    return { icon: 'Scissors', matchedLabel: 'Cabelo / Barbearia' };
  }
  if (has(/\b(oculos\s*de\s*grau|armacao|lentes?\s*de\s*contato|oftalmologista|cirurgia\s*refrativa|lasik|vista)\b/)) {
    return { icon: 'Eye', matchedLabel: 'Óculos de Grau / Visão' };
  }
  if (has(/\b(luxo|alta\s*costura|smoking|vestido\s*de\s*gala|grife|realeza|nobreza)\b/)) {
    return { icon: 'Crown', matchedLabel: 'Alta Costura / Grife' };
  }

  // 19. Aves, Roedores, Náutica & Infraestrutura
  if (has(/\b(passaros?|calopsita|papagaio|canarios?|viveiro|aves?)\b/)) {
    return { icon: 'Bird', matchedLabel: 'Pássaros / Aves' };
  }
  if (has(/\b(coelhos?|hamster|roedor|porquinho\s*da\s*india|mini\s*pig)\b/)) {
    return { icon: 'Rabbit', matchedLabel: 'Coelho / Roedores' };
  }
  if (has(/\b(veleiro|navegacao|volta\s*ao\s*mundo|vela|ancoragem|marina)\b/)) {
    return { icon: 'Sailboat', matchedLabel: 'Veleiro / Navegação' };
  }
  if (has(/\b(road\s*trip|viagem\s*de\s*carro|rota\s*66|mapa|passeio|expedicao\s*terrestre)\b/)) {
    return { icon: 'Map', matchedLabel: 'Road Trip / Expedição Terrestre' };
  }
  if (has(/\b(servidor|cloud|hospedagem|data\s*center|infraestrutura|ti|aws)\b/)) {
    return { icon: 'Server', matchedLabel: 'Servidores / Cloud' };
  }
  if (has(/\b(impressora|impressora\s*3d|filamento|resina|impressao)\b/)) {
    return { icon: 'Printer', matchedLabel: 'Impressora 3D' };
  }
  if (has(/\b(internet|rede|fibra\s*optica|starlink|roteador|wi-fi|modem)\b/)) {
    return { icon: 'Wifi', matchedLabel: 'Internet / Redes' };
  }
  if (has(/\b(ssd|backup|armazenamento|hd\s*externo|nvme)\b/)) {
    return { icon: 'HardDrive', matchedLabel: 'Armazenamento / SSD' };
  }

  // 20. Feriados e Datas Comemorativas do Brasil
  if (has(/\b(carnaval|bloquinho|folia|micareta|abada|sapucai|sambodromo|fantasia\s*de\s*carnaval|quarta\s*feira\s*de\s*cinzas)\b/)) {
    return { icon: 'PartyPopper', matchedLabel: 'Carnaval / Folia' };
  }
  if (has(/\b(pascoa|ovo\s*de\s*pascoa|ovos\s*de\s*pascoa|coelho\s*da\s*pascoa|coelhinho\s*da\s*pascoa)\b/)) {
    return { icon: 'Rabbit', matchedLabel: 'Páscoa' };
  }
  if (has(/\b(sexta\s*feira\s*santa|quaresma|semana\s*santa|corpus\s*christi|dia\s*de\s*finados|finados)\b/)) {
    return { icon: 'Cross', matchedLabel: 'Celebração Religiosa / Finados' };
  }
  if (has(/\b(tiradentes|inconfidencia\s*mineira|21\s*de\s*abril)\b/)) {
    return { icon: 'Flag', matchedLabel: 'Tiradentes' };
  }
  if (has(/\b(7\s*de\s*setembro|sete\s*de\s*setembro|independencia\s*do\s*brasil|dia\s*da\s*patria|proclamacao\s*da\s*republica|15\s*de\s*novembro|consciencia\s*negra|zumbi\s*dos\s*palmares|20\s*de\s*novembro)\b/)) {
    return { icon: 'Flag', matchedLabel: 'Feriado Nacional / Pátria' };
  }
  if (has(/\b(dia\s*do\s*trabalho|dia\s*do\s*trabalhador|1\s*de\s*maio|primeiro\s*de\s*maio)\b/)) {
    return { icon: 'Briefcase', matchedLabel: 'Dia do Trabalho' };
  }
  if (has(/\b(dia\s*das\s*maes|presente\s*dia\s*das\s*maes|dia\s*dos\s*pais|presente\s*dia\s*dos\s*pais|dia\s*dos\s*namorados|presente\s*namorad[oa]|dia\s*dos\s*avos|presente\s*dos\s*avos)\b/)) {
    return { icon: 'Heart', matchedLabel: 'Mães / Pais / Namorados' };
  }
  if (has(/\b(festa\s*junina|festa\s*julina|sao\s*joao|arraial|quermesse|fogueira\s*de\s*sao\s*joao|quadrilha\s*junina)\b/)) {
    return { icon: 'Flame', matchedLabel: 'Festa Junina / São João' };
  }
  if (has(/\b(nossa\s*senhora\s*aparecida|padroeira\s*do\s*brasil)\b/)) {
    return { icon: 'Church', matchedLabel: 'Nossa Senhora Aparecida' };
  }
  if (has(/\b(dia\s*das\s*criancas|presente\s*dia\s*das\s*criancas|cosme\s*e\s*damiao|doces\s*de\s*cosme)\b/)) {
    return { icon: 'Candy', matchedLabel: 'Dia das Crianças' };
  }
  if (has(/\b(dia\s*do\s*professor|dia\s*dos\s*professores|15\s*de\s*outubro)\b/)) {
    return { icon: 'GraduationCap', matchedLabel: 'Dia dos Professores' };
  }
  if (has(/\b(natal|arvore\s*de\s*natal|ceia\s*de\s*natal|papai\s*noel|presentes?\s*de\s*natal|amigo\s*secreto|noite\s*feliz)\b/)) {
    return { icon: 'TreePine', matchedLabel: 'Natal' };
  }
  if (has(/\b(feriadao|feriado\s*prolongado|emendar\s*feriado|recesso\s*de\s*fim\s*de\s*ano|recesso\s*escolar)\b/)) {
    return { icon: 'Palmtree', matchedLabel: 'Feriadão / Recesso' };
  }
  if (has(/\b(black\s*friday|blackfriday|cyber\s*monday|liquidacao|promocoes)\b/)) {
    return { icon: 'BadgePercent', matchedLabel: 'Black Friday / Ofertas' };
  }
  if (has(/\b(halloween|dia\s*das\s*bruxas|doces\s*ou\s*travessuras)\b/)) {
    return { icon: 'Ghost', matchedLabel: 'Halloween / Dia das Bruxas' };
  }
  if (has(/\b(oktoberfest|festa\s*alema|festa\s*da\s*cerveja)\b/)) {
    return { icon: 'Beer', matchedLabel: 'Oktoberfest' };
  }

  return { icon: 'PiggyBank', matchedLabel: 'Caixinha Geral' };
}
