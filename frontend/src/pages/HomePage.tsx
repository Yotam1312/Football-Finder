import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Returns a YYYY-MM-DD date string for today + offsetDays in the browser's local time.
// We use local time because the user thinks in terms of their local calendar.
// Example: getDateString(0) → '2026-03-22', getDateString(1) → '2026-03-23'
function getDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  // toISOString() gives UTC — we need local date, so build it manually
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Returns [fromDate, toDate] for "This Weekend" based on today's day of week.
// Rules (per product decision):
//   Mon–Fri → coming Saturday to coming Sunday
//   Saturday → today (Sat) to tomorrow (Sun)
//   Sunday → today (Sun) to today (Sun)   [it's the last day of the weekend]
function getWeekendDates(): [string, string] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  if (dayOfWeek === 6) {
    // Saturday: show Sat → Sun
    return [getDateString(0), getDateString(1)];
  } else if (dayOfWeek === 0) {
    // Sunday: only today left in the weekend
    return [getDateString(0), getDateString(0)];
  } else {
    // Mon–Fri: jump to the coming Saturday
    const daysUntilSat = 6 - dayOfWeek;
    return [getDateString(daysUntilSat), getDateString(daysUntilSat + 1)];
  }
}

// Three hardcoded testimonials — swap for real ones before public launch (Phase 5)
const TESTIMONIALS = [
  {
    id: 1,
    name: 'James O.',
    location: 'London, UK',
    text: 'Found a Champions League match in Madrid the night before I arrived. Bought tickets in minutes. Absolutely brilliant.',
  },
  {
    id: 2,
    name: 'Sophie L.',
    location: 'Paris, France',
    text: 'Travelling through Germany for a week. Football Finder showed me three games I could catch along the way. Perfect trip.',
  },
  {
    id: 3,
    name: 'Marco R.',
    location: 'Milan, Italy',
    text: 'I use this every time I travel for work. Always find something to watch. The stadium navigation is a lifesaver.',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [city, setCity] = useState('');
  const [from, setFrom] = useState('');
  const [to,   setTo]   = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError,   setLocationError]   = useState('');

  // Derive which quick-select chip is active by comparing the current from/to values
  // against what each preset would set. No extra state needed — derived purely from from/to.
  // This means manually editing the date inputs automatically clears the highlight.
  const todayStr     = getDateString(0);
  const tomorrowStr  = getDateString(1);
  const [weekendFrom, weekendTo] = getWeekendDates();

  const activeChip: 'today' | 'tomorrow' | 'weekend' | null =
    from === todayStr    && to === todayStr    ? 'today'    :
    from === tomorrowStr && to === tomorrowStr ? 'tomorrow' :
    from === weekendFrom && to === weekendTo   ? 'weekend'  :
    null;

  // Each chip knows what to set from/to to when clicked
  const quickSelectChips = [
    {
      id: 'today'    as const,
      label: 'Today',
      onClick: () => { setFrom(todayStr);    setTo(todayStr); },
    },
    {
      id: 'tomorrow' as const,
      label: 'Tomorrow',
      onClick: () => { setFrom(tomorrowStr); setTo(tomorrowStr); },
    },
    {
      id: 'weekend'  as const,
      label: 'This Weekend',
      onClick: () => { setFrom(weekendFrom); setTo(weekendTo); },
    },
  ];

  // Navigate to /results with search params in the URL.
  // The results page reads these params — no state is passed directly.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !from || !to) return;
    const params = new URLSearchParams({ city, from, to });
    navigate(`/results?${params}`);
  };

  // Use the browser's geolocation API to get the user's current city.
  // Nominatim (OpenStreetMap) reverse geocodes the lat/lon to a city name.
  // No API key needed — Nominatim is free for low-volume requests.
  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lon } = position.coords;
          // Nominatim usage policy: must include a User-Agent header
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'User-Agent': 'FootballFinder/1.0' } }
          );
          const data = await res.json();
          // Nominatim returns city, town, or village depending on location type
          const cityName = data.address?.city ?? data.address?.town ?? data.address?.village ?? '';
          setCity(cityName);
          // Pre-fill only — user reviews and submits manually to avoid incorrect auto-submit
        } catch {
          setLocationError('Could not determine your city. Please type it manually.');
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationError('Location access denied. Please type your city manually.');
        setLocationLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Hero section — green background per BRIEF.md */}
      <section className="bg-green-700 text-white py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-4"
          >
            Find Football Matches,<br />Anywhere, Anytime
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-green-100 text-lg mb-10"
          >
            Search upcoming fixtures across Europe's top leagues.
          </motion.p>

          {/* Search form — city → start date → end date, stacked vertically */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 shadow-xl text-left space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. London, Munich, Madrid"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              {locationError && (
                <p className="text-red-500 text-xs mt-1">{locationError}</p>
              )}
            </div>

            {/* Quick-select date chips — one click fills From/To without typing */}
            <div className="flex flex-wrap gap-2">
              {quickSelectChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={chip.onClick}
                  className={
                    // Active chip gets a solid green background; inactive chips are outlined
                    activeChip === chip.id
                      ? 'px-4 py-1.5 rounded-full text-sm font-medium bg-green-600 text-white border border-green-600 transition-colors'
                      : 'px-4 py-1.5 rounded-full text-sm font-medium bg-white text-green-700 border border-green-400 hover:bg-green-50 transition-colors'
                  }
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* grid-cols-1 on mobile so date inputs don't get too narrow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Two buttons: "Use Current Location" (outline) + "Find Matches" (solid green) */}
            {/* flex-col on mobile so buttons get full width; sm:flex-row side-by-side on wider screens */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locationLoading}
                className="flex-1 border border-green-600 text-green-600 hover:bg-green-50 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-60 min-h-[48px]"
              >
                {locationLoading ? 'Locating...' : 'Use Current Location'}
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors min-h-[48px]"
              >
                Find Matches
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">
            Travellers love Football Finder
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
