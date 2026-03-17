import React from 'react';
import { motion } from 'framer-motion';

// Each service has a name, short description, and link to its website or app.
interface TransportService {
  name: string;
  description: string;
  url: string;
  linkText: string;
}

// Service data for the Public Transit section
const PUBLIC_TRANSIT: TransportService[] = [
  {
    name: 'Citymapper',
    description:
      'The best public transit app for European cities. Covers metro, bus, tram, and bike. Works offline.',
    url: 'https://citymapper.com',
    linkText: 'Open app',
  },
  {
    name: 'Google Maps',
    description:
      "Works everywhere in Europe. Tap 'Directions' and choose the transit icon for step-by-step journey planning.",
    url: 'https://maps.google.com',
    linkText: 'Visit website',
  },
];

// Service data for the Ride Services section
const RIDE_SERVICES: TransportService[] = [
  {
    name: 'Uber',
    description:
      'Available in most European cities. Book a ride directly to the stadium — book early on match days as surge pricing applies.',
    url: 'https://uber.com',
    linkText: 'Open app',
  },
  {
    name: 'Bolt',
    description: 'Often cheaper than Uber. Strong coverage in Central and Eastern Europe.',
    url: 'https://bolt.eu',
    linkText: 'Open app',
  },
  {
    name: 'Free Now (MyTaxi)',
    description: 'Official licensed taxis across Western Europe. No surge pricing.',
    url: 'https://free-now.com',
    linkText: 'Open app',
  },
];

// Service data for the Long-Distance Travel section
const LONG_DISTANCE: TransportService[] = [
  {
    name: 'Trainline',
    description: 'Book train tickets across Europe in one place. Early booking gets the cheapest fares.',
    url: 'https://trainline.com',
    linkText: 'Visit website',
  },
  {
    name: 'FlixBus',
    description:
      'Affordable long-distance coaches connecting hundreds of European cities. Book online or in-app.',
    url: 'https://flixbus.com',
    linkText: 'Visit website',
  },
  {
    name: 'Omio',
    description:
      'Compare trains, buses, and flights across Europe. Stores tickets in the app for easy access.',
    url: 'https://omio.com',
    linkText: 'Visit website',
  },
];

// Reusable card for a single transport service
const ServiceCard: React.FC<{ service: TransportService }> = ({ service }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.name}</h3>
    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-green-600 font-medium hover:text-green-700 transition-colors"
    >
      {service.linkText} →
    </a>
  </div>
);

// Section with a heading and a responsive grid of service cards
const TransportSection: React.FC<{ title: string; services: TransportService[] }> = ({
  title,
  services,
}) => (
  <section className="mb-10">
    <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">{title}</h2>
    <div className="grid sm:grid-cols-2 gap-4">
      {services.map((service) => (
        <ServiceCard key={service.name} service={service} />
      ))}
    </div>
  </section>
);

// Transportation Guide page — static informational page covering how to
// get to and around European football stadiums. No backend calls needed.
export const TransportPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Getting to the Match</h1>
          <p className="text-gray-600">
            Everything you need to get around European cities on match day.
          </p>
        </div>
        <TransportSection title="Public Transit" services={PUBLIC_TRANSIT} />
        <TransportSection title="Ride Services" services={RIDE_SERVICES} />
        <TransportSection title="Long-Distance Travel" services={LONG_DISTANCE} />
      </div>
    </motion.div>
  );
};
