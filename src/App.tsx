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

    // Forçar tamanho caso CSS falhe
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
      // Se não estiver ativo, limpamos e paramos de desenhar para economizar recurso
      if (!active) {
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         return; 
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Rastro mais curto
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      stars.forEach(star => {
        star.prevZ = star.z;
        star.z -= 25; // Velocidade

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

    if (active) {
        animate();
    }

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
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        opacity: active ? 1 : 0, 
        transition: 'opacity 1s', 
        zIndex: active ? 5 : -1,
        background: '#000' // Garante fundo preto
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
    img.crossOrigin = 'anonymous';
    img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/600px-The_Blue_Marble_%28remastered%29.jpg';
    img.onload = () => {
      earthImgRef.current = img;
      setImgLoaded(true);
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
      if (!active) return;

      ctx.fillStyle = '#000010';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.35;
      const radius = maxRadius * Math.min(progress, 1);

      // Estrelas de fundo
      for (let i = 0; i < 100; i++) {
         const x = (Math.sin(i * 123) * 0.5 + 0.5) * canvas.width;
         const y = (Math.cos(i * 321) * 0.5 + 0.5) * canvas.height;
         ctx.fillStyle = 'white';
         ctx.fillRect(x, y, 1, 1);
      }

      if (radius > 5) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();

        if (earthImgRef.current && imgLoaded) {
          const size = radius * 2.1;
          ctx.drawImage(earthImgRef.current, centerX - size / 2, centerY - size / 2, size, size);
        } else {
          // Fallback
          const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          grad.addColorStop(0, '#1e90ff');
          grad.addColorStop(1, '#000033');
          ctx.fillStyle = grad;
          ctx.fill();
        }
        ctx.restore();

        // Atmosfera
        ctx.shadowColor = '#4aa3ff';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = 'rgba(74, 163, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Marcador SP
        if (progress > 0.5) {
            const markerX = centerX - radius * 0.15;
            const markerY = centerY + radius * 0.25;
            
            ctx.beginPath();
            ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#00ff88';
            ctx.fill();
            
            // Pulse
            ctx.beginPath();
            ctx.arc(markerX, markerY, 10 + Math.sin(time * 0.1) * 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
            ctx.stroke();
        }
      }

      time++;
      animationId = requestAnimationFrame(animate);
    };

    if (active) animate();

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
    }
  }, [active, progress, imgLoaded]);

  return (
    <canvas
      ref={canvasRef}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        opacity: active ? 1 : 0, 
        transition: 'opacity 1s', 
        zIndex: active ? 10 : -1 
      }}
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

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);
    
    let animationId: number;

    const animate = () => {
        if (!active) return;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff88';
        ctx.font = '15px monospace';
        
        for(let i=0; i<drops.length; i++) {
            const text = String.fromCharCode(0x30A0 + Math.random() * 96);
            ctx.fillText(text, i*20, drops[i]*20);
            
            if(drops[i]*20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        animationId = requestAnimationFrame(animate);
    };

    if (active) animate();

    return () => cancelAnimationFrame(animationId);
  }, [active]);

  return (
    <canvas 
        ref={canvasRef} 
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: active ? 0.3 : 0,
            pointerEvents: 'none',
            zIndex: 1
        }} 
    />
  );
}

// ============ DASHBOARD ============
interface Linha { id: string; nome: string; }
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

    const filtered = linhas.filter(l => l.id.toLowerCase().includes(searchTerm.toLowerCase()) || l.nome.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!visible) return null;

    return (
        <div style={{ position: 'relative', zIndex: 10, padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#00ff88', fontFamily: 'monospace' }}>
            
            <header style={{ borderBottom: '2px solid #00ff88', paddingBottom: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2em', fontWeight: 'bold', textShadow: '2px 2px #ff3e3e' }}>MOVEBUSS</h1>
                    <p style={{ letterSpacing: '3px', fontSize: '0.8em', color: '#00d4ff' }}>CONTROLE OPERACIONAL</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8em' }}>
                    <p>● SYSTEM ACTIVE</p>
                    <p style={{ color: '#aaa' }}>R. Murta do Campo, 405 - Vila Alpina</p>
                </div>
            </header>

            <div style={{ marginBottom: '20px', border: '1px solid #00ff88', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                <img src="https://movebuss.com.br/wp-content/uploads/2025/04/Imagem-do-WhatsApp-de-2025-04-29-as-10.29.58_c74f9ad6-1.jpg" style={{ width: '100%', display: 'block' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }} />
            </div>

            <input 
                type="text" 
                placeholder="Buscar linha..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '15px', background: '#001100', border: '1px solid #00ff88', color: '#00ff88', marginBottom: '20px', borderRadius: '5px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                {filtered.map(l => (
                    <div 
                        key={l.id} 
                        onClick={() => setSelectedLinha(l)}
                        style={{ background: '#001a0d', border: '1px solid #004422', padding: '15px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        <strong style={{ color: '#ff3e3e', fontSize: '1.2em' }}>{l.id}</strong>
                        <p style={{ color: '#ccc', fontSize: '0.9em', marginTop: '5px' }}>{l.nome}</p>
                    </div>
                ))}
            </div>

            <footer style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #333', paddingTop: '20px', color: '#555' }}>
                SISTEMA OPERACIONAL MOVEBUSS // 2026
            </footer>

            {selectedLinha && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setSelectedLinha(null)}>
                    <div style={{ background: '#000', border: '2px solid #00ff88', padding: '30px', width: '90%', maxWidth: '400px', borderRadius: '10px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: '#ff3e3e', borderBottom: '1px solid #333', paddingBottom: '10px' }}>LINHA {selectedLinha.id}</h2>
                        <p style={{ color: '#fff', margin: '15px 0' }}>{selectedLinha.nome}</p>
                        <div style={{ fontSize: '0.9em' }}>
                            <p style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dotted #333' }}>
                                <span>Duração:</span> <span style={{ color: '#00ff88' }}>~ 75 min</span>
                            </p>
                            <p style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dotted #333' }}>
                                <span>Intervalo:</span> <span style={{ color: '#00ff88' }}>10 min</span>
                            </p>
                            <p style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dotted #333' }}>
                                <span>Frota:</span> <span style={{ color: '#00ff88' }}>DIESEL</span>
                            </p>
                        </div>
                        <button onClick={() => setSelectedLinha(null)} style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#ff3e3e', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>FECHAR TERMINAL</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============ MAIN APP ============
export default function App() {
  const [stage, setStage] = useState<Stage>('galaxy');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage('earth'), 3000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (stage === 'earth') {
        const int = setInterval(() => {
            setProgress(p => {
                if(p >= 1) {
                    clearInterval(int);
                    return 1;
                }
                return p + 0.02;
            });
        }, 50);
        const t2 = setTimeout(() => setStage('dashboard'), 4000);
        return () => { clearInterval(int); clearTimeout(t2); }
    }
  }, [stage]);

  return (
    <div style={{ background: '#000', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <GalaxyCanvas active={stage === 'galaxy'} />
      <EarthCanvas active={stage === 'earth'} progress={progress} />
      <MatrixRain active={stage === 'dashboard'} />
      
      <div style={{ 
          position: 'fixed', 
          inset: 0, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          pointerEvents: 'none',
          opacity: stage !== 'dashboard' ? 1 : 0,
          transition: 'opacity 0.5s',
          zIndex: 20
      }}>
        {stage !== 'dashboard' && (
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ color: '#00ff88', fontSize: '3em', fontFamily: 'monospace', textShadow: '0 0 20px #00ff88' }}>MOVEBUSS</h1>
                <p style={{ color: '#fff', letterSpacing: '5px' }}>INICIANDO...</p>
            </div>
        )}
      </div>

      <Dashboard visible={stage === 'dashboard'} />

      {stage !== 'dashboard' && (
          <button 
            onClick={() => setStage('dashboard')}
            style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', border: '1px solid #00ff88', color: '#00ff88', padding: '10px 20px', zIndex: 100, cursor: 'pointer' }}
          >
              PULAR INTRO
          </button>
      )}
    </div>
  );
}
