import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CountryGridProps {
  onSelect: (country: string) => void;
}

// We use flagcdn.com images instead of emoji flags because Windows doesn't
// render subdivision flags (like England's 🏴󠁧󠁢󠁥󠁮󠁧󠁿) consistently across browsers.
const COUNTRIES = [
  { name: 'England', flagUrl: 'https://flagcdn.com/gb-eng.svg' },
  { name: 'Spain',   flagUrl: 'https://flagcdn.com/es.svg' },
  { name: 'Germany', flagUrl: 'https://flagcdn.com/de.svg' },
  { name: 'Italy',   flagUrl: 'https://flagcdn.com/it.svg' },
  { name: 'France',  flagUrl: 'https://flagcdn.com/fr.svg' },
];

export const CountryGrid: React.FC<CountryGridProps> = ({ onSelect }) => {
  const navigate = useNavigate();

  const handleSelect = (country: string) => {
    onSelect(country);
    navigate('/fanbase/' + country.toLowerCase());
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {COUNTRIES.map(({ name, flagUrl }) => (
        <button
          key={name}
          onClick={() => handleSelect(name)}
          className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all cursor-pointer p-6 flex flex-col items-center gap-3 w-full"
        >
          <img
            src={flagUrl}
            alt={`${name} flag`}
            className="w-16 h-10 object-cover rounded shadow-sm"
          />
          <span className="text-sm font-medium text-gray-700">{name}</span>
        </button>
      ))}
    </div>
  );
};
