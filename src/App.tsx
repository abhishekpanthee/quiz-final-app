import { useState } from 'react';
import { RoundSelection } from '@/components/RoundSelection';
import { QuizInterface } from '@/components/QuizInterface';
import { RoundInstructions } from '@/components/RoundInstructions';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';

export type Round = {
  id: string;
  name: string;
  instructions: string;
};

const rounds: Round[] = [
  {
    id: 'elimination',
    name: 'Elimination Round',
    instructions: 'Teams will be eliminated based on their performance. Only the top performing teams will proceed to the next round.',
  },
  {
    id: 'general',
    name: 'General Round',
    instructions: 'Questions from various general knowledge categories. Teams get turns with passing options.',
  },
  {
    id: 'visual',
    name: 'Visual Round',
    instructions: 'Questions based on visual elements. Teams need to identify and answer based on images shown.',
  },
  {
    id: 'wager',
    name: 'Wager Round',
    instructions: 'Teams can wager their points before attempting to answer questions.',
  },
  {
    id: 'rapid-fire',
    name: 'Rapid Fire Round',
    instructions: 'Quick succession of questions with shorter time limits. Rapid responses required.',
  },
  {
    id: 'buzzer',
    name: 'Buzzer',
    instructions: 'Quick succession of questions with shorter time limits. Rapid responses required.',
  },
  {
    id: 'riddle',
    name: 'Riddle Round',
    instructions: 'Solve the riddle',
  },
];

function App() {
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const handleRoundSelect = (round: Round) => {
    setSelectedRound(round);
    setShowInstructions(true);
  };

  const handleStartRound = () => {
    setShowInstructions(false);
    setGameStarted(true);
  };

  const handleBackToRounds = () => {
    setSelectedRound(null);
    setShowInstructions(false);
    setGameStarted(false);
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <div 
  className="flex items-center justify-center w-full h-full min-h-screen bg-gradient-to-br from-background to-background/90 text-foreground"
  style={{ width: '100vw' }}
>
        {!selectedRound && (
          <div className="w-full px-4">
            <RoundSelection rounds={rounds} onSelectRound={handleRoundSelect} />
          </div>
        )}

        {selectedRound && showInstructions && (
          <RoundInstructions
            round={selectedRound}
            onStart={handleStartRound}
            onBack={handleBackToRounds}
          />
        )}

        {selectedRound && gameStarted && (
          <QuizInterface
            round={selectedRound}
            onBack={handleBackToRounds}
          />
        )}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}


export default App;