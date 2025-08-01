import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  particles: Particle[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

type EffectType = 'confetti' | 'fireworks' | 'balloons';

interface VisualEffectsManagerProps {
  trigger: boolean;
  effectType?: EffectType;
  duration?: number;
  onComplete?: () => void;
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#FFD700', '#FF69B4',
  '#00CED1', '#98FB98', '#F0E68C', '#FF7F50'
];

// Confetti Component (já existe)
const ConfettiEffect: React.FC<{ isActive: boolean; duration: number; onComplete: () => void }> = ({ 
  isActive, 
  duration, 
  onComplete 
}) => {
  const [confetti, setConfetti] = useState<any[]>([]);

  useEffect(() => {
    if (isActive) {
      const pieces: any[] = [];
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -20,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 4,
          rotation: Math.random() * 360,
          velocity: {
            x: (Math.random() - 0.5) * 4,
            y: Math.random() * 3 + 2
          }
        });
      }
      setConfetti(pieces);

      setTimeout(() => {
        setConfetti([]);
        onComplete();
      }, duration);
    }
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: piece.x,
              y: piece.y,
              rotate: piece.rotation,
              scale: 1,
              opacity: 1
            }}
            animate={{
              x: piece.x + piece.velocity.x * 100,
              y: window.innerHeight + 100,
              rotate: piece.rotation + 720,
              scale: [1, 1.2, 0.8],
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: duration / 1000,
              ease: "easeOut"
            }}
            className="absolute"
            style={{
              backgroundColor: piece.color,
              width: piece.size,
              height: piece.size,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Fireworks Component
const FireworksEffect: React.FC<{ isActive: boolean; duration: number; onComplete: () => void }> = ({ 
  isActive, 
  duration, 
  onComplete 
}) => {
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  useEffect(() => {
    if (isActive) {
      const createFirework = (id: number): Firework => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const particles: Particle[] = [];
        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 * i) / 20;
          const speed = Math.random() * 4 + 2;
          particles.push({
            id: i,
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color,
            life: 1
          });
        }

        return { id, x, y, color, particles };
      };

      const newFireworks: Firework[] = [];
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          newFireworks.push(createFirework(i));
          setFireworks(prev => [...prev, createFirework(i)]);
        }, i * 500);
      }

      setTimeout(() => {
        setFireworks([]);
        onComplete();
      }, duration);
    }
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {fireworks.map((firework) => (
          <div key={firework.id}>
            {firework.particles.map((particle) => (
              <motion.div
                key={`${firework.id}-${particle.id}`}
                initial={{
                  x: particle.x,
                  y: particle.y,
                  opacity: 1,
                  scale: 1
                }}
                animate={{
                  x: particle.x + particle.vx * 50,
                  y: particle.y + particle.vy * 50,
                  opacity: [1, 1, 0],
                  scale: [0, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  ease: "easeOut"
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: particle.color,
                  boxShadow: `0 0 10px ${particle.color}`
                }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Balloons Component
const BalloonsEffect: React.FC<{ isActive: boolean; duration: number; onComplete: () => void }> = ({ 
  isActive, 
  duration, 
  onComplete 
}) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  useEffect(() => {
    if (isActive) {
      const newBalloons: Balloon[] = [];
      for (let i = 0; i < 15; i++) {
        newBalloons.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 50,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 30 + 40
        });
      }
      setBalloons(newBalloons);

      setTimeout(() => {
        setBalloons([]);
        onComplete();
      }, duration);
    }
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {balloons.map((balloon) => (
          <motion.div
            key={balloon.id}
            initial={{
              x: balloon.x,
              y: balloon.y,
              rotate: 0,
              scale: 0
            }}
            animate={{
              x: balloon.x + Math.sin(balloon.id) * 100,
              y: -100,
              rotate: [0, 10, -10, 0],
              scale: [0, 1, 1]
            }}
            transition={{
              duration: duration / 1000,
              ease: "easeOut"
            }}
            className="absolute flex flex-col items-center"
          >
            {/* Balloon */}
            <div
              className="rounded-full shadow-lg relative"
              style={{
                width: balloon.size,
                height: balloon.size + 10,
                background: `radial-gradient(circle at 30% 30%, ${balloon.color}, ${balloon.color}dd)`,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }}
            >
              {/* Highlight */}
              <div 
                className="absolute top-2 left-2 w-3 h-3 bg-white opacity-60 rounded-full"
                style={{ width: balloon.size * 0.15, height: balloon.size * 0.15 }}
              />
            </div>
            
            {/* String */}
            <div 
              className="w-px bg-gray-400" 
              style={{ height: balloon.size * 0.8 }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const VisualEffectsManager: React.FC<VisualEffectsManagerProps> = ({
  trigger,
  effectType,
  duration = 3000,
  onComplete
}) => {
  const [currentEffect, setCurrentEffect] = useState<EffectType>('confetti');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      if (effectType) {
        setCurrentEffect(effectType);
      }
      setIsActive(true);
    }
  }, [trigger, effectType]);

  const handleComplete = useCallback(() => {
    setIsActive(false);
    onComplete?.();
  }, [onComplete]);

  const renderEffect = () => {
    switch (currentEffect) {
      case 'confetti':
        return (
          <ConfettiEffect 
            isActive={isActive} 
            duration={duration} 
            onComplete={handleComplete} 
          />
        );
      case 'fireworks':
        return (
          <FireworksEffect 
            isActive={isActive} 
            duration={duration} 
            onComplete={handleComplete} 
          />
        );
      case 'balloons':
        return (
          <BalloonsEffect 
            isActive={isActive} 
            duration={duration} 
            onComplete={handleComplete} 
          />
        );
      default:
        return null;
    }
  };

  return renderEffect();
};

// Hook para alternar entre efeitos
export const useAlternatingEffects = () => {
  const [currentEffectIndex, setCurrentEffectIndex] = useState(0);
  const [trigger, setTrigger] = useState(false);
  
  const effects: EffectType[] = ['confetti', 'fireworks', 'balloons'];

  const celebrate = useCallback(() => {
    setTrigger(true);
    setTimeout(() => {
      setTrigger(false);
      // Alterna para o próximo efeito
      setCurrentEffectIndex(prev => (prev + 1) % effects.length);
    }, 100);
  }, [effects.length]);

  return {
    trigger,
    currentEffect: effects[currentEffectIndex],
    celebrate
  };
};