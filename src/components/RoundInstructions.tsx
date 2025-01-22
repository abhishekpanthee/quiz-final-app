import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';
import type { Round } from '../App';

interface RoundInstructionsProps {
  round: Round;
  onStart: () => void;
  onBack: () => void;
}

export function RoundInstructions({ round, onStart, onBack }: RoundInstructionsProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Rounds
        </Button>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border/50">
          <h2 className="text-3xl font-bold mb-6 text-center">
            {round.name}
          </h2>

          <div className="space-y-6 mb-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {round.instructions}
            </p>
          </div>

          <Button
            onClick={onStart}
            size="lg"
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Round
          </Button>
        </div>
      </motion.div>
    </div>
  );
}