// Placeholder card shown while match data is loading.
// Uses Tailwind's animate-pulse to create a pulsing grey skeleton.
export const SkeletonMatchCard: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 rounded-full bg-gray-200" />
      <div className="w-10 h-6 rounded bg-gray-200" />
      <div className="w-10 h-10 rounded-full bg-gray-200" />
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
    <div className="flex gap-3">
      <div className="h-9 bg-gray-200 rounded flex-1" />
      <div className="h-9 bg-gray-200 rounded flex-1" />
    </div>
  </div>
);
