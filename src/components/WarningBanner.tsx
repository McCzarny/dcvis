import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export const WarningBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between z-[1400] relative">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-900">
          <span className="font-semibold">Uwaga:</span> Projekt jest w fazie rozwoju. Wszelkie dane i funkcjonalności są poglądowe i wymagają dalszej weryfikacji.
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-4 p-1 hover:bg-amber-100 rounded transition-colors flex-shrink-0"
        aria-label="Zamknij powiadomienie"
      >
        <X className="w-5 h-5 text-amber-600" />
      </button>
    </div>
  );
};
