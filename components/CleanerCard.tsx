import React from 'react';
import { Cleaner } from '../../types';

// --------------------
// Internal Icon Components
// (Inlined to prevent "module not found" errors)
// --------------------

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const RocketLaunchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436-1.676 1.304-3.831 2.229-6.231 2.47a12.536 12.536 0 01-1.75 2.458c-1.4 1.4-3.36 2.35-5.574 2.35a.75.75 0 01-.75-.75c0-1.952.82-3.735 2.114-5.029.686-.687 1.53-1.212 2.46-1.524a16.273 16.273 0 012.64-5.077zM14.658 10.563a9.722 9.722 0 00-3.935-3.935 58.837 58.837 0 013.935 3.935zm-7.214 7.214a8.22 8.22 0 01-2.99 1.35 9.721 9.721 0 001.35-2.99 8.221 8.221 0 011.64 1.64z" clipRule="evenodd" />
  </svg>
);

const CheckBadgeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

// --------------------
// Main Component
// --------------------

interface CleanerCardProps {
  cleaner: Cleaner;
  onClick: () => void;
}

export const CleanerCard: React.FC<CleanerCardProps> = ({ cleaner, onClick }) => {
  const locationString = cleaner.city === 'Other' && cleaner.otherCity ? cleaner.otherCity : cleaner.city;
  
  // 🛡️ SAFETY SHIELD: Prevent "toFixed is not a function" crash
  // We convert the rating to a Number immediately. If it fails, we default to 0.
  const safeRating = Number(cleaner.rating) || 0;

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative">
        <img className="h-56 w-full object-cover" src={cleaner.photoUrl} alt={cleaner.name} />
        
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <StarIcon className="w-4 h-4 text-yellow-400" />
          {/* Use the safeRating variable instead of raw data */}
          <span>{safeRating.toFixed(1)}</span>
        </div>

        {cleaner.subscriptionTier !== 'Free' && (
             <div className={`absolute top-2 left-2 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg ${
                cleaner.subscriptionTier === 'Premium' ? 'bg-gradient-to-r from-purple-500 to-indigo-600' :
                cleaner.subscriptionTier === 'Pro' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                cleaner.subscriptionTier === 'Standard' ? 'bg-gradient-to-r from-green-500 to-teal-500' : ''
             }`}>
                <RocketLaunchIcon className="w-4 h-4" />
                <span>{cleaner.subscriptionTier.toUpperCase()}</span>
             </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-bold text-dark">{cleaner.name}</h3>
            {cleaner.isVerified && <CheckBadgeIcon className="w-5 h-5 text-secondary" />}
        </div>
        <p className="text-sm text-gray-600 font-medium flex items-center">
            <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
            {locationString}, {cleaner.state}
        </p>
         <div className="mt-2">
            {cleaner.chargeHourly ? (
                <>
                    <span className="text-xl font-bold text-primary">
                        ₦{Number(cleaner.chargeHourly).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                        /hour
                    </span>
                </>
            ) : cleaner.chargeDaily ? (
                <>
                    <span className="text-xl font-bold text-primary">
                        ₦{Number(cleaner.chargeDaily).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                        /day
                    </span>
                </>
            ) : cleaner.chargePerContract ? (
                 <>
                    <span className="text-xl font-bold text-primary">
                        ₦{Number(cleaner.chargePerContract).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                        /contract
                    </span>
                </>
            ) : cleaner.chargePerContractNegotiable ? (
                <span className="text-xl font-bold text-primary">Negotiable</span>
            ) : (
                <span className="text-lg font-semibold text-gray-700">Contact for price</span>
            )}
        </div>
        <div className="mt-3">
          {cleaner.serviceTypes && cleaner.serviceTypes.slice(0, 2).map((service) => (
            <span key={service} className="inline-block bg-green-100 text-primary text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full mb-1">
              {service}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-4">
              <button
                onClick={onClick}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Book Now
              </button>
        </div>
      </div>
    </div>
  );
};