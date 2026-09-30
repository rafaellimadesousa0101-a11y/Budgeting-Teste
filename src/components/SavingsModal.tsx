import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  PiggyBank,
  Car,
  Home,
  Plane,
  GraduationCap,
  HeartPulse,
  Laptop,
  ArrowLeft,
  Pencil,
  Archive,
  CheckCircle2,
  Calendar,
  Search,
  Building,
  LandPlot,
  Trees,
  Tractor,
  Hammer,
  Wrench,
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
  Smartphone,
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
  Sparkles,
  Heart,
  Cake,
  PartyPopper,
  Palmtree,
  Compass,
  Binoculars,
  Music,
  Trophy,
  Sun,
  TrendingUp,
  Key,
  Award,
  Coins,
  Wallet,
  Bitcoin,
  CircleDollarSign,
  Guitar,
  Gem,
  Watch,
  ShoppingBag,
  Shirt,
  Footprints,
  Dumbbell,
  Fish,
  Wind,
  Mountain,
  Tent,
  Disc,
  Baby,
  Dog,
  Cat,
  RotateCcw,
  Gift,
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
  ShieldCheck,
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
  Cross,
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
import { SavingBox, BoxDeadlineType } from '../types.ts';
import { formatCurrency, parseCurrencyInput, formatMonthYear } from '../utils/formatters.ts';
import { getNow, useTimeTravel } from '../utils/timeTravel.ts';

interface SavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingBalance: number;
  boxes: SavingBox[];
  onCreateBox: (
    box: Omit<SavingBox, 'id' | 'createdAt' | 'currentAmount'>,
    initialDeposit: number
  ) => void;
  onUpdateBox?: (
    boxId: string,
    updatedData: Partial<Omit<SavingBox, 'id' | 'createdAt' | 'currentAmount'>>
  ) => void;
  onFinalizeBox?: (boxId: string) => void;
  onDepositToBox: (boxId: string, amount: number) => void;
  onDeleteBox?: (boxId: string) => void;
}

const AVAILABLE_ICONS = [
  { id: 'PiggyBank', label: 'Cofrinho' },
  { id: 'HeartPulse', label: 'Saúde' },
  { id: 'Plane', label: 'Viagem' },
  { id: 'Car', label: 'Carro' },
  { id: 'Home', label: 'Casa' },
  { id: 'Laptop', label: 'Tech' },
  { id: 'GraduationCap', label: 'Estudo' },
];

const QUICK_SUGGESTIONS = [
  { label: 'Reserva de Emergência', icon: 'HeartPulse' },
  { label: 'Viagem', icon: 'Plane' },
  { label: 'Carro / Moto', icon: 'Car' },
  { label: 'Casa própria', icon: 'Home' },
  { label: 'Eletrônicos', icon: 'Laptop' },
  { label: 'Estudos', icon: 'GraduationCap' },
];

function BoxIcon({ icon, className = 'w-4 h-4' }: { icon?: string; className?: string }) {
  switch (icon) {
    case 'Car':
      return <Car className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'Plane':
      return <Plane className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Laptop':
      return <Laptop className={className} />;
    case 'Building':
      return <Building className={className} />;
    case 'LandPlot':
      return <LandPlot className={className} />;
    case 'Trees':
      return <Trees className={className} />;
    case 'Tractor':
      return <Tractor className={className} />;
    case 'Hammer':
      return <Hammer className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
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
    case 'Smartphone':
      return <Smartphone className={className} />;
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
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'Cake':
      return <Cake className={className} />;
    case 'PartyPopper':
      return <PartyPopper className={className} />;
    case 'Palmtree':
      return <Palmtree className={className} />;
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
    case 'TrendingUp':
      return <TrendingUp className={className} />;
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
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
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
    case 'Baby':
      return <Baby className={className} />;
    case 'Dog':
      return <Dog className={className} />;
    case 'Cat':
      return <Cat className={className} />;
    case 'RotateCcw':
      return <RotateCcw className={className} />;
    case 'Gift':
      return <Gift className={className} />;
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
    case 'Cross':
      return <Cross className={className} />;
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
}

function detectIconFromText(text: string): string {
  if (!text || !text.trim()) return 'PiggyBank';

  // Normalização: minúsculas, remoção de acentos e diacríticos
  const n = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Testador seguro de palavras ou padrões
  const has = (regex: RegExp) => regex.test(n);

  // 1. ÓculosVR
  if (has(/\b(oculos\s*vr|oculosvr|vr|meta\s*quest|oculus|realidade\s*virtual|apple\s*vision)\b/)) return 'Glasses';

  // 2. Saúde, Estética, Odonto & Cirurgia
  if (has(/\b(silicone|lipo|lipoaspiracao|lipo\s*lad|cirurgia|operacao|protese|rinoplastia|mamoplastia)\b/)) return 'Syringe';
  if (has(/\b(odontologia|odonto|dentista|dente|dentes|aparelho|aparelho\s*dental|aparelho\s*ortodontico|clareamento)\b/)) return 'Smile';
  if (has(/\b(tratamento|terapia|fisioterapia|psicolog|psicanalise|psiquiatr)\b/)) return 'Activity';
  if (has(/\b(tatuagem|tattoo|estetica|botox|harmonizacao|preenchimento|skincare|peeling)\b/)) return 'Sparkles';
  if (has(/\b(saude|emergencia|reserva|medico|hospital|remedio)\b/)) return 'HeartPulse';

  // 3. Imóveis & Moradia
  if (has(/\b(apartamento|apto|kitnet|studio|cobertura|duplex)\b/) || (has(/\bap\b/) && !has(/\baparelho\b/))) return 'Building';
  if (has(/\b(terreno|lote|loteamento)\b/)) return 'LandPlot';
  if (has(/\b(sitio|chacara)\b/)) return 'Trees';
  if (has(/\b(fazendinha|fazenda|trator|gado|rebanho|boi|vaca)\b/)) return 'Tractor';
  if (has(/\b(construcao|construir|obra|tijolo|cimento)\b/)) return 'Hammer';
  if (has(/\b(reforma|reformar)\b/)) return 'Wrench';
  if (has(/\b(mobilia|moveis|movel|sofa|poltrona|armario)\b/)) return 'Armchair';
  if (has(/\b(enxoval|cama\s*mesa|lencol|colcha)\b/)) return 'Bed';
  if (has(/\b(decoracao|decorar|design\s*de\s*interiores)\b/)) return 'Palette';
  if (has(/\b(piscina|jacuzzi|ofuro|hidro|hidromassagem)\b/)) return 'Waves';
  if (has(/\b(mansao|palacio)\b/)) return 'Castle';
  if (has(/\b(refugio|cabana|chale)\b/)) return 'Tent';
  if (has(/\b(galpao|armazem|hangar)\b/)) return 'Warehouse';
  if (has(/\b(casa|moradia|lar)\b/)) return 'Home';

  // 4. Veículos & Mobilidade
  if (has(/\b(caminhonete|caminhao|picape|pickup|carreta|truck|hilux|ranger|s10|toro)\b/)) return 'Truck';
  if (has(/\b(lancha|barco|iate|yacht|jetski|jet\s*ski|veleiro|canoa|cruzeiro|transatlantico)\b/)) return 'Ship';
  if (has(/\b(motorhome|motor\s*home|trailer|kombihome|camper|campervan)\b/)) return 'Caravan';
  if (has(/\b(bicicleta|bike|ciclismo|pedal|mtb|patinete|patins|scooter|skate)\b/)) return 'Bike';
  if (has(/\b(helicoptero|aviao|aeronave|voo)\b/)) return 'Plane';
  if (has(/\b(quadriciclo|quad|buggy|kart)\b/)) return 'Car';
  if (has(/\b(habilitacao|cnh|autoescola)\b/)) return 'Car';
  if (has(/\b(carro|moto|motocicleta|veiculo|automovel)\b/)) return 'Car';

  // 5. Educação & Estudos
  if (has(/\b(faculdade|universidade|facul|mestrado|doutorado|phd|graduacao|formatura|pos-graduacao|pos\s*graduacao)\b/)) return 'GraduationCap';
  if (has(/\b(curso|workshop|treinamento|bootcamp)\b/)) return 'BookOpen';
  if (has(/\b(livro|livros|leitura|kindle|ebook|biblioteca)\b/)) return 'BookOpen';
  if (has(/\b(idioma|ingles|espanhol|frances|alemao|italiano|lingua)\b/)) return 'Languages';

  // 6. Negócios, Trabalho & Empreendedorismo
  if (has(/\b(franquia|loja|comercio|boutique|varejo)\b/)) return 'Store';
  if (has(/\b(consultorio|clinica)\b/)) return 'Stethoscope';
  if (has(/\b(estudio|podcast)\b/)) return 'Mic';
  if (has(/\b(empresa|negocio|escritorio|startup|cnpj|firma|empreendimento)\b/)) return 'Briefcase';
  if (has(/\b(equipamentos|equipamento|maquinario|maquina|ferramentas)\b/)) return 'Cog';
  if (has(/\b(patente|invento|invencao|marca\s*registrada)\b/)) return 'Lightbulb';
  if (has(/\b(estoque|mercadoria|insumos)\b/)) return 'Package';
  if (has(/\b(prototipo|aplicativo|app|software|sistema|programacao)\b/)) return 'Code';

  // 7. Tecnologia, Eletrônicos & Gaming
  if (has(/\b(celular|smartphone|iphone|samsung|xiaomi|motorola)\b/)) return 'Smartphone';
  if (has(/\b(computador|notebook|macbook|setup|setup\s*gamer|desktop|laptop)\b/) || has(/\bpc\b/)) return 'Laptop';
  if (has(/\b(videogame|video\s*game|console|playstation|ps5|ps4|xbox|nintendo|switch|games?)\b/)) return 'Gamepad2';
  if (has(/\b(drone|camera|lentes?|lente\s*fotografica|fotografia|gopro|canon|nikon)\b/)) return 'Camera';
  if (has(/\b(tablet|ipad)\b/)) return 'Tablet';
  if (has(/\b(televisao|televisor|smart\s*tv)\b/) || has(/\btvs?\b/)) return 'Tv';
  if (has(/\b(projetor|datashow)\b/)) return 'Projector';
  if (has(/\b(som|caixa\s*de\s*som|soundbar|subwoofer|home\s*theater|audio|fone|headphones?)\b/)) return 'Speaker';
  if (has(/\b(automacao|smart\s*home|alexa|casa\s*inteligente)\b/)) return 'Cpu';

  // 8. Eventos, Celebrações & Viagens
  if (has(/\b(casamento|bodas|noivado|noivos)\b/)) return 'Heart';
  if (has(/\b(aniversario|bday)\b/)) return 'Cake';
  if (has(/\b(debutante|15\s*anos|festa|balada|comemoracao|confraternizacao)\b/)) return 'PartyPopper';
  if (has(/\b(ferias|praia|resort|descanso|litoral)\b/)) return 'Palmtree';
  if (has(/\b(mochilao|expedicao|eurotrip)\b/)) return 'Compass';
  if (has(/\b(passaporte|cidadania|imigracao|visto|green\s*card)\b/)) return 'Luggage';
  if (has(/\b(viagem|viajar|turismo)\b/)) return 'Plane';
  if (has(/\b(safari)\b/)) return 'Binoculars';
  if (has(/\b(festival|show|concerto|turne|lollapalooza|rock\s*in\s*rio|coachella|tomorrowland)\b/)) return 'Music';
  if (has(/\b(copa|olimpiada|olimpiadas|campeonato|mundial|champions|libertadores)\b/)) return 'Trophy';
  if (has(/\b(reveillon|ano\s*novo|virada)\b/)) return 'Sparkles';

  // 9. Finanças, Liberdade & Futuro
  if (has(/\b(aposentadoria|aposentar|inss|liberdade|independencia\s*financeira)\b/)) return 'Sun';
  if (has(/\b(investimento|investir|acao|acoes|bolsa\s*de\s*valores|b3|tesouro|cdb|fiis?)\b/)) return 'TrendingUp';
  if (has(/\b(quitacao|quitar|emancipacao)\b/)) return 'Key';
  if (has(/\b(heranca|legado|patrimonio|partilha)\b/)) return 'Award';
  if (has(/\b(renda|pensao|dividendo|provento)\b/)) return 'Coins';
  if (has(/\b(carteira|wallet)\b/)) return 'Wallet';
  if (has(/\b(cripto|crypto|bitcoin|btc|ethereum|eth|satoshis)\b/)) return 'Bitcoin';
  if (has(/\b(ouro|prata|lingote)\b/)) return 'CircleDollarSign';

  // 10. Música, Hobbies, Moda & Coleções
  if (has(/\b(guitarra|violao|baixo|contrabaixo|cavaquinho|ukulele)\b/)) return 'Guitar';
  if (has(/\b(instrumento|piano|bateria|teclado\s*musical|sintetizador|percussao)\b/)) return 'Music';
  if (has(/\b(colecao|arte|artes|quadro|pintura|escultura)\b/)) return 'Palette';
  if (has(/\b(joias?|anel|alianca|diamante|colar|brinco)\b/)) return 'Gem';
  if (has(/\b(relogio|rolex|smartwatch)\b/)) return 'Watch';
  if (has(/\b(bolsa|malas?|mochila)\b/)) return 'ShoppingBag';
  if (has(/\b(roupas?|vestuario|look|moda|vestido|terno)\b/)) return 'Shirt';
  if (has(/\b(tenis|calcado|sapato|sneaker)\b/)) return 'Footprints';
  if (has(/\b(album|disco\s*de\s*vinil|vinil)\b/)) return 'Disc';

  // 11. Esportes, Natureza & Aventura
  if (has(/\b(esporte|futebol|basquete|volei|corrida|maratona)\b/)) return 'Trophy';
  if (has(/\b(academia|musculacao|fitness|crossfit|treino|pesos)\b/)) return 'Dumbbell';
  if (has(/\b(prancha|surf|surfe|bodyboard|snowboard)\b/)) return 'Waves';
  if (has(/\b(mergulho|mergulhar|scuba|snorkel)\b/)) return 'Fish';
  if (has(/\b(paraquedas|skydive|paraquedismo)\b/)) return 'Wind';
  if (has(/\b(trilha|trekking|montanhismo)\b/)) return 'Mountain';
  if (has(/\b(acampamento|acampar|camping)\b/)) return 'Tent';

  // 12. Família, Pets & Animais
  if (has(/\b(filho|filha|bebe|adocao|fertilizacao|fiv|maternidade|parto|berco)\b/)) return 'Baby';
  if (has(/\b(cachorro|cadela|cao|caes|pet|pets|dog|filhote)\b/)) return 'Dog';
  if (has(/\b(gato|gata|felino|gatinh)\b/)) return 'Cat';
  if (has(/\b(cavalo|egua|haras|hipismo|montaria|equitacao)\b/)) return 'Sparkles';
  if (has(/\b(aquario|peixe|peixes)\b/)) return 'Fish';

  // 13. Mudanças, Doação, Cervejaria, Adega & Sonho
  if (has(/\b(mudanca|mudar\s*de\s*casa|carreto)\b/)) return 'Truck';
  if (has(/\b(recomeco|recomecar|nova\s*vida)\b/)) return 'RotateCcw';
  if (has(/\b(doacao|doar|ong|caridade|filantropia|voluntariado)\b/)) return 'Gift';
  if (has(/\b(cervejaria|cerveja|chopp)\b/)) return 'Beer';
  if (has(/\b(adega|vinho|vinicola)\b/)) return 'Wine';
  if (has(/\b(sonho)\b/)) return 'Star';

  // 14. Gastronomia, Culinária, Café & Churrasco
  if (has(/\b(cafe|cafeteira|nespresso|espresso|cafeteria|barista|graos\s*de\s*cafe)\b/)) return 'Coffee';
  if (has(/\b(pizza|pizzaria|hamburguer|hamburger|lanche|fast\s*food|delivery)\b/)) return 'Pizza';
  if (has(/\b(restaurante|jantar|almoco|gastronomia|bistro|chef|comer\s*fora)\b/)) return 'Utensils';
  if (has(/\b(panela|panelas|airfryer|geladeira|fogao|cooktop|microondas|micro-ondas|lava\s*loucas|lava-loucas|thermomix|cozinha)\b/)) return 'CookingPot';
  if (has(/\b(dieta|salada|marmita\s*fit|nutricionista|emagrecimento)\b/)) return 'Salad';
  if (has(/\b(nutricao|frutas|organicos|alimentacao|suplementos|whey|creatina)\b/)) return 'Apple';
  if (has(/\b(churrasco|churrasqueira|parrilla|picanha|fogo\s*de\s*chao|lareira|lenha)\b/)) return 'Flame';

  // 15. Finanças, Jurídico, Segurança & Metas
  if (has(/\b(seguro|seguro\s*auto|seguro\s*de\s*vida|seguro\s*residencial|blindagem|blindagem\s*patrimonial|protecao\s*familiar)\b/)) return 'ShieldCheck';
  if (has(/\b(processo|advogado|justica|indenizacao|tribunal|cartorio|escritura|partilha\s*judicial)\b/)) return 'Scale';
  if (has(/\b(banco|prefeitura|impostos|tributos|ipva|iptu|holding|leilao)\b/)) return 'Landmark';
  if (has(/\b(cartao|cartao\s*de\s*credito|fatura|milhas|pontos|anuidade)\b/)) return 'CreditCard';
  if (has(/\b(divida|consorcio|emprestimo|boleto|parcela|parcelas|parcelamento|renegociacao|limpar\s*nome|serasa)\b/)) return 'Receipt';
  if (has(/\b(meta|foco|alvo|conquista|desafio)\b/)) return 'Target';
  if (has(/\b(medalha|podio|premiacao|campeao|campeonato|vitoria|torneio)\b/)) return 'Medal';

  // 16. Casa Sustentável, Energia & Reforma Especial
  if (has(/\b(energia\s*solar|placas?\s*solares|painel\s*solar|fotovoltaica|eletricidade|conta\s*de\s*luz)\b/)) return 'Zap';
  if (has(/\b(carro\s*eletrico|veiculo\s*eletrico|hibrido|wallbox|carregador\s*wallbox|byd|tesla|eletroposto|bateria\s*solar)\b/)) return 'BatteryCharging';
  if (has(/\b(pintura|pintar\s*casa|tintas?|pintor|textura|massa\s*corrida)\b/)) return 'PaintBucket';
  if (has(/\b(jardim|jardinagem|paisagismo|flores|horta|plantas|mudas|pomar|irrigacao)\b/)) return 'Flower2';
  if (has(/\b(fechadura\s*eletronica|fechadura\s*digital|alarme|cerca\s*eletrica|interfone|tranca)\b/)) return 'Lock';

  // 17. Cinema, Entretenimento, Hobbies & Arte Digital
  if (has(/\b(cinema|filmes?|streaming|netflix|cinema\s*em\s*casa|home\s*cinema|audiovisual|roteiro)\b/)) return 'Clapperboard';
  if (has(/\b(teatro|opera|musical|comedia|standup|stand-up|peca\s*teatral|dramaturgia)\b/)) return 'Drama';
  if (has(/\b(jogos?\s*de\s*tabuleiro|board\s*games?|rpg|cartas|poker|xadrez|cassino|baralho)\b/)) return 'Dice5';
  if (has(/\b(lego|quebra-cabeca|quebra\s*cabeca|colecionaveis|miniaturas|action\s*figures?)\b/)) return 'ToyBrick';
  if (has(/\b(desenho|ilustracao|mesa\s*digitalizadora|design\s*grafico|artes\s*visuais|wacom)\b/)) return 'PenTool';

  // 18. Espiritualidade, Beleza & Cuidado Pessoal
  if (has(/\b(igreja|batismo|crisma|retiro\s*espiritual|peregrinacao|terra\s*santa|templo|santuario|caminho\s*de\s*santiago|missa)\b/)) return 'Church';
  if (has(/\b(meditacao|yoga|paz|mindfulness|zen|espiritualidade|amanhecer)\b/)) return 'Sunrise';
  if (has(/\b(cabelo|salao|cabeleireiro|barbearia|barba|transplante\s*capilar|mega\s*hair|corte\s*de\s*cabelo)\b/)) return 'Scissors';
  if (has(/\b(oculos\s*de\s*grau|armacao|lentes?\s*de\s*contato|oftalmologista|cirurgia\s*refrativa|lasik|vista)\b/)) return 'Eye';
  if (has(/\b(luxo|alta\s*costura|smoking|vestido\s*de\s*gala|grife|realeza|nobreza)\b/)) return 'Crown';

  // 19. Aves, Roedores, Náutica & Infraestrutura
  if (has(/\b(passaros?|calopsita|papagaio|canarios?|viveiro|aves?)\b/)) return 'Bird';
  if (has(/\b(coelhos?|hamster|roedor|porquinho\s*da\s*india|mini\s*pig)\b/)) return 'Rabbit';
  if (has(/\b(veleiro|navegacao|volta\s*ao\s*mundo|vela|ancoragem|marina)\b/)) return 'Sailboat';
  if (has(/\b(road\s*trip|viagem\s*de\s*carro|rota\s*66|mapa|passeio|expedicao\s*terrestre)\b/)) return 'Map';
  if (has(/\b(servidor|cloud|hospedagem|data\s*center|infraestrutura|ti|aws)\b/)) return 'Server';
  if (has(/\b(impressora|impressora\s*3d|filamento|resina|impressao)\b/)) return 'Printer';
  if (has(/\b(internet|rede|fibra\s*optica|starlink|roteador|wi-fi|modem)\b/)) return 'Wifi';
  if (has(/\b(ssd|backup|armazenamento|hd\s*externo|nvme)\b/)) return 'HardDrive';

  // 20. Feriados e Datas Comemorativas do Brasil
  if (has(/\b(carnaval|bloquinho|folia|micareta|abada|sapucai|sambodromo|fantasia\s*de\s*carnaval|quarta\s*feira\s*de\s*cinzas)\b/)) return 'PartyPopper';
  if (has(/\b(pascoa|ovo\s*de\s*pascoa|ovos\s*de\s*pascoa|coelho\s*da\s*pascoa|coelhinho\s*da\s*pascoa)\b/)) return 'Rabbit';
  if (has(/\b(sexta\s*feira\s*santa|quaresma|semana\s*santa|corpus\s*christi|dia\s*de\s*finados|finados)\b/)) return 'Cross';
  if (has(/\b(tiradentes|inconfidencia\s*mineira|21\s*de\s*abril)\b/)) return 'Flag';
  if (has(/\b(7\s*de\s*setembro|sete\s*de\s*setembro|independencia\s*do\s*brasil|dia\s*da\s*patria|proclamacao\s*da\s*republica|15\s*de\s*novembro|consciencia\s*negra|zumbi\s*dos\s*palmares|20\s*de\s*novembro)\b/)) return 'Flag';
  if (has(/\b(dia\s*do\s*trabalho|dia\s*do\s*trabalhador|1\s*de\s*maio|primeiro\s*de\s*maio)\b/)) return 'Briefcase';
  if (has(/\b(dia\s*das\s*maes|presente\s*dia\s*das\s*maes|dia\s*dos\s*pais|presente\s*dia\s*dos\s*pais|dia\s*dos\s*namorados|presente\s*namorad[oa]|dia\s*dos\s*avos|presente\s*dos\s*avos)\b/)) return 'Heart';
  if (has(/\b(festa\s*junina|festa\s*julina|sao\s*joao|arraial|quermesse|fogueira\s*de\s*sao\s*joao|quadrilha\s*junina)\b/)) return 'Flame';
  if (has(/\b(nossa\s*senhora\s*aparecida|padroeira\s*do\s*brasil)\b/)) return 'Church';
  if (has(/\b(dia\s*das\s*criancas|presente\s*dia\s*das\s*criancas|cosme\s*e\s*damiao|doces\s*de\s*cosme)\b/)) return 'Candy';
  if (has(/\b(dia\s*do\s*professor|dia\s*dos\s*professores|15\s*de\s*outubro)\b/)) return 'GraduationCap';
  if (has(/\b(natal|arvore\s*de\s*natal|ceia\s*de\s*natal|papai\s*noel|presentes?\s*de\s*natal|amigo\s*secreto|noite\s*feliz)\b/)) return 'TreePine';
  if (has(/\b(feriadao|feriado\s*prolongado|emendar\s*feriado|recesso\s*de\s*fim\s*de\s*ano|recesso\s*escolar)\b/)) return 'Palmtree';
  if (has(/\b(black\s*friday|blackfriday|cyber\s*monday|liquidacao|promocoes)\b/)) return 'BadgePercent';
  if (has(/\b(halloween|dia\s*das\s*bruxas|doces\s*ou\s*travessuras)\b/)) return 'Ghost';
  if (has(/\b(oktoberfest|festa\s*alema|festa\s*da\s*cerveja)\b/)) return 'Beer';

  return 'PiggyBank';
}

// Converte formato ISO (YYYY-MM-DD ou YYYY-MM) para DD/MM/AAAA
function isoToBrDate(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length === 3) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  if (parts.length === 2) {
    return `01/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  return '';
}

// Converte DD/MM/AAAA para formato ISO (YYYY-MM-DD) com validação de calendário
function brDateToIso(br: string): string | null {
  const clean = br.replace(/\D/g, '');
  if (clean.length !== 8) return null;
  const day = clean.substring(0, 2);
  const month = clean.substring(2, 4);
  const year = clean.substring(4, 8);
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (monthNum < 1 || monthNum > 12) return null;
  if (dayNum < 1 || dayNum > 31) return null;
  if (yearNum < 1900 || yearNum > 2100) return null;

  const dateObj = new Date(yearNum, monthNum - 1, dayNum);
  if (
    dateObj.getFullYear() !== yearNum ||
    dateObj.getMonth() !== monthNum - 1 ||
    dateObj.getDate() !== dayNum
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

// Máscara dinâmica para digitação de DD/MM/AAAA
function maskBrDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export const SavingsModal: React.FC<SavingsModalProps> = ({
  isOpen,
  onClose,
  remainingBalance,
  boxes,
  onCreateBox,
  onUpdateBox,
  onFinalizeBox,
  onDepositToBox,
  onDeleteBox,
}) => {
  const activeBoxes = useMemo(() => boxes.filter((b) => !b.isFinalized), [boxes]);
  const finalizedBoxes = useMemo(() => boxes.filter((b) => b.isFinalized), [boxes]);

  // Barra de pesquisa para caixinhas finalizadas (ativa quando houver > 1)
  const [archivedSearchQuery, setArchivedSearchQuery] = useState('');

  const filteredFinalizedBoxes = useMemo(() => {
    const q = archivedSearchQuery.trim().toLowerCase();
    if (!q) return finalizedBoxes;

    return finalizedBoxes.filter((box) => {
      // 1. Pesquisa por título
      if (box.name.toLowerCase().includes(q)) return true;

      // 2. Pesquisa por categoria
      if (box.category && box.category.toLowerCase().includes(q)) return true;

      // 3. Pesquisa por datas (início e finalização)
      const dateStrings: string[] = [];
      if (box.createdAt) {
        const d = new Date(box.createdAt);
        dateStrings.push(d.toLocaleDateString('pt-BR').toLowerCase());
        dateStrings.push(d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toLowerCase());
        dateStrings.push(d.toLocaleDateString('pt-BR', { month: 'short' }).toLowerCase());
      }
      if (box.finalizedAt) {
        const d = new Date(box.finalizedAt);
        dateStrings.push(d.toLocaleDateString('pt-BR').toLowerCase());
        dateStrings.push(d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toLowerCase());
        dateStrings.push(d.toLocaleDateString('pt-BR', { month: 'short' }).toLowerCase());
      }
      if (dateStrings.some((ds) => ds.includes(q))) return true;

      // 4. Pesquisa por valores (arrecadado e meta planejada)
      const current = box.currentAmount || 0;
      const currentFormatted = formatCurrency(current).toLowerCase();
      const currentRaw = String(current);
      const currentRawComma = currentRaw.replace('.', ',');
      if (
        currentFormatted.includes(q) ||
        currentRaw.includes(q) ||
        currentRawComma.includes(q)
      ) {
        return true;
      }

      if (box.targetAmount) {
        const target = box.targetAmount;
        const targetFormatted = formatCurrency(target).toLowerCase();
        const targetRaw = String(target);
        const targetRawComma = targetRaw.replace('.', ',');
        if (
          targetFormatted.includes(q) ||
          targetRaw.includes(q) ||
          targetRawComma.includes(q)
        ) {
          return true;
        }
      }

      return false;
    });
  }, [finalizedBoxes, archivedSearchQuery]);

  const [view, setView] = useState<'list' | 'new' | 'edit' | 'archived'>(
    activeBoxes.length === 0 && finalizedBoxes.length === 0 ? 'new' : 'list'
  );

  // Paginação: exibir no máximo 4 caixinhas por vez com botão discreto para carregar mais
  const [visibleActiveCount, setVisibleActiveCount] = useState<number>(4);
  const [visibleArchivedCount, setVisibleArchivedCount] = useState<number>(4);

  // Reinicia o contador de arquivadas ao buscar
  useEffect(() => {
    setVisibleArchivedCount(4);
  }, [archivedSearchQuery]);

  // Individual deposit state: stores the ID of the specific box currently receiving funds
  const [activeDepositBoxId, setActiveDepositBoxId] = useState<string | null>(null);
  const [depositAmountInput, setDepositAmountInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for delete confirmation in list view: stores the box ID pending confirmation
  const [confirmDeleteBoxId, setConfirmDeleteBoxId] = useState<string | null>(null);

  // State for finalize confirmation in edit view: stores the box ID pending confirmation
  const [confirmFinalizeBoxId, setConfirmFinalizeBoxId] = useState<string | null>(null);

  // Form states for creating a new caixinha - integrado 100% com o Modo Desenvolvedor
  const { simulatedDate } = useTimeTravel();
  const todayStr = useMemo(() => {
    const y = simulatedDate.getFullYear();
    const m = String(simulatedDate.getMonth() + 1).padStart(2, '0');
    const d = String(simulatedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [simulatedDate]);

  const nextMonthStartStr = useMemo(() => {
    const y = simulatedDate.getFullYear();
    const m = simulatedDate.getMonth(); // 0-based
    const nextDate = new Date(y, m + 1, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    return `${nextYear}-${nextMonth}-01`;
  }, [simulatedDate]);

  const [boxName, setBoxName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('PiggyBank');
  const [targetAmountInput, setTargetAmountInput] = useState('');
  const [initialDepositInput, setInitialDepositInput] = useState('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<string>('');
  const [deadlineInput, setDeadlineInput] = useState<string>('');

  // Form states for EDITING an existing caixinha
  const [editingBoxId, setEditingBoxId] = useState<string | null>(null);
  const [editBoxName, setEditBoxName] = useState('');
  const [editSelectedIcon, setEditSelectedIcon] = useState<string>('PiggyBank');
  const [editTargetAmountInput, setEditTargetAmountInput] = useState('');
  const [editHasDeadline, setEditHasDeadline] = useState(false);
  const [editDeadlineDate, setEditDeadlineDate] = useState<string>('');
  const [editDeadlineInput, setEditDeadlineInput] = useState<string>('');

  const newDateInputRef = useRef<HTMLInputElement>(null);
  const editDateInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Redefine todo o estado temporário de navegação e posição de interface ao reabrir a seção
  useEffect(() => {
    if (isOpen) {
      setView('list');
      setArchivedSearchQuery('');
      setVisibleActiveCount(4);
      setVisibleArchivedCount(4);
      setActiveDepositBoxId(null);
      setDepositAmountInput('');
      setErrorMessage(null);
      setConfirmDeleteBoxId(null);
      setConfirmFinalizeBoxId(null);
      setBoxName('');
      setSelectedIcon('PiggyBank');
      setTargetAmountInput('');
      setInitialDepositInput('');
      setHasDeadline(false);
      setDeadlineDate('');
      setDeadlineInput('');
      setEditingBoxId(null);
      setEditBoxName('');
      setEditSelectedIcon('PiggyBank');
      setEditTargetAmountInput('');
      setEditHasDeadline(false);
      setEditDeadlineDate('');
      setEditDeadlineInput('');

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      if (overlayRef.current) {
        overlayRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, activeBoxes.length, finalizedBoxes.length, todayStr]);

  // Revalidação do prazo em tempo real se a data for modificada pelas funções do desenvolvedor
  useEffect(() => {
    if (deadlineDate && deadlineDate < nextMonthStartStr) {
      setErrorMessage('O prazo deve ser definido apenas para meses posteriores ao mês corrente.');
    } else if (editDeadlineDate && editDeadlineDate < nextMonthStartStr) {
      setErrorMessage('O prazo deve ser definido apenas para meses posteriores ao mês corrente.');
    }
  }, [simulatedDate, nextMonthStartStr, deadlineDate, editDeadlineDate]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll and isolate background while modal is active
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    const originalBodyOverscroll = document.body.style.overscrollBehavior;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    const overlay = overlayRef.current;
    const scrollContainer = scrollContainerRef.current;

    const handleOverlayWheel = (e: WheelEvent) => {
      if (e.target === overlay) {
        e.preventDefault();
      }
    };

    const handleOverlayTouchMove = (e: TouchEvent) => {
      if (e.target === overlay) {
        e.preventDefault();
      }
    };

    // Prevent wheel chaining when at top or bottom boundaries of the scrollable container
    const handleContainerWheel = (e: WheelEvent) => {
      if (!scrollContainer) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtTop = scrollTop <= 0 && e.deltaY < 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
      if (isAtTop || isAtBottom) {
        e.preventDefault();
      }
    };

    if (overlay) {
      overlay.addEventListener('wheel', handleOverlayWheel, { passive: false });
      overlay.addEventListener('touchmove', handleOverlayTouchMove, { passive: false });
    }

    if (scrollContainer) {
      scrollContainer.addEventListener('wheel', handleContainerWheel, { passive: false });
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;

      if (overlay) {
        overlay.removeEventListener('wheel', handleOverlayWheel);
        overlay.removeEventListener('touchmove', handleOverlayTouchMove);
      }
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleContainerWheel);
      }
    };
  }, [isOpen]);

  const handleNameChange = (text: string) => {
    setBoxName(text);
    setSelectedIcon(detectIconFromText(text));
  };

  const handleSelectSuggestion = (s: { label: string; icon: string }) => {
    setBoxName(s.label);
    setSelectedIcon(s.icon);
  };

  // Click on box SVG icon to start editing
  const handleStartEditBox = (box: SavingBox) => {
    setEditingBoxId(box.id);
    setEditBoxName(box.name);
    setEditSelectedIcon(box.icon || 'PiggyBank');
    setEditTargetAmountInput(
      box.targetAmount && box.targetAmount > 0
        ? box.targetAmount.toFixed(2).replace('.', ',')
        : ''
    );

    if (box.targetDate) {
      setEditHasDeadline(true);
      const iso = box.targetDate.length === 7 ? `${box.targetDate}-01` : box.targetDate;
      setEditDeadlineDate(iso);
      setEditDeadlineInput(isoToBrDate(iso));
    } else {
      setEditHasDeadline(false);
      setEditDeadlineDate('');
      setEditDeadlineInput('');
    }

    setErrorMessage(null);
    setView('edit');
  };

  const handleSaveEditBox = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!editingBoxId) return;

    const trimmedName = editBoxName.trim();
    if (!trimmedName) {
      setErrorMessage('Informe o nome da caixinha.');
      return;
    }

    const targetAmount = parseCurrencyInput(editTargetAmountInput);

    let calculatedTargetDate: string | undefined = undefined;
    if (editHasDeadline) {
      const finalIso = editDeadlineDate || brDateToIso(editDeadlineInput);
      if (!finalIso) {
        setErrorMessage('Informe uma data válida no formato DD/MM/AAAA para o prazo.');
        return;
      }
      if (finalIso < nextMonthStartStr) {
        setErrorMessage('O prazo deve ser definido apenas para meses posteriores ao mês corrente.');
        return;
      }
      calculatedTargetDate = finalIso;
    }

    if (onUpdateBox) {
      onUpdateBox(editingBoxId, {
        name: trimmedName,
        category: trimmedName,
        icon: editSelectedIcon,
        targetAmount: targetAmount > 0 ? targetAmount : undefined,
        deadlineType: editHasDeadline ? 'date' : 'none',
        targetDate: calculatedTargetDate,
      });
    }

    setView('list');
    setEditingBoxId(null);
  };

  const handleCreateNewBox = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = boxName.trim();
    if (!trimmedName) {
      setErrorMessage('Informe o nome da caixinha.');
      return;
    }

    const depositAmount = parseCurrencyInput(initialDepositInput) || 0;
    if (depositAmount < 0) {
      setErrorMessage('O valor não pode ser negativo.');
      return;
    }

    if (depositAmount > remainingBalance) {
      setErrorMessage(`O valor (${formatCurrency(depositAmount)}) excede o saldo restante disponível (${formatCurrency(remainingBalance)}).`);
      return;
    }

    const targetAmount = parseCurrencyInput(targetAmountInput);

    let calculatedTargetDate = '';
    if (hasDeadline) {
      const finalIso = deadlineDate || brDateToIso(deadlineInput);
      if (!finalIso) {
        setErrorMessage('Informe uma data válida no formato DD/MM/AAAA para o prazo.');
        return;
      }
      if (finalIso < nextMonthStartStr) {
        setErrorMessage('O prazo deve ser definido apenas para meses posteriores ao mês corrente.');
        return;
      }
      calculatedTargetDate = finalIso;
    }

    onCreateBox(
      {
        name: trimmedName,
        category: trimmedName,
        icon: selectedIcon,
        targetAmount: targetAmount > 0 ? targetAmount : undefined,
        deadlineType: hasDeadline ? 'date' : 'none',
        targetDate: calculatedTargetDate || undefined,
      },
      depositAmount
    );

    setBoxName('');
    setSelectedIcon('PiggyBank');
    setTargetAmountInput('');
    setInitialDepositInput('');
    setHasDeadline(false);
    setDeadlineDate('');
    setDeadlineInput('');
    setView('list');
  };

  // Submit deposit directly and exclusively to the target individual box
  const handleInlineDeposit = (boxId: string, e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const amount = parseCurrencyInput(depositAmountInput);
    if (!amount || amount <= 0) {
      setErrorMessage('Informe um valor válido maior que zero.');
      return;
    }

    if (amount > remainingBalance) {
      setErrorMessage(
        `Valor (${formatCurrency(amount)}) excede o saldo restante disponível (${formatCurrency(remainingBalance)}).`
      );
      return;
    }

    onDepositToBox(boxId, amount);
    setDepositAmountInput('');
    setActiveDepositBoxId(null);
  };

  // O total guardado considera exclusivamente as caixinhas ativas (não finalizadas)
  const totalSavedAcrossBoxes = useMemo(() => {
    return activeBoxes.reduce((sum, b) => sum + (b.currentAmount || 0), 0);
  }, [activeBoxes]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-savings-overlay"
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-150 overscroll-contain select-none"
      style={{ overscrollBehavior: 'contain', touchAction: 'none' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div
        id="modal-savings-content"
        className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full shadow-xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors my-auto max-h-[92vh] select-text overscroll-contain"
        style={{ overscrollBehavior: 'contain' }}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Minimalist Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            {view !== 'list' && boxes.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setView('list');
                  setEditingBoxId(null);
                  setErrorMessage(null);
                  setArchivedSearchQuery('');
                }}
                className="p-1 -ml-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                title="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <PiggyBank className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {view === 'list' && 'Caixinhas & Metas'}
                {view === 'new' && 'Nova Caixinha'}
                {view === 'edit' && 'Editar Caixinha'}
                {view === 'archived' && 'Caixinhas Arquivadas'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {finalizedBoxes.length > 0 && view === 'list' && (
              <button
                type="button"
                id="btn-view-archived-boxes"
                onClick={() => setView('archived')}
                title={`Ver caixinhas finalizadas (${finalizedBoxes.length})`}
                aria-label="Ver caixinhas finalizadas"
                className="p-1.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}

            {view === 'list' && (
              <button
                type="button"
                id="btn-close-savings-modal"
                onClick={() => {
                  setArchivedSearchQuery('');
                  onClose();
                }}
                aria-label="Fechar"
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Minimalist Balance Bar ou Barra de Pesquisa de Caixinhas Finalizadas */}
        {view === 'archived' ? (
          finalizedBoxes.length > 1 ? (
            <div className="px-5 py-2.5 bg-zinc-50/60 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={archivedSearchQuery}
                  onChange={(e) => setArchivedSearchQuery(e.target.value)}
                  placeholder="Pesquisar por título, data ou valor..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors shadow-2xs"
                />
                {archivedSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setArchivedSearchQuery('')}
                    title="Limpar pesquisa"
                    className="absolute right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ) : null
        ) : (
          <div className="px-5 py-2.5 bg-zinc-50/60 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <span>Disponível:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                {formatCurrency(remainingBalance)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <span>Guardado:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(totalSavedAcrossBoxes)}
              </span>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div
          ref={scrollContainerRef}
          className="p-5 max-h-[74vh] overflow-y-auto overscroll-contain"
          style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {errorMessage && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
              {errorMessage}
            </div>
          )}

          {/* VIEW: LIST CAIXINHAS */}
          {view === 'list' && (
            <div className="space-y-3">
              {activeBoxes.length === 0 ? (
                finalizedBoxes.length > 0 ? (
                  <div className="text-center py-8 px-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Sem caixinhas ativas!
                    </h3>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                      Você pode criar um novo objetivo ou visualizar as caixinhas arquivadas.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setView('new')}
                        className="px-3.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nova caixinha</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 px-2">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-2.5 text-zinc-400">
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Nenhuma caixinha criada
                    </h3>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                      Separe parte do seu saldo para objetivos específicos.
                    </p>
                    <button
                      type="button"
                      onClick={() => setView('new')}
                      className="mt-4 px-3.5 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Criar caixinha</span>
                    </button>
                  </div>
                )
              ) : (
                <>
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                        {activeBoxes.length > 4
                          ? `Exibindo ${Math.min(visibleActiveCount, activeBoxes.length)} de ${activeBoxes.length} caixinhas ativas`
                          : `${activeBoxes.length} ${activeBoxes.length === 1 ? 'caixinha ativa' : 'caixinhas ativas'}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setView('new')}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nova</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeBoxes.slice(0, visibleActiveCount).map((box) => {
                      const hasTarget = typeof box.targetAmount === 'number' && box.targetAmount > 0;
                      const isGoalReached = hasTarget && box.currentAmount >= (box.targetAmount || 0);
                      const progressPct = hasTarget
                        ? Math.min(100, Math.round((box.currentAmount / (box.targetAmount || 1)) * 100))
                        : null;
                      const isDepositing = activeDepositBoxId === box.id;

                      return (
                        <div
                          key={box.id}
                          className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col gap-3"
                        >
                          {/* Top Area: Icon, Title, Deadline & Balance */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* SVG Icon Container - Estático (não clicável) */}
                              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 shadow-2xs border border-zinc-200/60 dark:border-zinc-700/60">
                                <BoxIcon icon={box.icon} className="w-4.5 h-4.5" />
                              </div>

                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                  {box.name}
                                </h4>
                                {box.targetDate ? (
                                  <div className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                                    <span>
                                      {box.targetDate.length === 7
                                        ? formatMonthYear(box.targetDate)
                                        : new Date(box.targetDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-zinc-400 mt-0.5 block">Livre (sem prazo)</span>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider block">
                                Acumulado
                              </span>
                              <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                                {formatCurrency(box.currentAmount)}
                              </div>
                            </div>
                          </div>

                          {/* Progress Section */}
                          {hasTarget ? (
                            <div className="bg-zinc-50/80 dark:bg-zinc-800/40 rounded-lg p-2.5 border border-zinc-100 dark:border-zinc-800/60 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                  <span className="font-medium text-zinc-600 dark:text-zinc-300">Meta:</span>
                                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                                    {formatCurrency(box.targetAmount || 0)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                  <span>{progressPct}%</span>
                                  <span className="text-zinc-400 font-normal font-sans">
                                    {isGoalReached ? 'atingida!' : 'concluído'}
                                  </span>
                                </div>
                              </div>

                              <div className="w-full h-1.5 bg-zinc-200/70 dark:bg-zinc-700/60 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="bg-zinc-50/50 dark:bg-zinc-800/20 rounded-lg px-2.5 py-1.5 border border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between text-[11px] text-zinc-400">
                              <span>Meta livre</span>
                              <span>Sem valor estipulado</span>
                            </div>
                          )}

                          {/* Actions / Deposit area */}
                          {isDepositing ? (
                            <form
                              onSubmit={(e) => handleInlineDeposit(box.id, e)}
                              className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2 animate-in fade-in duration-150"
                            >
                              <div className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                                Quanto deseja guardar em <span className="font-semibold text-emerald-600 dark:text-emerald-400">{box.name}</span>?
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-semibold">
                                    R$
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    autoFocus
                                    placeholder="0,00"
                                    value={depositAmountInput}
                                    onChange={(e) => {
                                      setDepositAmountInput(e.target.value.replace(/[^0-9.,]/g, ''));
                                      setErrorMessage(null);
                                    }}
                                    className="w-full pl-8 pr-2.5 py-1.5 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                                  />
                                </div>
                                <button
                                  type="submit"
                                  disabled={remainingBalance <= 0}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Guardar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveDepositBoxId(null);
                                    setDepositAmountInput('');
                                    setErrorMessage(null);
                                  }}
                                  className="px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          ) : confirmDeleteBoxId === box.id ? (
                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 w-full flex items-center justify-between bg-rose-50/80 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200/60 dark:border-rose-900/40 animate-in fade-in">
                              <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                                Excluir caixinha?
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteBoxId(null)}
                                  className="px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded transition-colors cursor-pointer"
                                >
                                  Voltar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onDeleteBox) onDeleteBox(box.id);
                                    setConfirmDeleteBoxId(null);
                                  }}
                                  className="px-2 py-0.5 text-[11px] font-medium text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors cursor-pointer"
                                >
                                  Sim, excluir
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditBox(box)}
                                  title="Editar objetivo e meta"
                                  className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Pencil className="w-3 h-3" />
                                  <span>Editar</span>
                                </button>

                                {onDeleteBox && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmDeleteBoxId(box.id);
                                      setActiveDepositBoxId(null);
                                    }}
                                    title="Excluir caixinha"
                                    className="text-[11px] font-medium text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Excluir</span>
                                  </button>
                                )}
                              </div>

                              {isGoalReached ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onFinalizeBox) {
                                      onFinalizeBox(box.id);
                                    }
                                  }}
                                  title="Meta batida! Concluir e arquivar caixinha"
                                  className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Concluir</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveDepositBoxId(box.id);
                                    setDepositAmountInput('');
                                    setErrorMessage(null);
                                  }}
                                  className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Guardar valor</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Botão discreto sem nome com SVG de + no canto direito */}
                  {visibleActiveCount < activeBoxes.length && (
                    <div className="pt-2 flex justify-end">
                      <button
                        id="btn-show-more-active-boxes"
                        type="button"
                        onClick={() => setVisibleActiveCount((prev) => prev + 4)}
                        aria-label="Carregar mais caixinhas ativas"
                        title="Carregar mais caixinhas ativas"
                        className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-lg transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 inline-flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* VIEW: CREATE NEW CAIXINHA */}
          {view === 'new' && (
            <form onSubmit={handleCreateNewBox} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Nome do objetivo
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                    <BoxIcon icon={selectedIcon} className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Ex: Viagem, Carro, Reserva..."
                    value={boxName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400"
                  />
                </div>

                {/* Suggestions text chips */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className={`px-2 py-0.5 text-[11px] rounded-md transition-colors cursor-pointer ${
                        boxName === s.label
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target amount */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Meta financeira <span className="text-zinc-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-semibold">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={targetAmountInput}
                    onChange={(e) => setTargetAmountInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 font-mono"
                  />
                </div>
              </div>

              {/* Deadline Toggle (Compact) */}
              <div className="pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    Definir prazo (opcional)
                  </span>
                  <input
                    type="checkbox"
                    checked={hasDeadline}
                    onChange={(e) => {
                      setHasDeadline(e.target.checked);
                      if (!e.target.checked) {
                        setDeadlineDate('');
                        setDeadlineInput('');
                      }
                    }}
                    className="rounded border-zinc-300 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                {hasDeadline && (
                  <div className="mt-2 animate-in fade-in">
                    <div className="relative">
                      <input
                        id="input-savings-deadline"
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/aaaa"
                        value={deadlineInput}
                        onChange={(e) => {
                          const masked = maskBrDate(e.target.value);
                          setDeadlineInput(masked);
                          const iso = brDateToIso(masked);
                          setDeadlineDate(iso || '');
                          const clean = masked.replace(/\D/g, '');
                          if (clean.length === 8) {
                            if (!iso) {
                              setErrorMessage('Data inválida');
                            } else if (iso < nextMonthStartStr) {
                              setErrorMessage('O prazo deve ser definido apenas para meses posteriores ao mês corrente.');
                            } else {
                              setErrorMessage(null);
                            }
                          } else {
                            setErrorMessage(null);
                          }
                        }}
                        className={`w-full pl-3 pr-9 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:font-['Roboto'] placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 font-mono tracking-wide transition-colors ${
                          errorMessage?.includes('prazo') || errorMessage === 'Data inválida'
                            ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-500/10'
                            : 'border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-900/10 dark:focus:ring-zinc-400/10'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            newDateInputRef.current?.showPicker();
                          } catch {
                            newDateInputRef.current?.focus();
                          }
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                        title="Escolher data no calendário"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                      <input
                        ref={newDateInputRef}
                        type="date"
                        min={nextMonthStartStr}
                        value={deadlineDate}
                        onChange={(e) => {
                          const iso = e.target.value;
                          setDeadlineDate(iso);
                          setDeadlineInput(isoToBrDate(iso));
                          if (iso && iso < nextMonthStartStr) {
                            setErrorMessage('O prazo deve ser definido apenas para meses posteriores ao mês corrente.');
                          } else {
                            setErrorMessage(null);
                          }
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 pointer-events-none"
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Initial Deposit (Compact) */}
              <div className="pt-1">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Guardar valor agora <span className="text-zinc-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-semibold">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={initialDepositInput}
                    onChange={(e) => setInitialDepositInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 font-mono"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-2 pt-3">
                {boxes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="flex-1 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Criar caixinha</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW: EDIT EXISTING CAIXINHA */}
          {view === 'edit' && (
            <form onSubmit={handleSaveEditBox} className="space-y-3.5">
              {/* Name and Icon */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Nome do objetivo
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <BoxIcon icon={editSelectedIcon} className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Ex: Viagem, Carro, Reserva..."
                    value={editBoxName}
                    onChange={(e) => {
                      setEditBoxName(e.target.value);
                      setEditSelectedIcon(detectIconFromText(e.target.value));
                      setErrorMessage(null);
                    }}
                    className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400"
                  />
                </div>

                {/* Choose Icon Pills */}
                <div className="mt-2.5">
                  <span className="block text-[11px] text-zinc-400 mb-1">Alterar ícone:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_ICONS.map((ic) => (
                      <button
                        key={ic.id}
                        type="button"
                        onClick={() => setEditSelectedIcon(ic.id)}
                        className={`px-2 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                          editSelectedIcon === ic.id
                            ? 'bg-emerald-600 text-white font-medium shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        <BoxIcon icon={ic.id} className="w-3.5 h-3.5" />
                        <span className="text-[11px]">{ic.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target amount */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Meta financeira <span className="text-zinc-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-semibold">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={editTargetAmountInput}
                    onChange={(e) => setEditTargetAmountInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 font-mono"
                  />
                </div>
              </div>

              {/* Deadline Toggle */}
              <div className="pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    Definir prazo (opcional)
                  </span>
                  <input
                    type="checkbox"
                    checked={editHasDeadline}
                    onChange={(e) => {
                      setEditHasDeadline(e.target.checked);
                      if (!e.target.checked) {
                        setEditDeadlineDate('');
                        setEditDeadlineInput('');
                      }
                    }}
                    className="rounded border-zinc-300 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                {editHasDeadline && (
                  <div className="mt-2 animate-in fade-in">
                    <div className="relative">
                      <input
                        id="input-edit-savings-deadline"
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/aaaa"
                        value={editDeadlineInput}
                        onChange={(e) => {
                          const masked = maskBrDate(e.target.value);
                          setEditDeadlineInput(masked);
                          const iso = brDateToIso(masked);
                          setEditDeadlineDate(iso || '');
                          const clean = masked.replace(/\D/g, '');
                          if (clean.length === 8) {
                            if (!iso) {
                              setErrorMessage('Data inválida');
                            } else if (iso < nextMonthStartStr) {
                              setErrorMessage('O prazo deve ser definido apenas para meses posteriores ao mês corrente.');
                            } else {
                              setErrorMessage(null);
                            }
                          } else {
                            setErrorMessage(null);
                          }
                        }}
                        className={`w-full pl-3 pr-9 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:font-['Roboto'] placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 font-mono tracking-wide transition-colors ${
                          errorMessage?.includes('prazo') || errorMessage === 'Data inválida'
                            ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-500/10'
                            : 'border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-900/10 dark:focus:ring-zinc-400/10'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            editDateInputRef.current?.showPicker();
                          } catch {
                            editDateInputRef.current?.focus();
                          }
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                        title="Escolher data no calendário"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                      <input
                        ref={editDateInputRef}
                        type="date"
                        min={nextMonthStartStr}
                        value={editDeadlineDate}
                        onChange={(e) => {
                          const iso = e.target.value;
                          setEditDeadlineDate(iso);
                          setEditDeadlineInput(isoToBrDate(iso));
                          if (iso && iso < nextMonthStartStr) {
                            setErrorMessage('O prazo deve ser definido apenas para meses posteriores ao mês corrente.');
                          } else {
                            setErrorMessage(null);
                          }
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 pointer-events-none"
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setView('list');
                    setEditingBoxId(null);
                    setErrorMessage(null);
                    setConfirmDeleteBoxId(null);
                  }}
                  className="flex-1 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar alterações</span>
                </button>
              </div>

              {/* Finalizar caixinha in edit view (replaces delete option) */}
              {onFinalizeBox && editingBoxId && (
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  {confirmFinalizeBoxId === editingBoxId ? (
                    <div className="flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 animate-in fade-in">
                      <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                        Finalizar esta caixinha?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmFinalizeBoxId(null)}
                          className="px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Não
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onFinalizeBox(editingBoxId);
                            setConfirmFinalizeBoxId(null);
                            setEditingBoxId(null);
                            setView('list');
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Sim
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmFinalizeBoxId(editingBoxId)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Finalizar caixinha</span>
                    </button>
                  )}
                </div>
              )}
            </form>
          )}

          {/* VIEW: ARCHIVED / FINALIZED CAIXINHAS */}
          {view === 'archived' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  {filteredFinalizedBoxes.length > 4
                    ? `Exibindo ${Math.min(visibleArchivedCount, filteredFinalizedBoxes.length)} de ${filteredFinalizedBoxes.length} ${
                        filteredFinalizedBoxes.length === 1 ? 'caixinha' : 'caixinhas'
                      }`
                    : archivedSearchQuery.trim()
                    ? `${filteredFinalizedBoxes.length} de ${finalizedBoxes.length} ${
                        finalizedBoxes.length === 1 ? 'caixinha' : 'caixinhas'
                      }`
                    : `${finalizedBoxes.length} ${
                        finalizedBoxes.length === 1 ? 'caixinha' : 'caixinhas'
                      }`}
                </span>
              </div>

              {finalizedBoxes.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs">
                  Nenhuma caixinha finalizada ainda.
                </div>
              ) : filteredFinalizedBoxes.length === 0 ? (
                <div className="text-center py-8 px-4 text-xs space-y-2">
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Nenhuma caixinha finalizada encontrada para "{archivedSearchQuery}".
                  </p>
                  <button
                    type="button"
                    onClick={() => setArchivedSearchQuery('')}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
                  >
                    Limpar busca
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {filteredFinalizedBoxes.slice(0, visibleArchivedCount).map((box) => {
                      const targetAmount = typeof box.targetAmount === 'number' && box.targetAmount > 0 ? box.targetAmount : null;
                      const currentAmount = box.currentAmount || 0;
                      const exactPct = targetAmount !== null ? (currentAmount / targetAmount) * 100 : 100;
                      const progressPct = targetAmount !== null
                        ? Math.min(100, Math.max(0, exactPct))
                        : 100;

                      let conclusionLabel = 'Concluído';
                      if (targetAmount !== null) {
                        const formattedPctStr = Number.isInteger(exactPct)
                          ? `${exactPct}%`
                          : `${parseFloat(exactPct.toFixed(2)).toString().replace('.', ',')}%`;

                        if (currentAmount === targetAmount || Math.round(exactPct * 100) === 10000) {
                          conclusionLabel = 'Concluída com 100% do valor';
                        } else {
                          conclusionLabel = `Concluído com ${formattedPctStr} do valor`;
                        }
                      }

                      return (
                        <div
                          key={box.id}
                      className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col gap-3"
                    >
                      {/* Top Area: Icon, Title, Status & Final Total */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-center shrink-0 shadow-2xs">
                            <BoxIcon icon={box.icon} className="w-4.5 h-4.5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {box.name}
                              </h4>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-1.5 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>Finalizada</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider block">
                            TOTAL ACUMULADO
                          </span>
                          <div className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(box.currentAmount || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Organized Info Grid (Início, Conclusão, Meta) */}
                      <div className="bg-zinc-50/80 dark:bg-zinc-800/40 rounded-lg p-2.5 border border-zinc-100 dark:border-zinc-800/60 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {/* Data de Início */}
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                            Início
                          </span>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono text-[11px]">
                            {box.createdAt
                              ? new Date(box.createdAt).toLocaleDateString('pt-BR')
                              : 'Data não registrada'}
                          </p>
                        </div>

                        {/* Data de Finalização / Término */}
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                            Término
                          </span>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono text-[11px]">
                            {box.finalizedAt
                              ? new Date(box.finalizedAt).toLocaleDateString('pt-BR')
                              : box.createdAt
                                ? new Date(box.createdAt).toLocaleDateString('pt-BR')
                                : 'Concluída'}
                          </p>
                        </div>

                        {/* Meta Planejada */}
                        <div className="space-y-0.5 col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium block">
                            Meta Planejada
                          </span>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono text-[11px]">
                            {box.targetAmount && box.targetAmount > 0
                              ? formatCurrency(box.targetAmount)
                              : 'Meta livre'}
                          </p>
                        </div>
                      </div>

                      {/* Visual completed progress bar */}
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                        <div className="w-full h-1.5 bg-emerald-100 dark:bg-emerald-950/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-end text-[11px] text-zinc-400">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                            {conclusionLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>

                {/* Botão discreto sem nome com SVG de + no canto direito */}
                {visibleArchivedCount < filteredFinalizedBoxes.length && (
                  <div className="pt-2 flex justify-end">
                    <button
                      id="btn-show-more-archived-boxes"
                      type="button"
                      onClick={() => setVisibleArchivedCount((prev) => prev + 4)}
                      aria-label="Carregar mais caixinhas arquivadas"
                      title="Carregar mais caixinhas arquivadas"
                      className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-lg transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 inline-flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
