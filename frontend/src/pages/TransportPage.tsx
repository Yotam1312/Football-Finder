import React from 'react';
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
} from 'lucide-react';

// ─── Quick Info Cards ────────────────────────────────────────────────────────

const INFO_CARDS = [
  {
    icon: MapPin,
    title: 'Stadium Locations',
    description:
      'Most stadiums are located either in city centers or dedicated sports complexes. Check the exact address and nearby landmarks before traveling.',
  },
  {
    icon: Clock,
    title: 'Arrival Timing',
    description:
      'Arrive 1-2 hours before kickoff for international matches, 30-60 minutes for local games. Factor in security checks and crowd gathering.',
  },
  {
    icon: CreditCard,
    title: 'Payment Methods',
    description:
      'Carry both cash and cards. Some transit systems only accept exact change or transit cards, while others accept contactless payments.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description:
      "Download local transit apps, map applications with offline access, and the stadium's official app for parking and entry information.",
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
        title: 'Uber/Lyft',
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
    title: 'Long Distance',
    icon: Bus,
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

// ─── Helpful Resources ────────────────────────────────────────────────────────

interface ResourceItem {
  name: string;
  action: string;
}

interface ResourceColumn {
  category: string;
  items: ResourceItem[];
}

const RESOURCE_COLUMNS: ResourceColumn[] = [
  {
    category: 'Navigation Apps',
    items: [
      { name: 'Google Maps', action: 'Open' },
      { name: 'Apple Maps', action: 'Open' },
      { name: 'Citymapper', action: 'Open' },
    ],
  },
  {
    category: 'Ride Services',
    items: [
      { name: 'Uber', action: 'Download' },
      { name: 'Lyft', action: 'Download' },
      { name: 'Local Taxi Apps', action: 'Search' },
    ],
  },
  {
    category: 'Travel Planning',
    items: [
      { name: 'Rome2Rio', action: 'Open' },
      { name: 'Trainline', action: 'Open' },
      { name: 'Skyscanner', action: 'Open' },
    ],
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

// A single resource row: name left, button right
const ResourceRow: React.FC<{ item: ResourceItem }> = ({ item }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-700">{item.name}</span>
    <button className="flex items-center gap-1.5 border border-gray-200 rounded px-3 py-1 text-sm text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors">
      <ExternalLink className="w-3.5 h-3.5" />
      {item.action}
    </button>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export const TransportPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="min-h-screen bg-green-50 pb-20 md:pb-0"
    >
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Page header — centered */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Transportation &amp; Navigation</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Everything you need to know about getting to football stadiums around the world.
            <br />
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

        {/* Transport sections: Public Transit, Ride Services, Long Distance */}
        {TRANSPORT_SECTIONS.map((section) => (
          <TransportSectionPanel key={section.title} section={section} />
        ))}

        {/* Helpful Resources panel */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Header: standalone green Navigation icon + title (no background box) */}
          <div className="flex items-center gap-2 mb-6">
            <Navigation className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-800">Helpful Resources</h2>
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

      </div>
    </motion.div>
  );
};
