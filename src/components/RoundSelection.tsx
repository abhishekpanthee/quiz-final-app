import { motion } from 'framer-motion';
import { Trophy, Brain, Eye, Scale, Zap, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Round } from '../App';

const roundIcons = {
  elimination: Trophy,
  general: Brain,
  visual: Eye,
  wager: Scale,
'rapid-fire': Zap,
  buzzer: Siren,  
};

interface RoundSelectionProps {
  rounds: Round[];
  onSelectRound: (round: Round) => void;
}

export function RoundSelection({ rounds, onSelectRound }: RoundSelectionProps) {
  return (
    <div className="w-full h-full max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl sm:text-7xl lg:text-8xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
      >
        Bits And Bytes
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {rounds.map((round, index) => {
          const Icon = roundIcons[round.id as keyof typeof roundIcons];
          
          return (
            <motion.div
              key={round.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectRound(round)}
              className={cn(
                "relative group cursor-pointer",
                "bg-card/50 backdrop-blur-sm rounded-xl p-8",
                "border border-border/50 hover:border-primary/50",
                "transition-all duration-300 ease-in-out"
              )}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                  <Icon className="w-16 h-16 text-primary" />
                </div>
                
                <h2 className="text-2xl font-semibold text-center mb-4">
                  {round.name}
                </h2>
                
                <p className="text-muted-foreground text-center">
                  Click to start the round
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
