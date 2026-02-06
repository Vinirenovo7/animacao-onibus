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

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars: { x: number; y: number; z: number; prevZ: number }[] = [];
    for (let i = 0; i < 600; i++) {
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
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

        const size = (1 - star.z / canvas.width) * 4;

        if (sx > 0 && sx < canvas.width && sy > 0 && sy < canvas.height) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(sx, sy);
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(size / 3, 1)})`;
            ctx.lineWidth = size / 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    if (active) animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%',
          zIndex: active ? 5 : -1,
          opacity: active ? 1 : 0,
          transition: 'opacity 1s',
          background: '#000',
          pointerEvents: 'none'
      }}
    />
  );
}

// ============ EARTH CANVAS ============
function EarthCanvas({ active, progress }: { active: boolean; progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const earthImgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    // Sem crossOrigin para evitar bloqueio no Safari/iOS
    img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/600px-The_Blue_Marble_%28remastered%29.jpg';
    
    img.onload = () => {
      earthImgRef.current = img;
      setImgLoaded(true);
    };
    img.onerror = () => setImgLoaded(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let animationId: number;
    let time = 0;

    const animate = () => {
      if (!active) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.35;
      const radius = maxRadius * Math.min(progress, 1);

      ctx.fillStyle = '#000010';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 150; i++) {
        const x = (Math.sin(i * 132) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 453) * 0.5 + 0.5) * canvas.height;
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.8})`;
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      if (radius > 5) {
        // Glow
        const outerGlow = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.5);
        outerGlow.addColorStop(0, 'rgba(100, 180, 255, 0.2)');
        outerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Terra
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();

        try {
            if (earthImgRef.current && imgLoaded) {
                const size = radius * 2.1;
                ctx.drawImage(earthImgRef.current, centerX - size / 2, centerY - size / 2, size, size);
            } else {
                throw new Error("Fallback");
            }
        } catch (e) {
            const oceanGradient = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 0, centerX, centerY, radius);
            oceanGradient.addColorStop(0, '#1e90ff');
            oceanGradient.addColorStop(1, '#001a44');
            ctx.fillStyle = oceanGradient;
            ctx.fill();
            
            ctx.fillStyle = '#228b22';
            ctx.beginPath();
            ctx.ellipse(centerX - radius * 0.2, centerY + radius * 0.2, radius * 0.3, radius * 0.4, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Marcador
        const markerX = centerX - radius * 0.15;
        const markerY = centerY + radius * 0.25;

        ctx.beginPath();
        ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(markerX, markerY, 10 + Math.sin(time * 0.1) * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 136, 0.6)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (progress > 0.3) {
          ctx.font = 'bold 16px monospace';
          ctx.fillStyle = '#00ff88';
          ctx.textAlign = 'center';
          ctx.fillText('LOCALIZANDO: SÃO PAULO', centerX, centerY + radius + 40);
        }
      }

      time++;
      animationId = requestAnimationFrame(animate);
    };

    if (active) animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [active, progress, imgLoaded]);

  return (
    <canvas
      ref={canvasRef}
      style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%',
          zIndex: active ? 10 : -1,
          opacity: active ? 1 : 0,
          transition: 'opacity 1s',
          pointerEvents: 'none'
      }}
    />
  );
}

// ============ MATRIX RAIN (CORRIGIDO E TURBINADO) ============
function MatrixRain({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -50);
    // Caracteres estilo Matrix original (Katakana + Números)
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let animationId: number;

    const animate = () => {
      // Nota: Não limpamos se não estiver ativo para manter o fundo preto, 
      // mas se active for false, o canvas inteiro fica com opacidade 0 pelo CSS.
      if (!active) return;
      
      // Fundo semi-transparente para dar efeito de rastro
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ff88';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 20;
        const y = drops[i] * 20;

        // Variação de cor para ficar mais dinâmico
        ctx.fillStyle = Math.random() > 0.95 ? '#fff' : '#00ff88';
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      animationId = requestAnimationFrame(animate);
    };

    if (active) animate();

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%',
          // zIndex 0 para ficar atrás do conteúdo (que é 20) mas na frente do fundo preto
          zIndex: 0, 
          // Opacidade ajustada para 0.3 para ser visível mas não atrapalhar leitura
          opacity: active ? 0.3 : 0,
          transition: 'opacity 2s',
          pointerEvents: 'none'
      }}
    />
  );
}

// ============ BUS ANIMATION COMPONENT ============
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
      
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0a1a0a');
      skyGrad.addColorStop(1, '#1a2a1a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#001a0a';
      for(let i=0; i<15; i++) {
          ctx.fillRect(i * (width/15), height - 25 - (Math.sin(i)*20 + 30), (width/15)-2, 100);
      }

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, height - 22, width, 22);
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 10]);
      ctx.lineDashOffset = -time * 3;
      ctx.beginPath();
      ctx.moveTo(0, height - 10);
      ctx.lineTo(width, height - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      const busY = height - 60 + Math.sin(time * 0.4) * 0.5;
      const busW = 130;
      const busH = 42;

      ctx.save();
      ctx.translate(busX, busY);

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(busW / 2, busH + 5, busW / 2 - 5, 4, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#f8f8f8';
      ctx.beginPath(); ctx.roundRect(0, 8, busW, busH - 8, [6, 6, 3, 3]); ctx.fill();
      ctx.fillStyle = '#00aa55';
      ctx.beginPath(); ctx.roundRect(0, 8, busW, 14, [6, 6, 0, 0]); ctx.fill();
      ctx.fillStyle = '#00cc66';
      ctx.fillRect(0, 30, busW, 6);

      ctx.fillStyle = '#87ceeb';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.roundRect(10 + i * 20, 10, 15, 15, 2); ctx.fill();
      }
      ctx.beginPath(); ctx.roundRect(busW - 22, 10, 18, 18, [2, 5, 2, 2]); ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.fillRect(5, 22, 28, 10);
      ctx.fillStyle = '#00aa55';
      ctx.font = 'bold 7px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('524M', 19, 30);
      ctx.font = 'bold 5px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('MOVEBUSS', 45, busH - 4);

      const drawWheel = (x: number) => {
          const wy = busH - 2;
          ctx.fillStyle = '#111';
          ctx.beginPath(); ctx.arc(x, wy, 8, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#bbb';
          ctx.beginPath(); ctx.arc(x, wy, 5, 0, Math.PI*2); ctx.fill();
          ctx.save();
          ctx.translate(x, wy);
          ctx.rotate(wheelAngle);
          ctx.strokeStyle = '#888';
          ctx.lineWidth = 1;
          for(let k=0; k<5; k++) {
              ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,4); ctx.stroke();
              ctx.rotate(Math.PI*2/5);
          }
          ctx.restore();
      };
      drawWheel(22);
      drawWheel(busW - 22);

      ctx.restore();

      busX += 2.5;
      if (busX > width + 50) busX = -180;
      wheelAngle += 0.2;
      time += 0.1;

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100px', borderRadius: '8px', border: '1px solid rgba(0,255,136,0.3)', overflow: 'hidden', background: '#000', marginBottom: '20px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div style={{ position: 'absolute', top: '8px', left: '12px', color: '#00ff88', fontSize: '10px', fontFamily: 'monospace' }}>FROTA EM MOVIMENTO</div>
      <div style={{ position: 'absolute', top: '8px', right: '12px', color: '#00ff88', fontSize: '10px', fontFamily: 'monospace' }}>● LIVE</div>
    </div>
  );
}

// ============ LOADING TEXT ============
function LoadingOverlay({ stage }: { stage: Stage }) {
    const [text, setText] = useState('');
    
    useEffect(() => {
        const msgs = { galaxy: ['SISTEMA...'], earth: ['LOCALIZANDO...'], dashboard: [] };
        const currentMsgs = msgs[stage];
        if(!currentMsgs || !currentMsgs.length) return;

        let charIdx = 0;
        const interval = setInterval(() => {
            if(charIdx <= currentMsgs[0].length) {
                setText(currentMsgs[0].slice(0, charIdx));
                charIdx++;
            }
        }, 100);
        return () => clearInterval(interval);
    }, [stage]);

    if(stage === 'dashboard') return null;

    return (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '80px', zIndex: 50, pointerEvents: 'none' }}>
            <h1 style={{ color: '#00ff88', fontSize: '2.5em', fontFamily: 'monospace', fontWeight: 'bold', textShadow: '2px 2px #ff3e3e', marginBottom: '10px' }}>MOVEBUSS</h1>
            <div style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid #00ff88', padding: '5px 15px', borderRadius: '5px' }}>
                <span style={{ color: '#00ff88', fontFamily: 'monospace' }}>{text}_</span>
            </div>
        </div>
    );
}

// ============ DASHBOARD COMPONENT ============
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

const linhas: Linha[] = [
  { id: "524M-10", nome: "Mascarenhas de Morais – Shopping Aricanduva" },
  { id: "3112-10", nome: "Vila Industrial – Metrô Belém" },
  { id: "414P-10", nome: "Vila Industrial – Metrô Carrão" },
  { id: "514T-10", nome: "Term. Sacomã – Conj. Hab. Teotônio Vilela" },
  { id: "4033-10", nome: "Jardim Guairacá – Nova Conquista" },
  { id: "4734-10", nome: "Vila Moraes – Metrô Saúde" },
  { id: "5020-10", nome: "Hospital Heliópolis – Term. Sacomã" },
  { id: "373T-10", nome: "Jardim Itápolis – Metrô Bresser" },
  { id: "5032-10", nome: "Vila Arapuá – Term. Sacomã" },
  { id: "4025-10", nome: "Vila Califórnia – Metrô Tatuapé" },
  { id: "4726-10", nome: "Mooca – Metrô Tatuapé" },
  { id: "5031-10", nome: "Vila Arapuá – Term. Sacomã" },
  { id: "573H-10", nome: "Hospital Heliópolis – Metrô Bresser" },
  { id: "4031-10", nome: "Pq. Santa Madalena – Metrô Tamanduateí" },
  { id: "524L-10", nome: "Parque São Lucas – Metrô Tatuapé" },
  { id: "364A-10", nome: "Hospital Ipiranga – Shopping Aricanduva" },
  { id: "573T-10", nome: "Term. Vila Carrão – Metrô Carrão" },
  { id: "4028-10", nome: "Hospital São Mateus – Divisa de Mauá" },
  { id: "4716-10", nome: "Vila Moraes – Metrô Santa Cruz" },
  { id: "4030-10", nome: "Fazenda da Juta – Shopping Aricanduva" },
  { id: "3099-10", nome: "Hospital São Mateus – Jardim da Conquista" },
  { id: "4027-10", nome: "Jardim Santo André – Fazenda da Juta" },
  { id: "3098-10", nome: "Jardim Marilu – Terminal São Mateus" },
  { id: "4029-10", nome: "São Mateus – Vila Prudente" },
  { id: "5035-10", nome: "Vila Moinho Velho – Term. Sacomã" },
  { id: "3098-31", nome: "Jardim Marilu – Terminal São Mateus (Noturno)" },
  { id: "4027-41", nome: "Jardim Santo André – Metrô Itaquera" },
  { id: "4729-10", nome: "Parque Bancário – Metrô Belém" },
  { id: "574W-10", nome: "Jardim Walkiria – Metrô Belém" },
  { id: "5031-21", nome: "Vila Arapuá – Term. Sacomã (Pico)" },
  { id: "4032-10", nome: "Vila das Mercês – Objetivo UNIP" },
  { id: "4735-10", nome: "Jardim Vera Cruz – Metrô Artur Alvim" },
  { id: "5025-10", nome: "Jardim Guairacá – Metrô Tamanduateí" }
];

function Dashboard({ visible }: { visible: boolean }) {
  const [selectedLinha, setSelectedLinha] = useState<Linha | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLinhas = linhas.filter(l =>
    l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!visible) return null;

  return (
    <div style={{
        position: 'relative', zIndex: 20, maxWidth: '1200px', margin: '0 auto', padding: '20px',
        color: '#00ff88', fontFamily: "'Courier New', monospace", opacity: 0, animation: 'fadeIn 1s forwards'
    }}>
        <style>{`
            @keyframes fadeIn { to { opacity: 1; } }
            @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
            .hover-card:hover { transform: scale(1.02); border-color: #00ff88 !important; box-shadow: 0 0 15px rgba(0,255,136,0.2); }
        `}</style>

        {/* HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #00ff88', paddingBottom: '20px', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', textShadow: '2px 2px #ff3e3e', margin: 0 }}>MOVEBUSS</h1>
                <p style={{ letterSpacing: '4px', color: '#00d4ff', fontSize: '0.8rem', margin: '5px 0 0 0' }}>CONTROLE OPERACIONAL</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                <p style={{ color: '#00ff88', fontWeight: 'bold' }}>● SYSTEM ACTIVE</p>
                <p style={{ color: '#888', marginTop: '5px' }}>R. Murta do Campo, 405 - Vila Alpina</p>
            </div>
        </header>

        {/* IMAGENS E CONTEUDO */}
        <div style={{ position: 'relative', borderRadius: '10px', border: '1px solid #00ff88', overflow: 'hidden', marginBottom: '30px' }}>
            <img src="https://movebuss.com.br/wp-content/uploads/2025/04/Imagem-do-WhatsApp-de-2025-04-29-as-10.29.58_c74f9ad6-1.jpg" style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: '#00ff88', boxShadow: '0 0 20px #00ff88', animation: 'scan 4s linear infinite' }} />
        </div>

        <input type="text" placeholder="🔍 Buscar linha..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '15px', background: 'rgba(0,0,0,0.6)', border: '1px solid #00ff88', color: '#fff', borderRadius: '8px', marginBottom: '20px', outline: 'none' }} />
        <p style={{ textAlign: 'center', color: '#ff3e3e', fontSize: '0.9rem', marginBottom: '20px' }}>[ SELECIONE UMA LINHA PARA TELEMETRIA ]</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            {filteredLinhas.map(l => (
                <div key={l.id} className="hover-card" onClick={() => setSelectedLinha(l)} style={{ background: 'linear-gradient(135deg, #001a0d, #000)', border: '1px solid #004422', padding: '20px', borderRadius: '8px', cursor: 'pointer', transition: '0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#ff3e3e', fontWeight: 'bold', fontSize: '1.2rem' }}>{l.id}</span>
                        <span style={{ width: '8px', height: '8px', background: '#00ff88', borderRadius: '50%' }} />
                    </div>
                    <p style={{ color: '#ccc', fontSize: '0.9rem', marginTop: '10px' }}>{l.nome}</p>
                </div>
            ))}
        </div>

        <div style={{ position: 'relative', borderRadius: '10px', border: '1px solid rgba(0,255,136,0.4)', overflow: 'hidden', marginBottom: '30px' }}>
            <img src="https://movebuss.com.br/wp-content/uploads/2025/04/Imagem-do-WhatsApp-de-2025-04-29-as-10.30.07_ed1178f5-1.jpg" style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: '#00ff88', boxShadow: '0 0 20px #00ff88', animation: 'scan 4s linear infinite', animationDelay: '2s' }} />
        </div>

        <BusAnimation />

        <footer style={{ textAlign: 'center', borderTop: '1px solid #333', paddingTop: '30px', color: '#666', fontSize: '0.8rem' }}>
            SISTEMA OPERACIONAL MOVEBUSS // 2026<br/>
            <a href="https://movebuss.com.br" style={{ color: '#00ff88', textDecoration: 'none', fontSize: '1.2rem', marginTop: '10px', display: 'inline-block' }}>movebuss.com.br</a>
        </footer>

        {selectedLinha && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }} onClick={() => setSelectedLinha(null)}>
                <div style={{ background: '#000', border: '2px solid #00ff88', borderRadius: '10px', padding: '30px', width: '100%', maxWidth: '400px', boxShadow: '0 0 50px rgba(0,255,136,0.2)' }} onClick={e => e.stopPropagation()}>
                    <h2 style={{ color: '#ff3e3e', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '15px' }}>LINHA {selectedLinha.id}</h2>
                    <p style={{ color: '#fff', marginBottom: '20px', fontSize: '0.9rem' }}>{selectedLinha.nome}</p>
                    <div style={{ fontSize: '0.9rem' }}>
                        {[
                            ['Duração Viagem', `${dadosGTFS[selectedLinha.id]?.dur || 45} min`],
                            ['Intervalo', `${dadosGTFS[selectedLinha.id]?.int || 10} min`],
                            ['Veículos/Hora', `${Math.round(60 / (dadosGTFS[selectedLinha.id]?.int || 10))} ônibus`],
                            ['Frota', 'DIESEL'],
                            ['Distância', `${dadosGTFS[selectedLinha.id]?.dist || 12} km`],
                        ].map(([label, value], i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dotted #333' }}>
                                <span style={{ color: '#888' }}>{label}:</span><span style={{ color: '#00ff88' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setSelectedLinha(null)} style={{ width: '100%', marginTop: '25px', padding: '15px', background: '#ff3e3e', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '5px' }}>FECHAR TERMINAL</button>
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
    const t1 = setTimeout(() => setStage('earth'), 3000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (stage === 'earth') {
      const interval = setInterval(() => {
        setEarthProgress(prev => {
          if (prev >= 1) { clearInterval(interval); return 1; }
          return prev + 0.02;
        });
      }, 50);
      const t2 = setTimeout(() => setStage('dashboard'), 4000);
      return () => { clearInterval(interval); clearTimeout(t2); };
    }
  }, [stage]);

  return (
    <div style={{ background: '#000', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      <GalaxyCanvas active={stage === 'galaxy'} />
      <EarthCanvas active={stage === 'earth'} progress={earthProgress} />
      <MatrixRain active={stage === 'dashboard'} />
      <LoadingOverlay stage={stage} />
      <Dashboard visible={stage === 'dashboard'} />
      {stage !== 'dashboard' && (
        <button onClick={() => setStage('dashboard')} style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', border: '1px solid #00ff88', color: '#00ff88', padding: '10px 20px', cursor: 'pointer', zIndex: 100, borderRadius: '5px', fontSize: '0.8rem' }}>
          PULAR INTRO →
        </button>
      )}
    </div>
  );
}
