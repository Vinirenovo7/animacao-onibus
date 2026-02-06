import { useState, useEffect, useRef } from 'react';

type Stage = 'galaxy' | 'earth' | 'dashboard';

// ============ GALAXY CANVAS ============
function GalaxyCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: { x: number; y: number; z: number; prevZ: number }[] = [];
    for (let i = 0; i < 800; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width * 3,
        y: (Math.random() - 0.5) * canvas.height * 3,
        z: Math.random() * canvas.width,
        prevZ: canvas.width
      });
    }

    let animationId: number;

    const animate = () => {
      if (!active) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      stars.forEach(star => {
        star.prevZ = star.z;
        star.z -= 25;

        if (star.z < 1) {
          star.z = canvas.width;
          star.x = (Math.random() - 0.5) * canvas.width * 3;
          star.y = (Math.random() - 0.5) * canvas.height * 3;
          star.prevZ = canvas.width;
        }

        const sx = (star.x / star.z) * 300 + centerX;
        const sy = (star.y / star.z) * 300 + centerY;
        const px = (star.x / star.prevZ) * 300 + centerX;
        const py = (star.y / star.prevZ) * 300 + centerY;

        const size = (1 - star.z / canvas.width) * 3;

        // Trail
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(255, 255, 255, ${size / 3})`;
        ctx.lineWidth = size / 2;
        ctx.stroke();

        // Star
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ opacity: active ? 1 : 0, transition: 'opacity 1s', zIndex: active ? 5 : -1 }}
    />
  );
}

// ============ EARTH CANVAS (REALISTIC) ============
function EarthCanvas({ active, progress }: { active: boolean; progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const earthImgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/600px-The_Blue_Marble_%28remastered%29.jpg';
    img.onload = () => {
      earthImgRef.current = img;
      setImgLoaded(true);
    };
    img.onerror = () => {
      // Fallback - try another image
      img.src = 'https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg';
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!active) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.35;
      const radius = maxRadius * Math.min(progress, 1);

      // Space background
      ctx.fillStyle = '#000010';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background stars
      for (let i = 0; i < 200; i++) {
        const x = (Math.sin(i * 234.5) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 456.7) * 0.5 + 0.5) * canvas.height;
        const twinkle = Math.sin(time * 0.05 + i) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(x, y, twinkle * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.fill();
      }

      if (radius > 5) {
        // Outer glow
        const outerGlow = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.5);
        outerGlow.addColorStop(0, 'rgba(100, 180, 255, 0.2)');
        outerGlow.addColorStop(0.5, 'rgba(50, 150, 255, 0.1)');
        outerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Earth
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();

        if (earthImgRef.current && imgLoaded) {
          // Draw realistic Earth image
          const size = radius * 2.1;
          ctx.drawImage(earthImgRef.current, centerX - size / 2, centerY - size / 2, size, size);
        } else {
          // Fallback procedural Earth
          const oceanGradient = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 0, centerX, centerY, radius);
          oceanGradient.addColorStop(0, '#1e90ff');
          oceanGradient.addColorStop(1, '#001a44');
          ctx.fillStyle = oceanGradient;
          ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

          // Simple continents
          ctx.fillStyle = '#228b22';
          ctx.beginPath();
          ctx.ellipse(centerX - radius * 0.2, centerY + radius * 0.2, radius * 0.3, radius * 0.4, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(centerX + radius * 0.3, centerY - radius * 0.2, radius * 0.2, radius * 0.15, -0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Atmosphere rim
        const atmoGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.9, centerX, centerY, radius * 1.1);
        atmoGradient.addColorStop(0, 'transparent');
        atmoGradient.addColorStop(0.5, 'rgba(135, 206, 250, 0.4)');
        atmoGradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = atmoGradient;
        ctx.fill();

        // São Paulo marker
        const markerX = centerX - radius * 0.15;
        const markerY = centerY + radius * 0.25;

        // Marker glow
        const glowGradient = ctx.createRadialGradient(markerX, markerY, 0, markerX, markerY, 20);
        glowGradient.addColorStop(0, 'rgba(0, 255, 136, 0.8)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(markerX - 20, markerY - 20, 40, 40);

        // Marker dot
        ctx.beginPath();
        ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pulse ring
        const pulseR = 10 + Math.sin(time * 0.1) * 5;
        ctx.beginPath();
        ctx.arc(markerX, markerY, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Scanning line
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time * 0.02);
        const scanGrad = ctx.createLinearGradient(0, 0, radius * 1.2, 0);
        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(0.8, 'rgba(0, 255, 136, 0.4)');
        scanGrad.addColorStop(1, 'rgba(0, 255, 136, 0.8)');
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius * 1.2, -3);
        ctx.lineTo(radius * 1.2, 3);
        ctx.closePath();
        ctx.fillStyle = scanGrad;
        ctx.fill();
        ctx.restore();

        // HUD Text
        if (progress > 0.3) {
          ctx.font = 'bold 14px monospace';
          ctx.fillStyle = '#00ff88';
          ctx.textAlign = 'center';
          ctx.fillText('🌍 PLANET EARTH', centerX, centerY - radius - 40);
          
          ctx.font = '12px monospace';
          ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
          ctx.fillText('LOCALIZANDO: SÃO PAULO, BRASIL', centerX, centerY + radius + 30);
          ctx.fillText('LAT: -23.5505° | LON: -46.6333°', centerX, centerY + radius + 50);
        }
      }

      time++;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, progress, imgLoaded]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ opacity: active ? 1 : 0, transition: 'opacity 1s', zIndex: active ? 10 : -1 }}
    />
  );
}

// ============ MATRIX RAIN ============
function MatrixRain({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = Math.floor(canvas.width / 18);
    const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -50);
    const chars = 'アイウエオカキクケコサシスセソタチツテト0123456789MOVEBUSS';

    let animationId: number;

    const animate = () => {
      if (!active) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationId = requestAnimationFrame(animate);
        return;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '14px monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 18;
        const y = drops[i] * 18;

        ctx.fillStyle = '#00ff88';
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ opacity: active ? 0.25 : 0, transition: 'opacity 2s', zIndex: 1 }}
    />
  );
}

// ============ BUS ANIMATION ============
function BusAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    let busX = -180;
    let wheelAngle = 0;
    let time = 0;
    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0a1a0a');
      skyGrad.addColorStop(1, '#1a2a1a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // City silhouette
      ctx.fillStyle = '#001a0a';
      const buildings = [40, 60, 35, 80, 50, 70, 45, 55, 75, 40, 65, 50, 85, 45, 70];
      const bw = width / buildings.length;
      buildings.forEach((h, i) => {
        ctx.fillRect(i * bw, height - 25 - h * 0.5, bw - 2, h * 0.5);
      });

      // Road
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, height - 22, width, 22);

      // Road markings
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 10]);
      ctx.lineDashOffset = -time * 3;
      ctx.beginPath();
      ctx.moveTo(0, height - 10);
      ctx.lineTo(width, height - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bus
      const busY = height - 60 + Math.sin(time * 0.4) * 0.5;
      const busW = 130;
      const busH = 42;

      ctx.save();
      ctx.translate(busX, busY);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(busW / 2, busH + 5, busW / 2 - 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (white)
      ctx.fillStyle = '#f8f8f8';
      ctx.beginPath();
      ctx.roundRect(0, 8, busW, busH - 8, [6, 6, 3, 3]);
      ctx.fill();

      // Green top stripe
      ctx.fillStyle = '#00aa55';
      ctx.beginPath();
      ctx.roundRect(0, 8, busW, 14, [6, 6, 0, 0]);
      ctx.fill();

      // Green middle stripe
      ctx.fillStyle = '#00cc66';
      ctx.fillRect(0, 30, busW, 6);

      // Windows
      ctx.fillStyle = '#87ceeb';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.roundRect(10 + i * 20, 10, 15, 15, 2);
        ctx.fill();
      }

      // Window reflections
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(12 + i * 20, 12, 4, 11);
      }

      // Windshield
      ctx.fillStyle = '#87ceeb';
      ctx.beginPath();
      ctx.roundRect(busW - 22, 10, 18, 18, [2, 5, 2, 2]);
      ctx.fill();

      // Door
      ctx.fillStyle = '#ddd';
      ctx.strokeStyle = '#00aa55';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(busW - 40, 22, 12, 18, 2);
      ctx.fill();
      ctx.stroke();

      // Headlight
      ctx.fillStyle = '#ffee88';
      ctx.fillRect(busW - 5, 30, 5, 8);

      // Headlight glow
      const hlGlow = ctx.createRadialGradient(busW + 8, 34, 0, busW + 8, 34, 25);
      hlGlow.addColorStop(0, 'rgba(255,238,136,0.35)');
      hlGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = hlGlow;
      ctx.fillRect(busW - 10, 15, 40, 35);

      // Tail light
      ctx.fillStyle = '#ff3333';
      ctx.fillRect(2, 32, 4, 6);

      // Route number
      ctx.fillStyle = '#fff';
      ctx.fillRect(5, 22, 28, 10);
      ctx.fillStyle = '#00aa55';
      ctx.font = 'bold 7px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('524M', 19, 30);

      // MOVEBUSS text
      ctx.fillStyle = '#00aa55';
      ctx.font = 'bold 5px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('MOVEBUSS', 45, busH - 4);

      // Wheels
      const drawWheel = (x: number) => {
        const wy = busH - 2;
        // Tire
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(x, wy, 8, 0, Math.PI * 2);
        ctx.fill();
        // Hub
        ctx.fillStyle = '#bbb';
        ctx.beginPath();
        ctx.arc(x, wy, 5, 0, Math.PI * 2);
        ctx.fill();
        // Spokes
        ctx.save();
        ctx.translate(x, wy);
        ctx.rotate(wheelAngle);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 4);
          ctx.stroke();
          ctx.rotate(Math.PI * 2 / 5);
        }
        ctx.restore();
      };

      drawWheel(22);
      drawWheel(busW - 22);

      // Exhaust
      if (Math.sin(time * 0.25) > 0.6) {
        ctx.fillStyle = 'rgba(120,120,120,0.25)';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(-8 - i * 6 + Math.sin(time + i) * 2, busH - 8, 3 + i * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // Update
      busX += 2;
      if (busX > width + 50) busX = -180;
      wheelAngle += 0.15;
      time += 0.1;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-full h-24 rounded-lg border border-[#00ff88]/30 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-2 left-3 text-[#00ff88] text-xs font-mono opacity-70">FROTA EM MOVIMENTO</div>
      <div className="absolute top-2 right-3 text-[#00ff88] text-xs font-mono animate-pulse">● LIVE</div>
    </div>
  );
}

// ============ LOADING OVERLAY ============
function LoadingOverlay({ stage }: { stage: Stage }) {
  const [text, setText] = useState('');

  useEffect(() => {
    const messages: Record<Stage, string[]> = {
      galaxy: ['INICIANDO SISTEMA...', 'CONECTANDO AO SATÉLITE...', 'CARREGANDO COORDENADAS...'],
      earth: ['LOCALIZANDO PLANETA TERRA...', 'FOCANDO EM SÃO PAULO...', 'PREPARANDO DASHBOARD...'],
      dashboard: []
    };

    const stageMessages = messages[stage];
    if (!stageMessages.length) return;

    let msgIdx = 0;
    let charIdx = 0;

    const interval = setInterval(() => {
      const msg = stageMessages[msgIdx];
      if (charIdx <= msg.length) {
        setText(msg.slice(0, charIdx));
        charIdx++;
      } else {
        charIdx = 0;
        msgIdx = (msgIdx + 1) % stageMessages.length;
      }
    }, 60);

    return () => clearInterval(interval);
  }, [stage]);

  if (stage === 'dashboard') return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-end pb-16 pointer-events-none">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#00ff88] mb-2" style={{ fontFamily: 'monospace', textShadow: '2px 2px #ff3e3e' }}>
          MOVEBUSS
        </h1>
        <p className="text-xs tracking-[0.4em] text-[#00d4ff] mb-6">SISTEMA OPERACIONAL</p>
        
        <div className="bg-black/60 border border-[#00ff88]/40 rounded-lg p-4 min-w-[280px]">
          <p className="text-[#00ff88] font-mono text-sm text-left">
            <span className="text-[#ff3e3e]">$</span> {text}<span className="animate-pulse">_</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ DASHBOARD ============
interface LinhaData { dur: number; int: number; dist: number; frot: number; }
interface Linha { id: string; nome: string; }

const dadosGTFS: Record<string, LinhaData> = {
  "524M-10": { dur: 73, int: 7, dist: 12.5, frot: 10 },
  "3112-10": { dur: 105, int: 12, dist: 12.5, frot: 9 },
  "414P-10": { dur: 114, int: 14, dist: 12.5, frot: 8 },
  "514T-10": { dur: 122, int: 12, dist: 12.5, frot: 16 },
  "4033-10": { dur: 118, int: 13, dist: 12.5, frot: 15 },
  "4734-10": { dur: 57, int: 4, dist: 12.5, frot: 14 },
  "5020-10": { dur: 29, int: 6, dist: 12.5, frot: 5 },
  "373T-10": { dur: 109, int: 10, dist: 12.5, frot: 16 },
  "5032-10": { dur: 80, int: 6, dist: 12.5, frot: 12 },
  "4025-10": { dur: 100, int: 7, dist: 12.5, frot: 14 },
  "4726-10": { dur: 55, int: 4, dist: 12.5, frot: 14 },
  "5031-10": { dur: 52, int: 5, dist: 12.5, frot: 15 },
  "573H-10": { dur: 119, int: 8, dist: 12.5, frot: 16 },
  "4031-10": { dur: 90, int: 10, dist: 12.5, frot: 9 },
  "524L-10": { dur: 88, int: 20, dist: 12.5, frot: 4 },
  "364A-10": { dur: 144, int: 11, dist: 12.5, frot: 13 },
  "573T-10": { dur: 90, int: 8, dist: 12.5, frot: 12 },
  "4028-10": { dur: 76, int: 9, dist: 12.5, frot: 8 },
  "4716-10": { dur: 73, int: 11, dist: 12.5, frot: 7 },
  "4030-10": { dur: 90, int: 12, dist: 12.5, frot: 8 },
  "3099-10": { dur: 74, int: 6, dist: 12.5, frot: 13 },
  "4027-10": { dur: 70, int: 6, dist: 12.5, frot: 13 },
  "3098-10": { dur: 73, int: 8, dist: 12.5, frot: 9 },
  "4029-10": { dur: 92, int: 11, dist: 12.5, frot: 8 },
  "5035-10": { dur: 51, int: 8, dist: 12.5, frot: 6 },
  "3098-31": { dur: 76, int: 12, dist: 12.5, frot: 6 },
  "4027-41": { dur: 48, int: 20, dist: 12.5, frot: 2 },
  "4729-10": { dur: 99, int: 20, dist: 12.5, frot: 5 },
  "574W-10": { dur: 112, int: 12, dist: 12.5, frot: 9 },
  "5031-21": { dur: 33, int: 6, dist: 12.5, frot: 6 },
  "4032-10": { dur: 86, int: 20, dist: 12.5, frot: 4 },
  "4735-10": { dur: 66, int: 20, dist: 12.5, frot: 3 },
  "5025-10": { dur: 64, int: 14, dist: 12.5, frot: 5 }
};

function Dashboard({ visible }: { visible: boolean }) {
  const [selectedLinha, setSelectedLinha] = useState<Linha | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLinhas = linhas.filter(l =>
    l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!visible) return null;

  return (
    <div className="relative z-10 min-h-screen opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
      <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>
      
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-[#00ff88] pb-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#00ff88]" style={{ fontFamily: 'monospace', textShadow: '2px 2px #ff3e3e' }}>
              MOVEBUSS
            </h1>
            <p className="text-xs tracking-[0.3em] text-[#00d4ff] mt-1">CONTROLE OPERACIONAL</p>
          </div>
          <div className="text-right text-xs">
            <p className="text-[#00ff88]">● SYSTEM ACTIVE</p>
            <p className="text-white/60 mt-1">R. Murta do Campo, 405 - Vila Alpina</p>
            <p className="text-white/40">São Paulo - SP, 03210-010</p>
          </div>
        </header>

        {/* First Image - Full with green scanner */}
        <div className="relative w-full mb-6 rounded-lg border border-[#00ff88] overflow-hidden" style={{ boxShadow: '0 0 15px rgba(0,255,136,0.3)' }}>
          <img
            src="https://movebuss.com.br/wp-content/uploads/2025/04/Imagem-do-WhatsApp-de-2025-04-29-as-10.29.58_c74f9ad6-1.jpg"
            alt="MoveBuss Fleet"
            className="w-full h-auto"
            style={{ display: 'block' }}
          />
          <div className="absolute top-0 left-0 w-full h-1 bg-[#00ff88] animate-[scan_4s_linear_infinite]" style={{ boxShadow: '0 0 15px #00ff88, 0 0 30px #00ff88' }} />
          <style>{`@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }`}</style>
          <div className="absolute bottom-3 left-3 text-white">
            <p className="text-xs text-[#00ff88]">FROTA EM TEMPO REAL</p>
            <p className="text-base font-bold">Monitoramento 24/7</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar linha por código ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-[#00ff88]/50 rounded-lg px-4 py-3 text-[#00ff88] placeholder-[#00ff88]/30 focus:outline-none focus:border-[#00ff88]"
          />
        </div>

        {/* Title */}
        <h2 className="text-center text-[#ff3e3e] text-sm mb-4 font-mono">[ SELECIONE UMA LINHA PARA TELEMETRIA ]</h2>

        {/* Lines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {filteredLinhas.map((linha) => (
            <div
              key={linha.id}
              onClick={() => setSelectedLinha(linha)}
              className="bg-gradient-to-br from-[#001a0d] to-[#000d06] border border-[#004422] rounded-lg p-4 cursor-pointer transition-all hover:border-[#00ff88] hover:shadow-[0_0_15px_rgba(0,255,136,0.2)] active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#ff3e3e] font-bold font-mono text-lg">{linha.id}</span>
                <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
              </div>
              <p className="text-white/70 text-sm mt-2">{linha.nome}</p>
            </div>
          ))}
        </div>

        {/* Second Image - Full with green scanner */}
        <div className="relative w-full mb-6 rounded-lg border border-[#00ff88]/50 overflow-hidden">
          <img
            src="https://movebuss.com.br/wp-content/uploads/2025/04/Imagem-do-WhatsApp-de-2025-04-29-as-10.30.07_ed1178f5-1.jpg"
            alt="MoveBuss Operations"
            className="w-full h-auto"
            style={{ display: 'block' }}
          />
          <div className="absolute top-0 left-0 w-full h-1 bg-[#00ff88] animate-[scan_4s_linear_infinite]" style={{ boxShadow: '0 0 15px #00ff88, 0 0 30px #00ff88', animationDelay: '2s' }} />
        </div>

        {/* Bus Animation */}
        <div className="mb-6">
          <BusAnimation />
        </div>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-[#333]">
          <p className="text-[#555] text-xs mb-2">SISTEMA OPERACIONAL MOVEBUSS // 2026</p>
          <a href="https://movebuss.com.br" target="_blank" rel="noopener noreferrer" className="text-[#00ff88] hover:text-[#00d4ff] text-lg">
            movebuss.com.br
          </a>
        </footer>
      </div>

      {/* Modal */}
      {selectedLinha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedLinha(null)}>
          <div className="w-full max-w-md bg-black border-2 border-[#00ff88] rounded-lg p-6" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 0 40px rgba(0,255,136,0.3)' }}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#333]">
              <h3 className="text-[#ff3e3e] font-bold text-lg">LINHA {selectedLinha.id}</h3>
              <div className="flex gap-1">
                <span className="w-3 h-3 rounded-full bg-[#ff3e3e] animate-pulse" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-[#00ff88]" />
              </div>
            </div>
            <p className="text-white/60 text-sm mb-4">{selectedLinha.nome}</p>
            
            {(() => {
              const dados = dadosGTFS[selectedLinha.id] || { dur: 45, int: 12, dist: 12, frot: 8 };
              return (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-dotted border-[#222]">
                    <span className="text-[#888]">🕐 Duração Viagem</span>
                    <span className="text-[#00ff88]">{dados.dur} min</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dotted border-[#222]">
                    <span className="text-[#888]">⏱️ Intervalo Planejado</span>
                    <span className="text-[#00ff88]">{dados.int} min</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dotted border-[#222]">
                    <span className="text-[#888]">🚌 Ônibus / Hora</span>
                    <span className="text-[#00ff88]">{Math.round(60 / dados.int)} veículos</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dotted border-[#222]">
                    <span className="text-[#888]">⛽ Tipo de Frota</span>
                    <span className="text-[#00ff88]">DIESEL</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dotted border-[#222]">
                    <span className="text-[#888]">📍 Distância</span>
                    <span className="text-[#00ff88]">{dados.dist} km</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dotted border-[#222]">
                    <span className="text-[#888]">⏳ Tempo no Ponto</span>
                    <span className="text-[#00ff88]">~ {dados.int} min</span>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => setSelectedLinha(null)}
              className="w-full mt-5 py-3 bg-gradient-to-r from-[#ff3e3e] to-[#cc2e2e] text-white font-bold rounded hover:from-[#ff5555] hover:to-[#dd3e3e]"
            >
              FECHAR TERMINAL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [stage, setStage] = useState<Stage>('galaxy');
  const [earthProgress, setEarthProgress] = useState(0);

  useEffect(() => {
    // Galaxy: 3 seconds
    const t1 = setTimeout(() => setStage('earth'), 3000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (stage === 'earth') {
      // Animate earth
      const interval = setInterval(() => {
        setEarthProgress(prev => {
          if (prev >= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev + 0.025;
        });
      }, 50);

      // Transition to dashboard
      const t2 = setTimeout(() => setStage('dashboard'), 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(t2);
      };
    }
  }, [stage]);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <GalaxyCanvas active={stage === 'galaxy'} />
      <EarthCanvas active={stage === 'earth'} progress={earthProgress} />
      <MatrixRain active={stage === 'dashboard'} />
      <LoadingOverlay stage={stage} />
      <Dashboard visible={stage === 'dashboard'} />

      {stage !== 'dashboard' && (
        <button
          onClick={() => setStage('dashboard')}
          className="fixed bottom-4 right-4 z-50 px-4 py-2 text-xs text-[#00ff88]/50 border border-[#00ff88]/20 rounded hover:bg-[#00ff88]/10 hover:text-[#00ff88]"
        >
          PULAR INTRO →
        </button>
      )}
    </div>
  );
}
