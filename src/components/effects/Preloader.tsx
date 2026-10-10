import React, { useEffect, useState } from 'react';

export const Preloader: React.FC = () => {
  // Session check for Instant Load: skip mounting entirely if seen in this session
  const alreadySeen = typeof window !== 'undefined' && Boolean(sessionStorage.getItem('raas_intro_seen'));
  const [isLoaded, setIsLoaded] = useState(alreadySeen);
  const [isUnmounted, setIsUnmounted] = useState(alreadySeen);

  useEffect(() => {
    if (alreadySeen) return;

    // Gentle Temple Bell Sound Hook via Web Audio API (async, non-blocking)
    const playTempleBell = () => {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const audioCtx = new AudioCtx();

        const partials = [
          { freq: 432, gain: 0.12, decay: 2.2 },
          { freq: 864, gain: 0.06, decay: 1.5 },
          { freq: 1296, gain: 0.03, decay: 1.0 },
        ];

        const triggerBell = () => {
          const now = audioCtx.currentTime;
          partials.forEach((p) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(p.freq, now);

            gainNode.gain.setValueAtTime(0.0001, now);
            gainNode.gain.exponentialRampToValueAtTime(p.gain, now + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, now + p.decay);

            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + p.decay);
          });
        };

        if (audioCtx.state === 'suspended') {
          const unlockAudio = () => {
            audioCtx.resume().then(() => triggerBell());
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
          };
          window.addEventListener('click', unlockAudio);
          window.addEventListener('touchstart', unlockAudio);
        } else {
          setTimeout(triggerBell, 80);
        }
      } catch {
        // Audio policy restricted
      }
    };

    playTempleBell();

    const finishLoading = () => {
      setIsLoaded(true);
      try {
        sessionStorage.setItem('raas_intro_seen', '1');
      } catch {
        // Ignore private browsing storage restriction
      }
    };

    // Fast boot: trigger fade-out quickly (40ms) on first frame
    const timer = setTimeout(finishLoading, 40);
    const unmountTimer = setTimeout(() => setIsUnmounted(true), 240);

    return () => {
      clearTimeout(timer);
      clearTimeout(unmountTimer);
    };
  }, [alreadySeen]);

  if (isUnmounted || alreadySeen) return null;

  return (
    <div
      id="preloader"
      className={`cinematic-loader ${isLoaded ? 'loaded' : ''}`.trim()}
      aria-label="Loading Raas Rang Garba Nights 2026"
      role="status"
      onClick={() => setIsLoaded(true)}
      style={{ cursor: isLoaded ? 'default' : 'pointer' }}
    >
      <div className="loader-bg-overlay"></div>
      <div className="loader-particles" id="loader-particles"></div>
      <div className="loader-content">
        <div className="loader-halo">
          <div className="loader-halo-rays"></div>
          <div className="loader-halo-glow"></div>
        </div>
        <div className="loader-logo-wrap">
          <picture>
            <source srcSet="/assets/images/logo-360.webp" type="image/webp" />
            <img
              src="/assets/images/logo-360.webp"
              alt="Raas Rang Official Emblem"
              className="loader-logo"
              width={120}
              height={120}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div className="loader-logo-ring"></div>
        </div>
        <div className="loader-motto-wrap">
          <span className="loader-motto-flourish" aria-hidden="true">
            ❧
          </span>
          <div className="loader-motto">भक्ति • संस्कृति • संगम</div>
          <span className="loader-motto-flourish" aria-hidden="true">
            ❧
          </span>
        </div>
      </div>
    </div>
  );
};
