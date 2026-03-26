import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MapPin, Plane, Clock, CreditCard, Lightbulb,
  Smartphone, Wallet, Car, Users, Navigation, ChevronLeft, Map,
} from 'lucide-react';
import type { StadiumDetail } from '../types';

// ─────────────────────────────────────────────
// Shared section card wrapper — keeps all sections visually consistent
// ─────────────────────────────────────────────
interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-slate-600">{icon}</span>
      <h2 className="text-base font-bold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export const StadiumDetailPage: React.FC = () => {
  const { stadiumId } = useParams<{ stadiumId: string }>();
  const id = parseInt(stadiumId ?? '', 10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['stadium', id],
    queryFn: async () => {
      const res = await fetch(`/api/stadiums/${id}`);
      if (!res.ok) throw new Error('Failed to fetch stadium');
      return res.json() as Promise<{ stadium: StadiumDetail }>;
    },
    enabled: !isNaN(id),
  });

  // ── Loading state ──────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="h-48 bg-slate-800 animate-pulse" />
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-32 animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────
  if (isError || !data?.stadium) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <MapPin className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Stadium not found</h2>
        <p className="text-gray-500 text-sm mb-6">We couldn't load this stadium's transport guide.</p>
        <Link to="/stadiums" className="text-slate-600 font-medium hover:underline">
          ← Back to Stadium Guide
        </Link>
      </div>
    );
  }

  const { stadium } = data;
  const {
    name, city, googleMapsUrl, primaryTeam, latitude, longitude,
    nearbyMetros, nearbyTrains, nearbyBuses,
    walkingTimeFromCenter, publicTransportInfo, parkingInfo,
    fromAirportInfo, travelTimesInfo, paymentInfo,
    proTips, recommendedApps,
    budgetCheap, budgetStandard, budgetComfort,
    gettingTherePosts,
  } = stadium;

  // Null-guard arrays — pre-migration rows may have null instead of []
  const metros = nearbyMetros ?? [];
  const trains = nearbyTrains ?? [];
  const buses  = nearbyBuses  ?? [];
  const tips   = proTips       ?? [];
  const apps   = recommendedApps ?? [];
  const communityTips = gettingTherePosts ?? [];

  const hasTransportLines = metros.length > 0 || trains.length > 0 || buses.length > 0;
  const hasBudget = budgetCheap || budgetStandard || budgetComfort;

  // Build a Google Maps fallback URL if the DB doesn't have one
  const mapsUrl = googleMapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="min-h-screen bg-gray-100 pb-20 md:pb-0"
    >
      {/* ── Hero ────────────────────────────── */}
      <section
        className="text-white px-4 pt-10 pb-12"
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}
      >
        {/* Back link */}
        <div className="max-w-3xl mx-auto mb-6">
          <Link
            to="/stadiums"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Stadium Guide
          </Link>
        </div>

        <div className="max-w-3xl mx-auto flex items-start gap-4">
          {/* Team badge */}
          {primaryTeam?.logoUrl && (
            <img
              src={primaryTeam.logoUrl}
              alt={primaryTeam.name}
              className="w-14 h-14 object-contain flex-shrink-0 mt-1"
            />
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1">
              {name}
            </h1>
            <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-1">
              <MapPin className="w-4 h-4" />
              <span>{city}</span>
            </div>
            {primaryTeam && (
              <p className="text-slate-400 text-sm">{primaryTeam.name}</p>
            )}
          </div>
        </div>

        {/* Get Directions button */}
        <div className="max-w-3xl mx-auto mt-6">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </a>
        </div>
      </section>

      {/* ── Map ─────────────────────────────── */}
      {latitude != null && longitude != null && (
        <div className="max-w-3xl mx-auto px-4 pt-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 pt-5 pb-3">
              <Map className="w-5 h-5 text-slate-600" />
              <h2 className="text-base font-bold text-gray-800">Location</h2>
            </div>
            <iframe
              title={`Map of ${name}`}
              width="100%"
              className="h-[280px] md:h-[360px]"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`}
              style={{ border: 0 }}
            />
          </div>
        </div>
      )}

      {/* ── Content sections ────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* 1. Transport Overview — metro, train, bus, walking */}
        {(hasTransportLines || walkingTimeFromCenter || publicTransportInfo) && (
          <SectionCard icon={<MapPin className="w-5 h-5" />} title="Getting There">
            <div className="space-y-4">
              {metros.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Metro</p>
                  <div className="flex flex-wrap gap-2">
                    {metros.map(line => (
                      <span key={line} className="bg-green-50 text-green-700 border border-green-200 text-sm font-medium px-3 py-1 rounded-full">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {trains.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Train</p>
                  <div className="flex flex-wrap gap-2">
                    {trains.map(line => (
                      <span key={line} className="bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium px-3 py-1 rounded-full">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {buses.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Bus</p>
                  <div className="flex flex-wrap gap-2">
                    {buses.map(line => (
                      <span key={line} className="bg-amber-50 text-amber-700 border border-amber-200 text-sm font-medium px-3 py-1 rounded-full">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {walkingTimeFromCenter && (
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Walking</p>
                  <p className="text-sm text-gray-700">{walkingTimeFromCenter}</p>
                </div>
              )}

              {publicTransportInfo && (
                <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                  <p className="text-sm text-green-800">{publicTransportInfo}</p>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* 2. From Airport */}
        {fromAirportInfo && (
          <SectionCard icon={<Plane className="w-5 h-5" />} title="From the Airport">
            <p className="text-sm text-gray-700 leading-relaxed">{fromAirportInfo}</p>
          </SectionCard>
        )}

        {/* 3. Travel Times */}
        {travelTimesInfo && (
          <SectionCard icon={<Clock className="w-5 h-5" />} title="Travel Times">
            <p className="text-sm text-gray-700 leading-relaxed">{travelTimesInfo}</p>
          </SectionCard>
        )}

        {/* 4. Budget Breakdown */}
        {hasBudget && (
          <SectionCard icon={<Wallet className="w-5 h-5" />} title="Budget Breakdown">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {budgetCheap && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Budget</p>
                  <p className="text-sm text-green-800 leading-snug">{budgetCheap}</p>
                </div>
              )}
              {budgetStandard && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Standard</p>
                  <p className="text-sm text-blue-800 leading-snug">{budgetStandard}</p>
                </div>
              )}
              {budgetComfort && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-1">Comfort</p>
                  <p className="text-sm text-purple-800 leading-snug">{budgetComfort}</p>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* 5. Payment Methods */}
        {paymentInfo && (
          <SectionCard icon={<CreditCard className="w-5 h-5" />} title="Payment Methods">
            <p className="text-sm text-gray-700 leading-relaxed">{paymentInfo}</p>
          </SectionCard>
        )}

        {/* 6. Pro Tips */}
        {tips.length > 0 && (
          <SectionCard icon={<Lightbulb className="w-5 h-5" />} title="Pro Tips">
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  {/* Numbered badge */}
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* 7. Recommended Apps */}
        {apps.length > 0 && (
          <SectionCard icon={<Smartphone className="w-5 h-5" />} title="Recommended Apps">
            <div className="flex flex-wrap gap-2">
              {apps.map(app => (
                <span
                  key={app}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-full"
                >
                  {app}
                </span>
              ))}
            </div>
          </SectionCard>
        )}

        {/* 8. Parking */}
        {parkingInfo && (
          <SectionCard icon={<Car className="w-5 h-5" />} title="Parking">
            <p className="text-sm text-gray-700 leading-relaxed">{parkingInfo}</p>
          </SectionCard>
        )}

        {/* 9. Community Tips — GETTING_THERE posts from FanBase */}
        {communityTips.length > 0 && (
          <SectionCard icon={<Users className="w-5 h-5" />} title="Fan Tips">
            <div className="space-y-4">
              {communityTips.map(post => (
                <div key={post.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <p className="text-sm font-semibold text-gray-800 mb-1">{post.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{post.body}</p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {post.transportType && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full">{post.transportType}</span>
                    )}
                    {post.travelCost && <span>{post.travelCost}</span>}
                    {post.travelTime && <span>{post.travelTime} min</span>}
                    <span>by {post.authorName}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Link to the full FanBase page for this team */}
            {primaryTeam && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/fanbase/team/${primaryTeam.id}`}
                  className="text-sm font-medium text-green-600 hover:text-green-700"
                >
                  See all fan posts for {primaryTeam.name} →
                </Link>
              </div>
            )}
          </SectionCard>
        )}

        {/* Empty state — no transport data at all */}
        {!hasTransportLines && !fromAirportInfo && !travelTimesInfo && !hasBudget &&
         tips.length === 0 && communityTips.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Transport details for this stadium haven't been added yet.
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-slate-600 font-medium text-sm hover:underline"
            >
              <Navigation className="w-4 h-4" />
              Open in Google Maps
            </a>
          </div>
        )}

      </div>
    </motion.div>
  );
};
