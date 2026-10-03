import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Preloader } from './components/effects/Preloader';
import { ParticleCanvas } from './components/effects/ParticleCanvas';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Events } from './components/sections/Events';
import { Stats } from './components/sections/Stats';
import { Schedule } from './components/sections/Schedule';
import { Tickets } from './components/sections/Tickets';
import { Sponsors } from './components/sections/Sponsors';
import { Gallery } from './components/sections/Gallery';
import { Venue } from './components/sections/Venue';
import { Contact } from './components/sections/Contact';

const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminScanner = lazy(() =>
  import('./components/admin/AdminScanner').then((m) => ({ default: m.AdminScanner }))
);

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Separate Admin & Scanner Routes
  if (currentPath === '/admin/scan' || currentPath === '/admin/scan/') {
    return (
      <Suspense fallback={<div style={{ padding: 40, color: '#f0b429', textAlign: 'center' }}>Loading Scanner...</div>}>
        <AdminScanner />
      </Suspense>
    );
  }

  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    return (
      <Suspense fallback={<div style={{ padding: 40, color: '#f0b429', textAlign: 'center' }}>Loading Admin Portal...</div>}>
        <AdminDashboard />
      </Suspense>
    );
  }
  return (
    <>
      {/* 1. Cinematic Opening Experience */}
      <Preloader />

      {/* Floating Golden Particles Canvas */}
      <ParticleCanvas />

      {/* Sticky Navigation */}
      <Navbar />

      {/* Main Page Content */}
      <main id="main-content">
        <Hero />
        <About />
        <Events />
        <Stats />
        <Schedule />
        <Tickets />
        <Sponsors />
        <Gallery />
        <Venue />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default App;
