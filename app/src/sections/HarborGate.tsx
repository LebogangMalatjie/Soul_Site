import { useState, useEffect, useRef, useCallback } from 'react';
import { User, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

interface HarborGateProps {
  onCodenameSet: (codename: string) => void;
  isAdmin: boolean;
}

export default function HarborGate({ onCodenameSet, isAdmin }: HarborGateProps) {
  const [codename, setCodename] = useState('');
  const [gateOpen, setGateOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const gateLeftRef = useRef<HTMLDivElement>(null);
  const gateRightRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Gate opening animation
    const tl = gsap.timeline();

    // Light beam intensifies
    tl.fromTo(
      lightRef.current,
      { opacity: 0, scaleY: 0 },
      { opacity: 1, scaleY: 1, duration: 1, ease: 'power2.out' }
    );

    // Gates slide open
    tl.to(
      gateLeftRef.current,
      { x: '-100%', duration: 2, ease: 'power3.inOut' },
      '-=0.5'
    );
    tl.to(
      gateRightRef.current,
      { x: '100%', duration: 2, ease: 'power3.inOut' },
      '<'
    );

    // Light floods in
    tl.to(
      lightRef.current,
      { opacity: 0.8, scaleX: 3, duration: 1.5, ease: 'power2.out' },
      '-=1.5'
    );

    tl.call(() => {
      setGateOpen(true);
      setShowModal(true);
    });

    // Modal entrance
    tl.fromTo(
      modalRef.current,
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }
    );

    return () => {
      tl.kill();
    };
  }, []);

  const handleSubmit = useCallback(() => {
    if (codename.trim().length < 2) {
      setError('Codename must be at least 2 characters');
      return;
    }

    // Animate modal shattering
    gsap.to(modalRef.current, {
      scale: 1.5,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        onCodenameSet(codename.trim().toUpperCase());
      },
    });
  }, [codename, onCodenameSet]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const suggestedNames = ['GHOST_RIDER', 'SHADOW_WALKER', 'NIGHT_HAWK', 'VOID_RUNNER'];

  return (
    <div ref={containerRef} className="fixed inset-0 bg-void overflow-hidden">
      {/* Gate Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/gate-bg.jpg)' }}
      />
      <div className="absolute inset-0 bg-void/60" />

      {/* Light beam through gate */}
      <div
        ref={lightRef}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-full bg-gradient-to-b from-teal/40 via-teal/20 to-transparent origin-top"
        style={{ opacity: 0 }}
      />

      {/* Left Gate Panel */}
      <div
        ref={gateLeftRef}
        className="absolute top-0 left-0 w-1/2 h-full bg-midnight/95 border-r border-teal/20"
        style={{
          backgroundImage: 'url(/gate-bg.jpg)',
          backgroundSize: '200% 100%',
          backgroundPosition: 'left center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-void/80 to-transparent" />
      </div>

      {/* Right Gate Panel */}
      <div
        ref={gateRightRef}
        className="absolute top-0 right-0 w-1/2 h-full bg-midnight/95 border-l border-teal/20"
        style={{
          backgroundImage: 'url(/gate-bg.jpg)',
          backgroundSize: '200% 100%',
          backgroundPosition: 'right center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-void/80 to-transparent" />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div
            ref={modalRef}
            className="relative bg-midnight border border-teal/30 p-8 max-w-md w-full mx-4"
            style={{
              boxShadow: '0 0 40px rgba(0, 224, 199, 0.15), inset 0 0 40px rgba(0, 224, 199, 0.05)',
            }}
          >
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-teal" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-teal" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-teal" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-teal" />

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 border border-teal/30 rounded-full mb-4">
                <User className="w-5 h-5 text-teal" />
              </div>
              <h2 className="text-xl font-bold tracking-[0.2em] text-[#E0E0E0] mb-1">
                FORGE IDENTITY
              </h2>
              <p className="font-mono text-xs text-teal/50 tracking-wider">
                {isAdmin ? 'ADMIN ACCESS GRANTED' : 'WELCOME TO SOUL'}
              </p>
            </div>

            {/* Codename Input */}
            <div className="mb-4">
              <label className="block font-mono text-[10px] text-teal/60 tracking-[0.2em] mb-2">
                CHOOSE YOUR CODENAME
              </label>
              <input
                type="text"
                value={codename}
                onChange={(e) => {
                  setCodename(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''));
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. GHOST_RIDER"
                maxLength={20}
                className="w-full bg-void border border-teal/30 focus:border-teal px-4 py-3 font-mono text-sm text-[#E0E0E0] placeholder:text-teal/20 outline-none tracking-wider transition-all duration-300"
                autoFocus
              />
              {error && (
                <p className="font-mono text-[10px] text-crimson mt-2 tracking-wider">{error}</p>
              )}
            </div>

            {/* Suggested Names */}
            <div className="mb-6">
              <p className="font-mono text-[10px] text-teal/40 tracking-wider mb-2">SUGGESTED:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setCodename(name);
                      setError('');
                    }}
                    className="px-3 py-1 bg-teal/5 border border-teal/20 hover:border-teal/50 hover:bg-teal/10 font-mono text-[10px] text-teal/60 hover:text-teal transition-all duration-200 tracking-wider"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-teal text-void font-mono text-sm font-bold tracking-[0.3em] hover:bg-teal-light transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>ENTER SOUL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {isAdmin && (
              <div className="mt-4 text-center">
                <span className="font-mono text-[10px] text-crimson tracking-wider">
                  ADMIN PRIVILEGES ACTIVE
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status bar at bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
        <div className="font-mono text-[10px] text-teal/30 tracking-widest">
          {gateOpen ? 'GATE OPEN // SOUL ACCESSIBLE' : 'GATE OPENING...'}
        </div>
      </div>
    </div>
  );
}
