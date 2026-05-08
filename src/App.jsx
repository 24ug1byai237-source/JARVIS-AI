import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Sphere, MeshDistortMaterial, Float, PerspectiveCamera, Text, Stars, 
  PresentationControls, Environment, OrbitControls 
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  Mic, MicOff, Music, Terminal, LayoutDashboard, Settings, 
  Youtube, Github, Activity, Database, Zap, MessageSquare,
  Lock, Unlock, ChevronRight, Power, Cpu, Shield
} from 'lucide-react';

// --- CONTACTS ---
const CONTACTS = {
    "ullas": "+916361258145",
    "aryan": "+919142817966",
    "akshata": "+919980965961",
    "ganesh": "+918197900121"
};

// --- 3D COMPONENTS ---

const AIOrb = ({ color, isListening, dreamMode, isUnlocked, onUnlock }) => {
  const mesh = useRef();
  const innerMesh = useRef();
  const outerMesh = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.x = time * 0.2;
      mesh.current.rotation.y = time * 0.3;
      const scale = isListening ? 1.2 + Math.sin(time * 10) * 0.1 : (isUnlocked ? 1 : 1.1 + Math.sin(time * 2) * 0.05);
      mesh.current.scale.set(scale, scale, scale);
    }
    if (outerMesh.current) {
      outerMesh.current.rotation.z = -time * 0.1;
      outerMesh.current.rotation.x = time * 0.15;
    }
    if (innerMesh.current) {
      innerMesh.current.rotation.y = -time * 0.5;
    }
  });

  const orbColor = dreamMode ? "#bc13fe" : (isUnlocked ? color : "#ff3333");

  return (
    <group onClick={!isUnlocked ? onUnlock : undefined}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <mesh ref={mesh}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial
            color={orbColor}
            speed={3}
            distort={isListening ? 0.6 : 0.4}
            radius={1}
            emissive={orbColor}
            emissiveIntensity={isUnlocked ? 1.5 : 2}
            roughness={0}
            metalness={1}
          />
        </mesh>

        <mesh ref={outerMesh}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshBasicMaterial color={orbColor} transparent opacity={0.3} />
        </mesh>
        
        <mesh ref={innerMesh}>
          <torusGeometry args={[1.3, 0.01, 16, 100]} rotation={[Math.PI / 2, 0, 0]} />
          <meshBasicMaterial color={orbColor} transparent opacity={0.5} />
        </mesh>
        
        <pointLight color={orbColor} intensity={2} distance={10} />
      </Float>
    </group>
  );
};

const BackgroundParticles = ({ dreamMode, isUnlocked }) => {
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, []);

  const points = useRef();
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    points.current.rotation.y = time * 0.05;
    if (dreamMode) {
      points.current.rotation.x = time * 0.03;
    }
  });

  const color = dreamMode ? "#bc13fe" : (isUnlocked ? "#00f2ff" : "#ff3333");

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
};

const FloatingGrid = ({ dreamMode }) => {
  const gridRef = useRef();
  useFrame((state) => {
    gridRef.current.position.z = (state.clock.getElapsedTime() * 0.5) % 2;
  });

  return (
    <group ref={gridRef}>
      <gridHelper 
        args={[100, 50, dreamMode ? "#8b5cf6" : "#06b6d4", dreamMode ? "#4c1d95" : "#083344"]} 
        position={[0, -5, 0]} 
      />
    </group>
  );
};

const GlassCard = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`glass-panel p-6 rounded-2xl ${className}`}
  >
    {children}
  </motion.div>
);

const TerminalLog = ({ logs }) => (
  <div className="h-full overflow-y-auto font-rajdhani text-sm space-y-1 pr-2">
    {logs.map((log, i) => (
      <div key={i} className="flex gap-2">
        <span className={log.type === 'ai' ? 'text-lumina-cyan' : log.type === 'error' ? 'text-red-500' : 'text-gray-400'}>
          {log.type === 'ai' ? 'λ JARVIS:' : log.type === 'system' ? '§ SYS:' : '>'}
        </span>
        <span className={log.type === 'ai' ? 'cyan-glow-text' : 'text-white'}>{log.text}</span>
      </div>
    ))}
  </div>
);

const MusicVisualizer = ({ active, dreamMode }) => {
  const bars = Array.from({ length: 20 });
  return (
    <div className="flex items-end gap-1 h-12">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: active ? [10, Math.random() * 40 + 10, 10] : 4
          }}
          transition={{
            repeat: Infinity,
            duration: 0.5 + Math.random() * 0.5,
            ease: "easeInOut"
          }}
          className={`w-1 rounded-full ${dreamMode ? 'bg-lumina-purple' : 'bg-lumina-cyan'}`}
          style={{ boxShadow: active ? `0 0 10px ${dreamMode ? '#bc13fe' : '#00f2ff'}` : 'none' }}
        />
      ))}
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [booting, setBooting] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [dreamMode, setDreamMode] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'system', text: 'Neural pathways secured.' },
    { type: 'ai', text: 'JARVIS initialized. Waiting for biometric unlock.' }
  ]);
  const [currentMusic, setCurrentMusic] = useState(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const recognitionRef = useRef(null);
  const lastCommandRef = useRef("");

  // Initialize Speech Recognition
  useEffect(() => {
    if (window.webkitSpeechRecognition) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const command = lastResult[0].transcript.toLowerCase().trim();
          if (command !== lastCommandRef.current) {
            lastCommandRef.current = command;
            handleCommand(command);
            setTimeout(() => { lastCommandRef.current = ""; }, 4000);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    setTimeout(() => setBooting(false), 3000);

    const handleMouseMove = (e) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 0.9;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const addLog = useCallback((text, type = 'ai') => {
    setTerminalLogs(prev => [...prev, { text, type }].slice(-20));
    if (type === 'ai') speak(text);
  }, [speak]);

  const handleCommand = useCallback((command) => {
    const cmd = command.toLowerCase().trim();
    if (!cmd || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setIsProcessing(true);
    addLog(command, 'user');
    
    let response = "";

    if (cmd.includes('open youtube')) {
      response = 'Accessing YouTube servers. Redirecting now.';
      window.open('https://youtube.com', '_blank');
    } else if (cmd.includes('open google')) {
      response = 'Opening Google search portal.';
      window.open('https://google.com', '_blank');
    } else if (cmd.includes('open spotify')) {
      response = 'Connecting to Spotify stream.';
      window.open('https://spotify.com', '_blank');
    } else if (cmd.includes('open github')) {
      response = 'Linking to GitHub repositories.';
      window.open('https://github.com', '_blank');
    } else if (cmd.includes('open netflix')) {
      response = 'Starting Netflix cinematic session.';
      window.open('https://netflix.com', '_blank');
    } else if (cmd.includes('open chatgpt')) {
      response = 'Opening Neural Intelligence Core.';
      window.open('https://chat.openai.com', '_blank');
    } else if (cmd.includes('open calculator')) {
      response = 'Deploying Calculator module.';
      setActiveTab('calculator');
    } else if (cmd.includes('open dashboard')) {
      response = 'Returning to Central Dashboard.';
      setActiveTab('dashboard');
    } else if (cmd.includes('activate dream mode')) {
      response = 'Dream Mode activated. Modifying environment.';
      setDreamMode(true);
    } else if (cmd.includes('stop listening')) {
      response = 'Voice recognition standby.';
      toggleListening();
    }
    else if (cmd.includes('play ') || cmd.includes('play song')) {
      let song = cmd.replace('play song', '').replace('play', '').trim();
      if (song) {
        response = `Locating ${song} and initiating playback.`;
        setCurrentMusic(song);
        setIsMusicPlaying(true);
        const searchUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(song)}&autoplay=1`;
        window.open(searchUrl, '_blank');
      } else {
        response = "Please specify a song name.";
      }
    } else if (cmd.includes('pause music') || cmd.includes('stop music')) {
      response = 'Audio sequence halted.';
      setIsMusicPlaying(false);
    } 
    else if (cmd.startsWith('message') || cmd.startsWith('send message to')) {
      const parts = cmd.split(' ');
      let name = "";
      let message = "";
      if (cmd.startsWith('send message to')) {
        name = parts[3];
        message = parts.slice(4).join(' ');
      } else {
        name = parts[1];
        message = parts.slice(2).join(' ');
      }
      const contact = CONTACTS[name.toLowerCase()];
      if (contact) {
        response = `Transmitting message to ${name.toUpperCase()} via WhatsApp.`;
        window.open(`https://wa.me/${contact.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
      } else {
        response = `Contact ${name} not found in database.`;
        addLog(response, 'error');
        response = "";
      }
    } else {
      response = 'Command recognized. Protocol undefined.';
    }

    if (response) addLog(response, 'ai');

    setTimeout(() => {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }, 2000);
  }, [addLog]);

  const handleUnlock = () => {
    gsap.to(".boot-overlay", { opacity: 0, duration: 1, onComplete: () => setIsUnlocked(true) });
    addLog('Biometric verified. Welcome back, Ullas.', 'ai');
    setTimeout(() => {
      if (!isListening) recognitionRef.current?.start();
    }, 1500);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  if (booting) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="scanline"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex flex-col items-center"
        >
          <div className="w-32 h-32 mb-8 relative">
            <div className="absolute inset-0 border-2 border-lumina-cyan rounded-full animate-ping opacity-25"></div>
            <div className="absolute inset-0 border-2 border-lumina-cyan rounded-full animate-spin border-t-transparent"></div>
          </div>
          <h1 className="font-orbitron text-4xl font-black cyan-glow-text tracking-[0.5em]">JARVIS</h1>
          <p className="mt-4 font-rajdhani text-xs tracking-widest text-white/30">SYSTEM LOADING...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen relative overflow-hidden transition-colors duration-1000 ${dreamMode ? 'bg-[#100018]' : 'bg-[#050505]'}`}>
      <div className="scanline"></div>
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color={dreamMode ? "#bc13fe" : "#00f2ff"} />
          
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <AIOrb 
              color="#00f2ff" 
              isListening={isListening} 
              dreamMode={dreamMode} 
              isUnlocked={isUnlocked}
              onUnlock={handleUnlock}
            />
          </PresentationControls>

          <BackgroundParticles dreamMode={dreamMode} isUnlocked={isUnlocked} />
          <FloatingGrid dreamMode={dreamMode} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <Suspense fallback={null}>
            <EffectComposer>
              <Bloom intensity={1.5} luminanceThreshold={0.1} radius={0.5} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {!isUnlocked && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md boot-overlay pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-8"
          >
            <div 
              onClick={handleUnlock}
              className="w-48 h-48 rounded-full border-4 border-red-500/30 flex items-center justify-center cursor-pointer group relative transition-all hover:border-red-500"
            >
              <div className="absolute inset-0 rounded-full bg-red-500/10 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              <Lock size={64} className="text-red-500 group-hover:hidden" />
              <Unlock size={64} className="text-red-500 hidden group-hover:block animate-pulse" />
            </div>
            <div className="text-center">
              <h2 className="font-orbitron text-2xl text-red-500 mb-2">SYSTEM LOCKED</h2>
              <p className="font-rajdhani text-white/40 tracking-[0.2em] uppercase text-sm">Tap the Core to Initiate Biometric Sync</p>
            </div>
          </motion.div>
        </div>
      )}

      <div className={`grid-bg transition-opacity duration-1000 ${dreamMode ? 'opacity-20' : 'opacity-10'}`}></div>

      <AnimatePresence>
        {isUnlocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 flex flex-col p-8 pointer-events-none"
          >
            <header className="flex justify-between items-start pointer-events-auto">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex flex-col"
              >
                <h1 className={`font-orbitron text-4xl font-black tracking-tighter ${dreamMode ? 'text-lumina-purple shadow-[#bc13fe]' : 'cyan-glow-text'}`}>
                  JARVIS <span className="font-light opacity-50">PRO</span>
                </h1>
                <div className="flex items-center gap-2 mt-2 font-rajdhani text-xs tracking-widest text-white/40">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  ENCRYPTED CHANNEL ACTIVE // USER: ULLAS
                </div>
              </motion.div>

              <div className="flex gap-4">
                <GlassCard className="px-4 py-2 flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-rajdhani text-[10px] text-white/40 uppercase tracking-tighter">Voice Status</div>
                    <div className={`font-orbitron text-xs ${isListening ? 'text-green-500' : 'text-red-500'}`}>
                      {isListening ? 'LISTENING' : 'OFFLINE'}
                    </div>
                  </div>
                  {isListening ? <Mic size={18} className="text-green-500" /> : <MicOff size={18} className="text-red-500" />}
                </GlassCard>
              </div>
            </header>

            <main className="flex-1 flex gap-8 mt-12 pointer-events-none">
              <aside className="w-20 flex flex-col gap-4 pointer-events-auto">
                {[
                  { id: 'dashboard', icon: LayoutDashboard },
                  { id: 'music', icon: Music },
                  { id: 'terminal', icon: Terminal },
                  { id: 'whatsapp', icon: MessageSquare },
                  { id: 'settings', icon: Settings },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 group
                      ${activeTab === item.id 
                        ? (dreamMode ? 'bg-lumina-purple/20 border-lumina-purple' : 'bg-lumina-cyan/20 border-lumina-cyan') 
                        : 'bg-white/5 border-transparent hover:bg-white/10'} 
                      border`}
                  >
                    <item.icon size={24} className={activeTab === item.id ? (dreamMode ? 'text-lumina-purple' : 'text-lumina-cyan') : 'text-white/40 group-hover:text-white'} />
                  </button>
                ))}
              </aside>

              <div className="flex-1 flex flex-col gap-8 pointer-events-none">
                <div className="flex-1 grid grid-cols-12 gap-8 pointer-events-auto">
                  <div className="col-span-8 flex flex-col gap-8">
                    <GlassCard className="flex-1 relative overflow-hidden flex flex-col">
                      {activeTab === 'dashboard' && (
                        <div className="w-full h-full flex flex-col">
                          <h2 className="font-orbitron text-xl uppercase tracking-widest opacity-60 mb-8">Central Command</h2>
                          <div className="grid grid-cols-3 gap-6 flex-1">
                            {[
                              { label: 'Neural Link', value: '98%', icon: Cpu, color: 'text-cyan-400' },
                              { label: 'System Memory', value: '12%', icon: Database, color: 'text-purple-400' },
                              { label: 'Uplink Speed', value: '5GB/s', icon: Zap, color: 'text-yellow-400' },
                            ].map((stat, i) => (
                              <div key={i} className="glass-panel p-4 rounded-xl flex flex-col justify-between">
                                <stat.icon size={20} className={stat.color} />
                                <div>
                                  <div className="text-[10px] font-rajdhani text-white/30">{stat.label}</div>
                                  <div className="text-2xl font-orbitron">{stat.value}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-8 flex-1 glass-panel p-6 rounded-xl relative overflow-hidden">
                            <TerminalLog logs={terminalLogs} />
                          </div>
                        </div>
                      )}

                      {activeTab === 'music' && (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <div className="w-48 h-48 rounded-full border-2 border-lumina-cyan/20 flex items-center justify-center relative mb-8">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                              className="absolute inset-0 border-2 border-t-lumina-cyan rounded-full"
                            />
                            <Music size={48} className={isMusicPlaying ? 'text-lumina-cyan animate-pulse' : 'text-white/20'} />
                          </div>
                          <h3 className="font-orbitron text-xl mb-2">{currentMusic || "Idle - Awaiting Selection"}</h3>
                          <MusicVisualizer active={isMusicPlaying} dreamMode={dreamMode} />
                        </div>
                      )}

                      {activeTab === 'whatsapp' && (
                        <div className="w-full h-full flex flex-col">
                          <h2 className="font-orbitron text-xl uppercase tracking-widest opacity-60 mb-8">Communication Core</h2>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(CONTACTS).map(([name, num]) => (
                              <div 
                                key={name}
                                className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:border-lumina-cyan cursor-pointer transition-all"
                                onClick={() => window.open(`https://wa.me/${num.replace('+', '')}`, '_blank')}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-orbitron text-lumina-cyan capitalize">{name[0]}</div>
                                  <div>
                                    <div className="font-orbitron text-sm capitalize">{name}</div>
                                    <div className="font-rajdhani text-xs text-white/30">{num}</div>
                                  </div>
                                </div>
                                <ChevronRight size={16} className="text-white/20 group-hover:text-lumina-cyan" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  </div>

                  <div className="col-span-4 flex flex-col gap-8">
                    <GlassCard className="flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className={`w-32 h-32 rounded-full border-2 ${isListening ? 'border-lumina-cyan shadow-[0_0_30px_rgba(0,242,255,0.3)]' : 'border-white/10'} flex items-center justify-center transition-all duration-500`}>
                        {isListening ? (
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                            <Mic size={40} className="text-lumina-cyan" />
                          </motion.div>
                        ) : (
                          <MicOff size={40} className="text-white/10" />
                        )}
                      </div>
                      <h3 className="font-orbitron text-lg mt-6">{isListening ? 'Listening...' : 'Mic Standby'}</h3>
                      <button 
                        onClick={toggleListening}
                        className="mt-8 px-8 py-3 rounded-full bg-lumina-cyan/10 border border-lumina-cyan/50 font-orbitron text-[10px] tracking-widest hover:bg-lumina-cyan hover:text-black transition-all"
                      >
                        {isListening ? 'DEACTIVATE' : 'ACTIVATE VOICE'}
                      </button>
                    </GlassCard>

                    <GlassCard className="h-48 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <span className="font-orbitron text-[10px] text-white/30">SYSTEM SECURITY</span>
                        <Shield size={16} className="text-green-500" />
                      </div>
                      <div className="flex-1 flex items-center justify-center font-orbitron text-2xl">VERIFIED</div>
                    </GlassCard>
                  </div>
                </div>
              </div>
            </main>

            <footer className="mt-8 flex justify-between items-end pointer-events-auto">
              <div className="flex gap-8 font-rajdhani text-[10px] tracking-widest text-white/30 uppercase">
                <div className="flex flex-col">
                  <span>Connection</span>
                  <span className="text-lumina-cyan font-bold">SECURE // P2P</span>
                </div>
              </div>
              <button onClick={() => window.location.reload()} className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                <Power size={20} />
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`fixed w-6 h-6 rounded-full pointer-events-none z-50 blur-md ${dreamMode ? 'bg-lumina-purple/30' : 'bg-lumina-cyan/30'}`}
        animate={{
          x: (mousePos.x + 1) * window.innerWidth / 2 - 12,
          y: (mousePos.y + 1) * window.innerHeight / 2 - 12,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
      />
    </div>
  );
}
