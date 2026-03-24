import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  CreditCard,
  Smartphone,
  Bus,
  Car,
  Navigation,
  ExternalLink,
  Footprints,
  Shield,
  ChevronDown,
  Wallet,
  Train,
} from 'lucide-react';

// ─── Quick Info Cards ────────────────────────────────────────────────────────

const INFO_CARDS = [
  {
    icon: MapPin,
    title: 'Plan Ahead',
    description:
      'Research your route before match day. Check stadium addresses, nearby landmarks, and transport connections. A little preparation goes a long way.',
  },
  {
    icon: Clock,
    title: 'Arrive Early',
    description:
      'Arrive 1-2 hours before kickoff for international matches, 30-60 minutes for local games. Factor in security checks and crowds.',
  },
  {
    icon: CreditCard,
    title: 'Payment Ready',
    description:
      'Carry both cash and cards. Some transit systems only accept exact change or transit cards, while others accept contactless.',
  },
  {
    icon: Smartphone,
    title: 'Download Apps',
    description:
      "Get local transit apps, offline maps, and the stadium official app before you travel. Don't rely on match-day Wi-Fi.",
  },
];

// ─── Transport Sections ───────────────────────────────────────────────────────

interface TransportOption {
  title: string;
  price: string;
  description: string;
  tip: string;
}

interface TransportSectionData {
  title: string;
  icon: React.ElementType;
  iconBg: string;
  options: TransportOption[];
}

const TRANSPORT_SECTIONS: TransportSectionData[] = [
  {
    title: 'Public Transit',
    icon: Bus,
    iconBg: 'bg-blue-500',
    options: [
      {
        title: 'City Bus',
        price: '$2-5 per ride',
        description: 'Most stadiums are accessible via public bus routes',
        tip: "Download the city's transit app for real-time schedules",
      },
      {
        title: 'Metro/Subway',
        price: '$3-8 per ride',
        description: 'Fast and reliable for major stadiums in urban areas',
        tip: 'Buy day passes for multiple trips',
      },
      {
        title: 'Tram/Light Rail',
        price: '$2-6 per ride',
        description: 'Convenient for stadiums with dedicated sports lines',
        tip: 'Check for game day service extensions',
      },
    ],
  },
  {
    title: 'Ride Services',
    icon: Car,
    iconBg: 'bg-green-500',
    options: [
      {
        title: 'Taxi',
        price: '$15-50 depending on distance',
        description: 'Traditional taxi services available in most cities',
        tip: 'Book in advance for popular matches',
      },
      {
        title: 'Uber/Bolt',
        price: '$10-40 + surge pricing',
        description: 'Convenient app-based rides with multiple vehicle options',
        tip: 'Expect surge pricing during major games',
      },
      {
        title: 'Car Rental',
        price: '$30-80 per day + parking',
        description: 'Flexibility to explore multiple venues and cities',
        tip: 'Book parking in advance - stadium parking fills up quickly',
      },
    ],
  },
  {
    title: 'Walking & Cycling',
    icon: Footprints,
    iconBg: 'bg-orange-500',
    options: [
      {
        title: 'On Foot',
        price: 'Free',
        description: 'Many city-center stadiums are walkable from train stations and hotels',
        tip: 'Use Google Maps walking directions — allow extra time on match days for crowds',
      },
      {
        title: 'Bike Rental',
        price: '$5-15 per day',
        description: 'City bike-share schemes are available in most European football cities',
        tip: 'Lock up well away from the stadium — bike parking near grounds fills fast',
      },
      {
        title: 'Cycling Apps',
        price: 'Free to download',
        description: 'Apps like Lime, Tier, and local bike-share apps offer dockless rentals',
        tip: 'Check the app coverage map — not all areas around stadiums are in the service zone',
      },
    ],
  },
  {
    title: 'Long Distance',
    icon: Train,
    iconBg: 'bg-purple-500',
    options: [
      {
        title: 'Intercity Train',
        price: '$25-200 depending on distance',
        description: 'Comfortable travel between cities for away games',
        tip: 'Book early for better prices and seat selection',
      },
      {
        title: 'Coach Bus',
        price: '$15-80 depending on route',
        description: 'Budget-friendly option for longer distances',
        tip: 'Some fan clubs organize group bus trips',
      },
      {
        title: 'Domestic Flights',
        price: '$100-400 depending on route',
        description: 'Quick travel for distant matches',
        tip: 'Consider nearby airports for better deals',
      },
    ],
  },
];

// ─── Helpful Apps ─────────────────────────────────────────────────────────────

interface ResourceItem {
  name: string;
  action: string;
  href: string;
}

interface ResourceColumn {
  category: string;
  items: ResourceItem[];
}

const RESOURCE_COLUMNS: ResourceColumn[] = [
  {
    category: 'Navigation Apps',
    items: [
      { name: 'Google Maps', action: 'Open', href: 'https://maps.google.com' },
      { name: 'Apple Maps', action: 'Open', href: 'https://maps.apple.com' },
      { name: 'Citymapper', action: 'Open', href: 'https://citymapper.com' },
    ],
  },
  {
    category: 'Ride Services',
    items: [
      { name: 'Uber', action: 'Download', href: 'https://www.uber.com' },
      { name: 'Bolt', action: 'Download', href: 'https://bolt.eu' },
      { name: 'Local Taxi Apps', action: 'Search', href: 'https://www.google.com/search?q=local+taxi+app' },
    ],
  },
  {
    category: 'Travel Planning',
    items: [
      { name: 'Rome2Rio', action: 'Open', href: 'https://www.rome2rio.com' },
      { name: 'Trainline', action: 'Open', href: 'https://www.thetrainline.com' },
      { name: 'Skyscanner', action: 'Open', href: 'https://www.skyscanner.com' },
    ],
  },
];

// ─── Payment Tips ─────────────────────────────────────────────────────────────

const PAYMENT_TIPS = [
  { icon: '💵', title: 'Cash', detail: 'Always carry local currency in small denominations. Street vendors, parking attendants, and some older transit systems only accept cash.' },
  { icon: '💳', title: 'Cards & Contactless', detail: 'Visa and Mastercard are widely accepted. Contactless (tap-to-pay) works on most modern transit networks in Western Europe.' },
  { icon: '🎫', title: 'Transit Cards', detail: 'Cities like London (Oyster), Paris (Navigo), and Amsterdam (OV-chipkaart) have reloadable transit cards. Buy one on arrival for cheaper fares.' },
  { icon: '💱', title: 'Currency Tips', detail: 'Avoid airport currency exchanges — rates are poor. Use ATMs or your bank card abroad. Notify your bank before travelling to prevent blocks.' },
];

// ─── Safety Tips ──────────────────────────────────────────────────────────────

const SAFETY_TIPS = [
  'Keep your phone charged — download an offline map in case you lose signal near the stadium.',
  'Stay with your group at night, especially in unfamiliar cities after late kickoffs.',
  'Use official taxi ranks outside the stadium — avoid unmarked cars.',
  'Share your travel plan with someone at home so they know your route.',
  'Watch your belongings on crowded public transport — pickpockets target match-day crowds.',
  'Ask stadium stewards for directions if you get lost — they know the area best.',
];

// ─── FAQ Items ────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: 'Is public transport safe on match days?',
    answer: 'Yes, public transport is generally very safe on match days. Cities with major football clubs run extra services and increase staff and security presence. Stick to well-lit, busy routes and you will be fine.',
  },
  {
    question: 'How early should I arrive at the stadium?',
    answer: 'For international or high-profile matches, aim to arrive 1.5-2 hours early. For regular league games, 45-60 minutes is usually enough. This gives you time for security checks, finding your seat, and soaking up the atmosphere.',
  },
  {
    question: 'Do I need cash or can I use cards?',
    answer: 'It depends on the city. Western European stadiums and transit systems mostly accept contactless cards. In Eastern Europe and South America, cash is still common for local transport. Carry both to be safe.',
  },
  {
    question: 'What if I miss the last train or bus after the match?',
    answer: 'Most cities extend public transport for major matches, but always check schedules beforehand. Have a backup plan: save a local taxi number, keep a ride-hailing app installed, or book a hotel within walking distance of the stadium.',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

// Single transport option column — sits inside a section panel separated by dividers
const TransportOptionCol: React.FC<{ option: TransportOption }> = ({ option }) => (
  <div className="px-6">
    {/* Title + price badge on the same row */}
    <div className="flex items-center gap-3 mb-2">
      <h3 className="font-semibold text-gray-800">{option.title}</h3>
      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
        {option.price}
      </span>
    </div>

    {/* Short description */}
    <p className="text-sm text-gray-500 mb-3">{option.description}</p>

    {/* Tip callout — green left border with lightbulb emoji */}
    <div className="border-l-2 border-green-400 pl-3">
      <p className="text-sm text-green-600">💡 Tip: {option.tip}</p>
    </div>
  </div>
);

// Full transport section panel with icon header and 3-column divider grid
const TransportSectionPanel: React.FC<{ section: TransportSectionData }> = ({ section }) => {
  const Icon = section.icon;
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
      {/* Section header: colored icon square + section title */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 ${section.iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{section.title}</h2>
      </div>

      {/* 3 columns separated by vertical dividers — stacks to 1 col on small screens */}
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {section.options.map((option) => (
          <TransportOptionCol key={option.title} option={option} />
        ))}
      </div>
    </div>
  );
};

// A single resource row: name left, real external link button right
const ResourceRow: React.FC<{ item: ResourceItem }> = ({ item }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-700">{item.name}</span>
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 border border-gray-200 rounded px-3 py-1 text-sm text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors"
    >
      <ExternalLink className="w-3.5 h-3.5" />
      {item.action}
    </a>
  </div>
);

// FAQ accordion item — expands/collapses on click, shows ChevronDown rotated when open
const FaqItem: React.FC<{ item: typeof FAQ_ITEMS[number]; isOpen: boolean; onToggle: () => void }> = ({
  item,
  isOpen,
  onToggle,
}) => (
  <div className="border-b border-gray-100 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 text-left"
    >
      <span className="font-medium text-gray-800 pr-4">{item.question}</span>
      <ChevronDown
        className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    {isOpen && (
      <p className="text-sm text-gray-600 pb-4 leading-relaxed">{item.answer}</p>
    )}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export const TransportPage: React.FC = () => {
  // Track which FAQ item is open — null means all closed, a number means that index is open
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="min-h-screen bg-green-50 pb-20 md:pb-0"
    >
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Hero section — green gradient with white text */}
        <div className="bg-gradient-to-br from-green-800 to-green-600 rounded-2xl p-8 md:p-12 mb-8 text-white text-center">
          <div className="text-5xl mb-4">🚦</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Transportation & Navigation</h1>
          <p className="text-green-100 text-base leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about getting to football stadiums around the world.
            Make your match day journey as smooth as the beautiful game itself.
          </p>
        </div>

        {/* 4 quick-tip info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {INFO_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white rounded-xl shadow-sm p-5 text-center">
                {/* Green icon in a light-green rounded square */}
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-2">{card.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>

        {/* Transport sections: Public Transit, Ride Services, Walking & Cycling, Long Distance */}
        {TRANSPORT_SECTIONS.map((section) => (
          <TransportSectionPanel key={section.title} section={section} />
        ))}

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Payment Methods</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {PAYMENT_TIPS.map((tip) => (
              <div key={tip.title} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                <span className="text-2xl shrink-0">{tip.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{tip.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{tip.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Safety Tips</h2>
          </div>
          <div className="space-y-3">
            {SAFETY_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Helpful Apps panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          {/* Header: standalone green Navigation icon + title */}
          <div className="flex items-center gap-2 mb-6">
            <Navigation className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-800">Helpful Apps</h2>
          </div>

          {/* 3-column resource grid — stacks to 1 col on small screens */}
          <div className="grid sm:grid-cols-3 gap-6">
            {RESOURCE_COLUMNS.map((col) => (
              <div key={col.category}>
                <h3 className="font-semibold text-gray-800 mb-2">{col.category}</h3>
                {col.items.map((item) => (
                  <ResourceRow key={item.name} item={item} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FAQs — accordion, one open at a time */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">?</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Frequently Asked Questions</h2>
          </div>
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>

      </div>
    </motion.div>
  );
};
