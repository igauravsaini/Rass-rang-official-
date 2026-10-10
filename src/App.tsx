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

import { Venue } from './components/sections/Venue';
import { Contact } from './components/sections/Contact';

const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminScanner = lazy(() =>
  import('./components/admin/AdminScanner').then((m) => ({ default: m.AdminScanner }))
);

const BookingModal = lazy(() =>
  import('./components/booking/BookingModal').then((m) => ({ default: m.BookingModal }))
);
import { PassCode } from './types/booking';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<PassCode>('COUPLE');

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [selectedMode, setSelectedMode] = useState<'online' | 'offline'>('offline');

  // Listen for global Book Now triggers (Navbar, Hero, Tickets section, etc.)
  useEffect(() => {
    const handleOpenBooking = (e: Event) => {
      const customEvent = e as CustomEvent<{ passType?: PassCode; passMode?: 'online' | 'offline' }>;
      const pass = customEvent.detail?.passType || 'COUPLE';
      const mode = customEvent.detail?.passMode || 'offline';
      setSelectedPass(pass);
      setSelectedMode(mode);
      setBookingOpen(true);
    };

    window.addEventListener('open-booking-modal', handleOpenBooking);
    return () => window.removeEventListener('open-booking-modal', handleOpenBooking);
  }, []);

  // Always start from Home (top of page) on fresh load / reload
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    if (!currentPath.startsWith('/admin')) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      // If refreshed with an anchor hash, reset so user always experiences the Hero first
      if (window.location.hash && window.location.hash !== '#home') {
        history.replaceState(null, '', window.location.pathname);
      }
    }
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

        <Venue />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Booking Overlay Modal with Background Blur */}
      {bookingOpen && (
        <Suspense fallback={null}>
          <BookingModal
            isOpen={bookingOpen}
            onClose={() => setBookingOpen(false)}
            defaultPass={selectedPass}
            defaultMode={selectedMode}
          />
        </Suspense>
      )}
    </>
  );
};

export default App;
