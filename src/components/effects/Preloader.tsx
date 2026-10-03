import React, { useEffect, useState } from 'react';

export const Preloader: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Gentle Temple Bell Sound Hook via Web Audio API
    const playTempleBell = () => {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const audioCtx = new AudioCtx();

        const partials = [
          { freq: 432, gain: 0.15, decay: 3.8 },
          { freq: 864, gain: 0.08, decay: 2.8 },
          { freq: 1296, gain: 0.04, decay: 2.0 },
          { freq: 2160, gain: 0.02, decay: 1.2 },
        ];

        const triggerBell = () => {
          const now = audioCtx.currentTime;
          partials.forEach((p) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(p.freq, now);

            gainNode.gain.setValueAtTime(0.0001, now);
            gainNode.gain.exponentialRampToValueAtTime(p.gain, now + 0.03);
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
          setTimeout(triggerBell, 400);
        }
      } catch {
        // Audio policy restricted
      }
    };

    // Session check for Easy Load: skip long animation if seen in this session
    const alreadySeen = typeof window !== 'undefined' && sessionStorage.getItem('raas_intro_seen');
    const introDuration = alreadySeen ? 350 : 1400;

    playTempleBell();

    const finishLoading = () => {
      setIsLoaded(true);
      try {
        sessionStorage.setItem('raas_intro_seen', '1');
      } catch {
        // Ignore private browsing storage restriction
      }
    };

    // When the window is fully loaded, dismiss gracefully after aesthetic intro
    const handleWindowLoad = () => {
      setTimeout(finishLoading, introDuration);
    };

    if (document.readyState === 'complete') {
      setTimeout(finishLoading, introDuration);
    } else {
      window.addEventListener('load', handleWindowLoad, { once: true });
    }

    // Failsafe timer (reduced from 4.2s to 2.2s for snappy experience)
    const failsafe = setTimeout(finishLoading, alreadySeen ? 500 : 2200);

    // Tap/Click/Key to skip immediately (Easy Load)
    const handleQuickSkip = () => finishLoading();
    window.addEventListener('keydown', handleQuickSkip, { once: true });

    return () => {
      window.removeEventListener('load', handleWindowLoad);
      window.removeEventListener('keydown', handleQuickSkip);
      clearTimeout(failsafe);
    };
  }, []);

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
          <img
            src="/assets/images/logo.jpg"
            alt="Raas Rang Official Emblem"
            className="loader-logo"
            width={120}
            height={120}
            fetchPriority="high"
            decoding="async"
          />
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
        <div className="loader-skip-hint" style={{ marginTop: '1.2rem', fontSize: '0.75rem', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase', color: '#f4d26a' }}>
          Tap anywhere to skip
        </div>
      </div>
    </div>
  );
};
