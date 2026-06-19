import { useEffect, useState, useRef } from "react";

export function RedirectCountdownOverlay({
  open,
  seconds = 15,
  targetUrl,
  onComplete,
  onSkip,
}: {
  open: boolean;
  seconds?: number;
  targetUrl: string;
  onComplete?: () => void;
  onSkip?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const totalTimeRef = useRef(seconds);

  useEffect(() => {
    if (!open) return;
    
    setTimeLeft(seconds);
    totalTimeRef.current = seconds;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          if (onComplete) onComplete();
          else window.location.href = targetUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [open, seconds, targetUrl, onComplete]);

  if (!open) return null;

  const radius = 120;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  // Progress goes from 0 to 1 as time goes down. 
  // Wait, if progress = 1 when time = max, then offset = 0 (full circle).
  // If progress = 0 when time = 0, then offset = circumference (empty circle).
  const progress = timeLeft / totalTimeRef.current;
  const strokeDashoffset = circumference - progress * circumference;

  const tickMarks = Array.from({ length: 60 }).map((_, i) => {
    const angle = (i * 6) * (Math.PI / 180);
    const outerRadius = radius + 25;
    const innerRadius = radius + 15;
    const x1 = 160 + innerRadius * Math.cos(angle);
    const y1 = 160 + innerRadius * Math.sin(angle);
    const x2 = 160 + outerRadius * Math.cos(angle);
    const y2 = 160 + outerRadius * Math.sin(angle);
    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={i % 5 === 0 ? "#a855f7" : "#4c2889"}
        strokeWidth={i % 5 === 0 ? "2" : "1"}
        opacity={i % 5 === 0 ? "0.8" : "0.4"}
      />
    );
  });

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1a0f2e]/80 backdrop-blur-md transition-opacity duration-500 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="countdown-title"
    >
      <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
        
        {/* Glow behind the circle */}
        <div className="absolute top-[100px] left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-purple-600/30 blur-[70px] rounded-full pointer-events-none" />

        {/* Circular SVG Container */}
        <div className="relative w-[320px] h-[320px] flex items-center justify-center mb-6">
          
          <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] z-10" viewBox="0 0 320 320">
            {/* Tick marks */}
            <g className="origin-center -rotate-90">{tickMarks}</g>
            
            {/* Base track */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="#2d1b4e"
              strokeWidth={strokeWidth}
            />
            {/* Progress ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="#a855f7"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="origin-center -rotate-90 transition-all duration-1000 ease-linear motion-reduce:transition-none"
            />
          </svg>

          {/* Number */}
          <div className="flex flex-col items-center justify-center z-20 mt-4" aria-live="polite">
            <span className="text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] tracking-tighter tabular-nums">
              {timeLeft}
            </span>
            <div className="mt-2 animate-bounce motion-reduce:animate-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
              </svg>
            </div>
          </div>

          {/* Static Particles */}
          <div className="absolute inset-0 pointer-events-none motion-reduce:hidden z-10">
            <div className="absolute top-[15%] left-[20%] w-2 h-2 bg-purple-300 rounded-full animate-ping opacity-75" />
            <div className="absolute bottom-[20%] right-[10%] w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse shadow-[0_0_10px_#a855f7]" />
            <div className="absolute top-[45%] left-[-2%] w-1 h-1 bg-white rounded-full animate-pulse shadow-[0_0_5px_#fff]" />
            <div className="absolute bottom-[10%] left-[30%] w-2 h-2 bg-purple-500 rounded-full animate-ping opacity-50" />
            <div className="absolute top-[25%] right-[-5%] w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_#fff]" />
          </div>

          {/* Orbiting Particles Container */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center motion-reduce:hidden z-10">
            <div className="particle-orbit" />
            <div className="particle-orbit-2" />
            <div className="particle-orbit-3" />
          </div>
        </div>

        <h2 id="countdown-title" className="text-2xl font-bold text-white mb-2 drop-shadow-md z-20">
          Redirigiendo a tus cursos...
        </h2>
        
        <p className="text-[#ded4ec] text-sm mb-8 z-20">
          Serás enviado automáticamente en <span className="font-bold text-[#b77bff] drop-shadow-[0_0_5px_rgba(183,123,255,0.5)]">{timeLeft} segundos</span>
        </p>

        <button
          onClick={() => {
            if (onSkip) onSkip();
            else window.location.href = targetUrl;
          }}
          className="group relative inline-flex items-center gap-2 text-white font-semibold text-sm hover:text-[#cbb0f5] transition-colors z-20"
        >
          Ir ahora
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-purple-500/50 group-hover:bg-[#b77bff] transition-colors shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(145px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(145px) rotate(-360deg); }
        }
        @keyframes orbit-reverse {
          from { transform: rotate(360deg) translateX(130px) rotate(-360deg); }
          to   { transform: rotate(0deg) translateX(130px) rotate(0deg); }
        }
        @keyframes orbit-slow {
          from { transform: rotate(0deg) translateX(165px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(165px) rotate(-360deg); }
        }
        .particle-orbit {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #d8b4fe;
          border-radius: 50%;
          box-shadow: 0 0 10px #a855f7;
          animation: orbit 5s linear infinite;
        }
        .particle-orbit-2 {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 8px #fff;
          animation: orbit-reverse 7s linear infinite;
        }
        .particle-orbit-3 {
          position: absolute;
          width: 5px;
          height: 5px;
          background: #c084fc;
          border-radius: 50%;
          box-shadow: 0 0 12px #c084fc;
          animation: orbit-slow 9s linear infinite;
          animation-delay: -2s;
        }
      `}} />
    </div>
  );
}
