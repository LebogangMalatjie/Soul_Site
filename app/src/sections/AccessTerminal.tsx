import { useState, useRef, useEffect, useCallback } from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';

interface AccessTerminalProps {
  onAccessGranted: (code: string) => void;
  defaultCode: string;
  adminCode: string;
}

export default function AccessTerminal({ onAccessGranted, defaultCode, adminCode }: AccessTerminalProps) {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [netId] = useState(() => {
    return Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('');
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const runeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: 'power2.out' }
      );
    }
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    if (inputCode.length < 4) {
      setError('Minimum 4 characters required');
      if (shakeRef.current) {
        const tl = gsap.timeline();
        tl.to(shakeRef.current, { x: -10, duration: 0.08, ease: 'power2.out' })
          .to(shakeRef.current, { x: 10, duration: 0.08, ease: 'power2.inOut' })
          .to(shakeRef.current, { x: -10, duration: 0.08, ease: 'power2.inOut' })
          .to(shakeRef.current, { x: 10, duration: 0.08, ease: 'power2.inOut' })
          .to(shakeRef.current, { x: 0, duration: 0.08, ease: 'power2.in' });
      }
      return;
    }

    setIsValidating(true);
    setError('');

    // Simulate validation delay
    setTimeout(() => {
      if (inputCode === defaultCode || inputCode === adminCode) {
        // Success animation
        if (runeRef.current) {
          runeRef.current.classList.add('validated');
        }
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 1.1,
          duration: 0.8,
          ease: 'power2.in',
          onComplete: () => {
            onAccessGranted(inputCode);
          },
        });
      } else {
        setIsValidating(false);
        setError('Invalid Harbor Key. Access denied.');
        if (shakeRef.current) {
          const tl = gsap.timeline();
          tl.to(shakeRef.current, { x: -15, duration: 0.1, ease: 'power2.out' })
            .to(shakeRef.current, { x: 15, duration: 0.1, ease: 'power2.inOut' })
            .to(shakeRef.current, { x: -15, duration: 0.1, ease: 'power2.inOut' })
            .to(shakeRef.current, { x: 15, duration: 0.1, ease: 'power2.inOut' })
            .to(shakeRef.current, { x: 0, duration: 0.1, ease: 'power2.in' });
        }
        if (runeRef.current) {
          gsap.to(runeRef.current, {
            filter: 'drop-shadow(0 0 20px #FF3366)',
            duration: 0.3,
            yoyo: true,
            repeat: 1,
          });
        }
      }
    }, 800);
  }, [inputCode, defaultCode, adminCode, onAccessGranted]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-void flex flex-col items-center justify-center"
      style={{
        backgroundImage: 'url(/wireframe-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-void/80" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-4 z-10">
        <div className="font-mono text-xs text-teal/60 tracking-widest">
          NET_ID: {netId}
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <Shield className="w-3 h-3 text-teal" />
          <span className="text-teal tracking-widest">SECURE // ENCRYPTED</span>
        </div>
      </div>

      {/* Main Content */}
      <div ref={shakeRef} className="relative z-10 flex flex-col items-center gap-8">
        {/* Terminal Rune */}
        <div
          ref={runeRef}
          className="rune-container relative"
          style={{
            width: '300px',
            height: '300px',
            perspective: '600px',
          }}
        >
          {/* Base ring */}
          <svg
            className="rune-ring absolute"
            style={{ width: '200px', height: '200px', top: '50px', left: '50px' }}
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="75"
              fill="transparent"
              strokeWidth="2"
              stroke="rgba(0, 224, 199, 0.6)"
            />
          </svg>

          {/* Orbiter 1 */}
          <div className="rune-orbiter absolute inset-0" style={{ transformOrigin: '50% 50%' }}>
            <svg
              className="rune-ring"
              style={{ width: '200px', height: '200px', top: '50px', left: '50px', position: 'absolute' }}
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r="75"
                fill="transparent"
                strokeWidth="2"
                stroke="rgba(0, 224, 199, 0.4)"
              />
            </svg>
          </div>

          {/* Orbiter 2 */}
          <div className="rune-orbiter absolute inset-0" style={{ transformOrigin: '50% 50%' }}>
            <svg
              className="rune-ring"
              style={{ width: '160px', height: '160px', top: '70px', left: '70px', position: 'absolute' }}
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r="75"
                fill="transparent"
                strokeWidth="2"
                stroke="rgba(0, 224, 199, 0.5)"
              />
            </svg>
          </div>

          {/* Orbiter 3 */}
          <div className="rune-orbiter absolute inset-0" style={{ transformOrigin: '50% 50%' }}>
            <svg
              className="rune-ring"
              style={{ width: '120px', height: '120px', top: '90px', left: '90px', position: 'absolute' }}
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r="75"
                fill="transparent"
                strokeWidth="2"
                stroke="rgba(0, 224, 199, 0.6)"
              />
            </svg>
          </div>

          {/* Orbiter 4 */}
          <div className="rune-orbiter absolute inset-0" style={{ transformOrigin: '50% 50%' }}>
            <svg
              className="rune-ring"
              style={{ width: '80px', height: '80px', top: '110px', left: '110px', position: 'absolute' }}
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r="75"
                fill="transparent"
                strokeWidth="2"
                stroke="rgba(0, 224, 199, 0.7)"
              />
            </svg>
          </div>

          {/* Center lock icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock
              className={`w-8 h-8 transition-all duration-500 ${
                isValidating ? 'text-teal animate-pulse' : 'text-teal/60'
              }`}
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1
            className="text-3xl font-bold tracking-[0.3em] text-[#E0E0E0] mb-2"
            style={{ textShadow: '0 0 20px rgba(0, 224, 199, 0.3)' }}
          >
            SOUL
          </h1>
          <p className="font-mono text-xs text-teal/50 tracking-widest">
            RESTRICTED ACCESS // CODE REQUIRED
          </p>
        </div>

        {/* Code Input */}
        <div className="w-full max-w-sm">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="ENTER ACCESS KEY"
              disabled={isValidating}
              className="w-full bg-void border-b-2 border-teal/40 focus:border-teal px-4 py-3 font-mono text-sm text-[#E0E0E0] placeholder:text-teal/30 outline-none tracking-[0.2em] text-center transition-all duration-300 disabled:opacity-50"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 mt-3 justify-center animate-fade-in-up">
              <AlertTriangle className="w-3 h-3 text-crimson" />
              <span className="font-mono text-xs text-crimson tracking-wider">{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isValidating}
            className="w-full mt-6 py-3 bg-teal/10 border border-teal/30 hover:bg-teal/20 hover:border-teal/60 font-mono text-xs text-teal tracking-[0.3em] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed glow-border"
          >
            {isValidating ? 'AUTHENTICATING...' : 'REQUEST ACCESS'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="font-mono text-[10px] text-teal/30 tracking-wider">
          Unauthorized entry constitutes a data breach. All interactions are logged and encrypted.
        </p>
      </div>

      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-teal/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
