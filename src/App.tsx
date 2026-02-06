import { useState, useEffect, useRef } from 'react'

interface Linha {
  id: string
  nome: string
}

interface DadosLinha {
  dur: number
  int: number
  dist: number
  frot: number
}

interface Star {
  x: number
  y: number
  z: number
  prevZ: number
  color: string
}

const dadosGTFS: Record<string, DadosLinha> = {
  "524M-10": {dur: 73, int: 7, dist: 12.5, frot: 10},
  "3112-10": {dur: 105, int: 12, dist: 12.5, frot: 9},
  "414P-10": {dur: 114, int: 14, dist: 12.5, frot: 8},
  "514T-10": {dur: 122, int: 12, dist: 12.5, frot: 16},
  "4033-10": {dur: 118, int: 13, dist: 12.5, frot: 15},
  "4734-10": {dur: 57, int: 4, dist: 12.5, frot: 14},
  "5020-10": {dur: 29, int: 6, dist: 12.5, frot: 5},
  "373T-10": {dur: 109, int: 10, dist: 12.5, frot: 16},
  "5032-10": {dur: 80, int: 6, dist: 12.5, frot: 12},
  "4025-10": {dur: 100, int: 7, dist: 12.5, frot: 14},
  "4726-10": {dur: 55, int: 4, dist: 12.5, frot: 14},
  "5031-10": {dur: 52, int: 5, dist: 12.5, frot: 15},
  "573H-10": {dur: 119, int: 8, dist: 12.5, frot: 16},
  "4031-10": {dur: 90, int: 10, dist: 12.5, frot: 9},
  "524L-10": {dur: 88, int: 20, dist: 12.5, frot: 4},
  "364A-10": {dur: 144, int: 11, dist: 12.5, frot: 13},
  "573T-10": {dur: 90, int: 8, dist: 12.5, frot: 12},
  "4028-10": {dur: 76, int: 9, dist: 12.5, frot: 8},
  "4716-10": {dur: 73, int: 11, dist: 12.5, frot: 7},
  "4030-10": {dur: 90, int: 12, dist: 12.5, frot: 8},
  "3099-10": {dur: 74, int: 6, dist: 12.5, frot: 13},
  "4027-10": {dur: 70, int: 6, dist: 12.5, frot: 13},
  "3098-10": {dur: 73, int: 8, dist: 12.5, frot: 9},
  "4029-10": {dur: 92, int: 11, dist: 12.5, frot: 8},
  "5035-10": {dur: 51, int: 8, dist: 12.5, frot: 6},
  "3098-31": {dur: 76, int: 12, dist: 12.5, frot: 6},
  "4027-41": {dur: 48, int: 20, dist: 12.5, frot: 2},
  "4729-10": {dur: 99, int: 20, dist: 12.5, frot: 5},
  "574W-10": {dur: 112, int: 12, dist: 12.5, frot: 9},
  "5031-21": {dur: 33, int: 6, dist: 12.5, frot: 6},
  "4032-10": {dur: 86, int: 20, dist: 12.5, frot: 4},
  "4735-10": {dur: 66, int: 20, dist: 12.5, frot: 3},
  "5025-10": {dur: 64, int: 14, dist: 12.5, frot: 5}
}

const linhas: Linha[] = [
  {id: "524M-10", nome: "Mascarenhas de Morais – Shopping Aricanduva"},
  {id: "3112-10", nome: "Vila Industrial – Metrô Belém"},
  {id: "414P-10", nome: "Vila Industrial – Metrô Carrão"},
  {id: "514T-10", nome: "Term. Sacomã – Conj. Hab. Teotônio Vilela"},
  {id: "4033-10", nome: "Jardim Guairacá – Nova Conquista"},
  {id: "4734-10", nome: "Vila Moraes – Metrô Saúde"},
  {id: "5020-10", nome: "Hospital Heliópolis – Term. Sacomã"},
  {id: "373T-10", nome: "Jardim Itápolis – Metrô Bresser"},
  {id: "5032-10", nome: "Vila Arapuá – Term. Sacomã"},
  {id: "4025-10", nome: "Vila Califórnia – Metrô Tatuapé"},
  {id: "4726-10", nome: "Mooca – Metrô Tatuapé"},
  {id: "5031-10", nome: "Vila Arapuá – Term. Sacomã"},
  {id: "573H-10", nome: "Hospital Heliópolis – Metrô Bresser"},
  {id: "4031-10", nome: "Pq. Santa Madalena – Metrô Tamanduateí"},
  {id: "524L-10", nome: "Parque São Lucas – Metrô Tatuapé"},
  {id: "364A-10", nome: "Hospital Ipiranga – Shopping Aricanduva"},
  {id: "573T-10", nome: "Term. Vila Carrão – Metrô Carrão"},
  {id: "4028-10", nome: "Hospital São Mateus – Divisa de Mauá"},
  {id: "4716-10", nome: "Vila Moraes – Metrô Santa Cruz"},
  {id: "4030-10", nome: "Fazenda da Juta – Shopping Aricanduva"},
  {id: "3099-10", nome: "Hospital São Mateus – Jardim da Conquista"},
  {id: "4027-10", nome: "Jardim Santo André – Fazenda da Juta"},
  {id: "3098-10", nome: "Jardim Marilu – Terminal São Mateus"},
  {id: "4029-10", nome: "São Mateus – Vila Prudente"},
  {id: "5035-10", nome: "Vila Moinho Velho – Term. Sacomã"},
  {id: "3098-31", nome: "Jardim Marilu – Terminal São Mateus (Noturno)"},
  {id: "4027-41", nome: "Jardim Santo André – Metrô Itaquera"},
  {id: "4729-10", nome: "Parque Bancário – Metrô Belém"},
  {id: "574W-10", nome: "Jardim Walkiria – Metrô Belém"},
  {id: "5031-21", nome: "Vila Arapuá – Term. Sacomã (Pico)"},
  {id: "4032-10", nome: "Vila das Mercês – Objetivo UNIP"},
  {id: "4735-10", nome: "Jardim Vera Cruz – Metrô Artur Alvim"},
  {id: "5025-10", nome: "Jardim Guairacá – Metrô Tamanduateí"}
]

function GalaxyCanvas({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars: Star[] = []
    const colors = ['#ffffff', '#00ff88', '#00d4ff', '#ff6b6b', '#ffd93d']

    for (let i = 0; i < 800; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width * 3,
        y: (Math.random() - 0.5) * canvas.height * 3,
        z: Math.random() * canvas.width,
        prevZ: 0,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    let animationId: number
    const speed = 50

    function animate() {
      ctx!.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

      const cx = canvas!.width / 2
      const cy = canvas!.height / 2

      stars.forEach(star => {
        star.prevZ = star.z
        star.z -= speed

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * canvas!.width * 3
          star.y = (Math.random() - 0.5) * canvas!.height * 3
          star.z = canvas!.width
          star.prevZ = star.z
        }

        const sx = (star.x / star.z) * 200 + cx
        const sy = (star.y / star.z) * 200 + cy
        const px = (star.x / star.prevZ) * 200 + cx
        const py = (star.y / star.prevZ) * 200 + cy
        const size = (1 - star.z / canvas!.width) * 4

        ctx!.beginPath()
        ctx!.moveTo(px, py)
        ctx!.lineTo(sx, sy)
        ctx!.strokeStyle = star.color
        ctx!.lineWidth = size
        ctx!.stroke()

        ctx!.beginPath()
        ctx!.arc(sx, sy, size / 2, 0, Math.PI * 2)
        ctx!.fillStyle = star.color
        ctx!.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const timer = setTimeout(() => {
      cancelAnimationFrame(animationId)
      onComplete()
    }, 3000)

    return () => {
      cancelAnimationFrame(animationId)
      clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-orbitron text-white mb-4 animate-pulse">
          MOVEBUSS
        </h1>
        <p className="text-[#00ff88] text-lg tracking-[0.5em]">INICIANDO SISTEMA...</p>
      </div>
    </div>
  )
}

function EarthCanvas({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoomLevel, setZoomLevel] = useState(0)
  const earthImageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/800px-The_Blue_Marble_%28remastered%29.jpg"
    img.onload = () => { earthImageRef.current = img }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars: {x: number, y: number, size: number, alpha: number}[] = []
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        alpha: Math.random()
      })
    }

    let animationId: number
    let rotation = 0
    let scanAngle = 0

    function animate() {
      ctx!.fillStyle = '#000011'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

      stars.forEach(star => {
        star.alpha = 0.3 + Math.random() * 0.7
        ctx!.beginPath()
        ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(255, 255, 255, ${star.alpha})`
        ctx!.fill()
      })

      const cx = canvas!.width / 2
      const cy = canvas!.height / 2
      const baseRadius = Math.min(canvas!.width, canvas!.height) * 0.15
      const radius = baseRadius + (zoomLevel * baseRadius * 2)

      ctx!.save()
      ctx!.beginPath()
      ctx!.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx!.clip()

      if (earthImageRef.current) {
        ctx!.save()
        ctx!.translate(cx, cy)
        rotation += 0.002
        const offsetX = (rotation * 100) % (radius * 2)
        ctx!.drawImage(earthImageRef.current, -radius - offsetX, -radius, radius * 4, radius * 2)
        ctx!.restore()
      } else {
        const gradient = ctx!.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius)
        gradient.addColorStop(0, '#4a90d9')
        gradient.addColorStop(0.5, '#2d5f8a')
        gradient.addColorStop(1, '#1a3a5c')
        ctx!.fillStyle = gradient
        ctx!.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)

        ctx!.fillStyle = '#3d8b3d'
        ctx!.beginPath()
        ctx!.ellipse(cx - radius * 0.3, cy - radius * 0.2, radius * 0.4, radius * 0.3, 0.3, 0, Math.PI * 2)
        ctx!.fill()
      }

      ctx!.restore()

      for (let i = 1; i <= 3; i++) {
        ctx!.beginPath()
        ctx!.arc(cx, cy, radius + i * 8, 0, Math.PI * 2)
        ctx!.strokeStyle = `rgba(100, 180, 255, ${0.3 / i})`
        ctx!.lineWidth = 10 / i
        ctx!.stroke()
      }

      ctx!.save()
      ctx!.translate(cx, cy)
      scanAngle += 0.03
      ctx!.rotate(scanAngle)
      const scanGradient = ctx!.createLinearGradient(0, 0, radius + 30, 0)
      scanGradient.addColorStop(0, 'rgba(0, 255, 136, 0)')
      scanGradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.8)')
      scanGradient.addColorStop(1, 'rgba(0, 255, 136, 0)')
      ctx!.beginPath()
      ctx!.moveTo(0, 0)
      ctx!.lineTo(radius + 30, 0)
      ctx!.strokeStyle = scanGradient
      ctx!.lineWidth = 3
      ctx!.stroke()
      ctx!.restore()

      if (zoomLevel > 0.3) {
        const spX = cx + 20
        const spY = cy + 10

        ctx!.beginPath()
        ctx!.arc(spX, spY, 8 + Math.sin(Date.now() / 200) * 3, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(0, 255, 136, 0.8)'
        ctx!.fill()

        ctx!.font = '14px monospace'
        ctx!.fillStyle = '#00ff88'
        ctx!.fillText('SÃO PAULO, BRASIL', spX + 20, spY)
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [zoomLevel])

  useEffect(() => {
    const zoomInterval = setInterval(() => {
      setZoomLevel(prev => {
        if (prev >= 1) {
          clearInterval(zoomInterval)
          setTimeout(onComplete, 500)
          return 1
        }
        return prev + 0.025
      })
    }, 100)
    return () => clearInterval(zoomInterval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-[#00ff88] text-lg font-mono tracking-wider animate-pulse">
          LOCALIZANDO: SÃO PAULO, BRASIL
        </p>
        <div className="mt-2 w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-[#00ff88] transition-all duration-100" style={{ width: `${zoomLevel * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

function BusAnimation({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [busPosition, setBusPosition] = useState(-300)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let roadOffset = 0
    let wheelRotation = 0
    let animationId: number

    function drawBus(x: number) {
      const busWidth = 280
      const busHeight = 90
      const y = canvas!.height / 2 + 50

      ctx!.fillStyle = '#ffffff'
      ctx!.beginPath()
      ctx!.roundRect(x, y - busHeight, busWidth, busHeight, [15, 15, 5, 5])
      ctx!.fill()

      ctx!.fillStyle = '#00aa55'
      ctx!.fillRect(x, y - busHeight + 25, busWidth, 35)

      ctx!.fillStyle = '#00cc66'
      ctx!.fillRect(x, y - 30, busWidth, 25)

      ctx!.fillStyle = '#1a1a2e'
      for (let i = 0; i < 5; i++) {
        const windowX = x + 45 + i * 45
        ctx!.beginPath()
        ctx!.roundRect(windowX, y - busHeight + 30, 35, 30, 3)
        ctx!.fill()
      }

      ctx!.fillStyle = '#1a1a2e'
      ctx!.beginPath()
      ctx!.roundRect(x + 5, y - busHeight + 20, 30, 50, 5)
      ctx!.fill()

      ctx!.fillStyle = '#111'
      ctx!.fillRect(x + 5, y - busHeight - 15, busWidth - 10, 18)
      ctx!.fillStyle = '#ff6600'
      ctx!.font = 'bold 12px Arial'
      ctx!.fillText('524M-10', x + 15, y - busHeight - 2)

      ctx!.fillStyle = '#00cc66'
      ctx!.font = 'bold 16px Arial'
      ctx!.fillText('MOVEBUSS', x + busWidth / 2 - 40, y - 12)

      const wheelRadius = 18
      const wheel1X = x + 50
      const wheel2X = x + busWidth - 50
      const wheelY = y

      for (const wx of [wheel1X, wheel2X]) {
        ctx!.fillStyle = '#222'
        ctx!.beginPath()
        ctx!.arc(wx, wheelY, wheelRadius, 0, Math.PI * 2)
        ctx!.fill()

        ctx!.fillStyle = '#444'
        ctx!.beginPath()
        ctx!.arc(wx, wheelY, wheelRadius - 5, 0, Math.PI * 2)
        ctx!.fill()

        ctx!.save()
        ctx!.translate(wx, wheelY)
        ctx!.rotate(wheelRotation)
        ctx!.strokeStyle = '#666'
        ctx!.lineWidth = 2
        for (let i = 0; i < 6; i++) {
          ctx!.beginPath()
          ctx!.moveTo(0, 0)
          ctx!.lineTo((wheelRadius - 5) * Math.cos(i * Math.PI / 3), (wheelRadius - 5) * Math.sin(i * Math.PI / 3))
          ctx!.stroke()
        }
        ctx!.restore()
      }

      ctx!.fillStyle = '#ffff00'
      ctx!.beginPath()
      ctx!.arc(x + busWidth - 5, y - busHeight + 35, 8, 0, Math.PI * 2)
      ctx!.fill()

      ctx!.fillStyle = '#ff0000'
      ctx!.beginPath()
      ctx!.arc(x + 5, y - busHeight + 35, 6, 0, Math.PI * 2)
      ctx!.fill()
    }

    function animate() {
      const gradient = ctx!.createLinearGradient(0, 0, 0, canvas!.height)
      gradient.addColorStop(0, '#0a0a1a')
      gradient.addColorStop(0.6, '#1a1a3a')
      gradient.addColorStop(1, '#2a2a4a')
      ctx!.fillStyle = gradient
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

      for (let i = 0; i < 100; i++) {
        ctx!.beginPath()
        ctx!.arc((i * 137) % canvas!.width, (i * 97) % (canvas!.height * 0.4), Math.random() * 1.5, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.5})`
        ctx!.fill()
      }

      ctx!.fillStyle = '#1a1a2e'
      for (let i = 0; i < 15; i++) {
        const buildingX = i * 100 - 50
        const buildingHeight = 80 + Math.sin(i * 2) * 40
        const buildingWidth = 60 + Math.cos(i) * 20
        ctx!.fillRect(buildingX, canvas!.height / 2 - buildingHeight + 50, buildingWidth, buildingHeight)
      }

      ctx!.fillStyle = '#333'
      ctx!.fillRect(0, canvas!.height / 2 + 70, canvas!.width, 100)

      roadOffset = (roadOffset + 8) % 50
      ctx!.fillStyle = '#ffcc00'
      for (let i = -1; i < canvas!.width / 50 + 1; i++) {
        ctx!.fillRect(i * 50 - roadOffset, canvas!.height / 2 + 115, 30, 4)
      }

      wheelRotation += 0.3
      drawBus(busPosition)

      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [busPosition])

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBusPosition(prev => {
        const target = window.innerWidth / 2 - 140
        if (prev >= target) {
          clearInterval(moveInterval)
          setTimeout(onComplete, 1500)
          return target
        }
        return prev + 8
      })
    }, 16)
    return () => clearInterval(moveInterval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
        <h2 className="text-3xl font-orbitron text-[#00ff88] mb-2">MOVEBUSS</h2>
        <p className="text-white/70 tracking-widest">SISTEMA OPERACIONAL</p>
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <span className="text-red-500 text-sm font-bold">LIVE</span>
      </div>
    </div>
  )
}

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const columns = Math.floor(canvas.width / 20)
    const drops: number[] = []
    for (let i = 0; i < columns; i++) drops[i] = Math.random() * -100

    const chars = 'MOVEBUSS01アイウエオカキクケコ'

    function animate() {
      ctx!.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)
      ctx!.fillStyle = '#00ff88'
      ctx!.font = '15px monospace'

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx!.fillStyle = `rgba(0, 255, 136, ${Math.random() * 0.5 + 0.3})`
        ctx!.fillText(char, i * 20, drops[i] * 20)
        if (drops[i] * 20 > canvas!.height && Math.random() > 0.99) drops[i] = 0
        drops[i]++
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-30" />
}

function Dashboard() {
  const [selectedLinha, setSelectedLinha] = useState<Linha | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLinhas = linhas.filter(l =>
    l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDados = (id: string): DadosLinha => dadosGTFS[id] || { dur: 45, int: 12, dist: 12, frot: 8 }

  return (
    <div className="relative z-10 min-h-screen">
      <MatrixRain />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <header className="border-b border-[#00ff88]/30 pb-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-[#00ff88] tracking-wider animate-pulse">MOVEBUSS</h1>
              <p className="text-xs tracking-[0.3em] text-white/50 mt-1">CONTROLE OPERACIONAL</p>
            </div>
            <div className="text-right text-xs text-white/70">
              <div className="text-[#00ff88]">SYSTEM ACTIVE: YES</div>
              <div>R. Murta do Campo, 405 - Vila Alpina</div>
              <div>São Paulo - SP, 03210-010</div>
            </div>
          </div>
        </header>

        <div className="relative w-full mb-6 border border-[#00ff88]/50 rounded-lg overflow-hidden bg-black">
          <img src="https://movebuss.com.br/wp-content/uploads/2025/04/Imagem-do-WhatsApp-de-2025-04-29-as-10.29.58_c74f9ad6-1.jpg" alt="MoveBuss Frota" className="w-full h-auto block" />
          <div className="absolute left-0 w-full h-1 animate-scanline" style={{ background: '#00ff88', boxShadow: '0 0 20px #00ff88, 0 0 40px #00ff88' }} />
        </div>

        <div className="mb-6">
          <input type="text" placeholder="🔍 Buscar linha ou destino..." className="w-full bg-black/80 border border-[#00ff88]/50 rounded-lg px-4 py-3 text-[#00ff88] placeholder-[#00ff88]/50 focus:outline-none focus:border-[#00ff88]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <h3 className="text-center text-[#ff3e3e] text-sm mb-6 tracking-wider">[ SELECIONE UMA LINHA PARA TELEMETRIA ]</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {filteredLinhas.map((linha) => (
            <div key={linha.id} onClick={() => setSelectedLinha(linha)} className="bg-[#001a0d]/90 border border-[#004422] rounded-lg p-4 cursor-pointer transition-all duration-300 hover:border-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] active:scale-[0.98]">
              <span className="text-[#ff3e3e] font-bold text-lg">{linha.id}</span>
              <span className="block text-white/80 text-sm mt-1">{linha.nome}</span>
            </div>
          ))}
        </div>

        <div className="relative w-full mb-8 border border-[#00ff88]/50 rounded-lg overflow-hidden bg-black">
          <img src="https://movebuss.com.br/wp-content/uploads/2025/04/Imagem-do-WhatsApp-de-2025-04-29-as-10.30.07_ed1178f5-1.jpg" alt="MoveBuss Operação" className="w-full h-auto block" />
          <div className="absolute left-0 w-full h-1 animate-scanline" style={{ background: '#00ff88', boxShadow: '0 0 20px #00ff88, 0 0 40px #00ff88' }} />
        </div>

        <footer className="text-center border-t border-white/10 pt-6 pb-8">
          <p className="text-white/30 text-xs mb-2">SISTEMA OPERACIONAL MOVEBUSS // 2026</p>
          <a href="https://movebuss.com.br" target="_blank" rel="noopener noreferrer" className="text-[#00ff88] text-lg hover:underline">movebuss.com.br</a>
        </footer>
      </div>

      {selectedLinha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedLinha(null)}>
          <div className="bg-black border-2 border-[#00ff88] rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[#ff3e3e] font-bold text-xl border-b border-white/20 pb-3 mb-4">LINHA {selectedLinha.id}</h3>
            <p className="text-white/80 text-sm mb-4">{selectedLinha.nome}</p>
