import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface TeamSelectorProps {
  teams: string[];
  onTeamSelect: (team: string) => void;
}

export function TeamSelector({ teams, onTeamSelect }: TeamSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <h2 className="text-3xl font-bold text-center mb-8">Select Team</h2>
      
      <div className="grid grid-cols-2 gap-6">
        {teams.map((team, index) => (
          <motion.button
            key={team}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTeamSelect(team)}
            className="
              bg-card/50 backdrop-blur-sm rounded-xl p-8
              border border-border/50 hover:border-primary/50
              transition-all duration-300 ease-in-out
              flex flex-col items-center gap-4
            "
          >
            <Users className="w-12 h-12 text-primary" />
            <span className="text-xl font-semibold">{team}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}