import React from 'react';
import ScratchCardsLobby from '../components/ScratchCardsLobby';

export default function ScratchCards() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <ScratchCardsLobby />
      </div>
    </div>
  );
}
