import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CountryGridProps {
  onSelect: (country: string) => void;
}

// The 5 countries tracked by the sync job. Flags are hardcoded because
// the DB doesn't store flag emojis — it only stores the country name string.
const COUNTRIES = [
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Spain',   flag: '🇪🇸' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Italy',   flag: '🇮🇹' },
  { name: 'France',  flag: '🇫🇷' },
];

export const CountryGrid: React.FC<CountryGridProps> = ({ onSelect }) => {
  const navigate = useNavigate();

  const handleSelect = (country: string) => {
    onSelect(country);
    // Use lowercase for the URL slug (e.g. /fanbase/england)
    navigate('/fanbase/' + country.toLowerCase());
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {COUNTRIES.map(({ name, flag }) => (
        <button
          key={name}
          onClick={() => handleSelect(name)}
          className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all cursor-pointer p-6 flex flex-col items-center gap-3 w-full"
        >
          <span className="text-5xl">{flag}</span>
          <span className="text-sm font-medium text-gray-700">{name}</span>
        </button>
      ))}
    </div>
  );
};
