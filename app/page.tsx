'use client'

import React from 'react';
import { TeamSparkNavbar } from './components/TeamSparkNavbar';
import { TeamSparkSidebar } from './components/TeamSparkSidebar';
import { TeamSparkFeed } from './components/TeamSparkFeed';
import { TeamSparkRightPanel } from './components/TeamSparkRightPanel';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <TeamSparkNavbar />

      <div className="flex pt-16">
        <TeamSparkSidebar />
        <TeamSparkFeed />
        <TeamSparkRightPanel />
      </div>
    </main>
  );
}