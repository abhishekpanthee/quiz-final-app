import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Timer } from "@/components/Timer";
import { QuestionGrid } from "@/components/QuestionGrid";
import { TeamSelector } from "@/components/TeamSelector";
import { ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Round } from "../App";
import { quizData } from "@/data/questions";

interface QuizInterfaceProps {
  round: Round;
  onBack: () => void;
}

const TEAM_IDS = {
  A: "team_a",
  B: "team_b",
  C: "team_c",
  D: "team_d",
  E: "team_e",
} as const;

type TeamID = typeof TEAM_IDS[keyof typeof TEAM_IDS];

interface Team {
  id: TeamID;
  name: string;
}

const TEAMS_ELIMINATION: Team[] = [
  { id: TEAM_IDS.A, name: "Team A" },
  { id: TEAM_IDS.B, name: "Team B" },
  { id: TEAM_IDS.C, name: "Team C" },
  { id: TEAM_IDS.D, name: "Team D" },
  { id: TEAM_IDS.E, name: "Team E" },
];

const TEAMS_GENERAL: Team[] = TEAMS_ELIMINATION.slice(0, 4);

interface BaseQuestion {
  id: number;
  question: string;
  answer: string;
  points: number;
}

interface VisualQuestion extends BaseQuestion {
  imageUrl: string;
}

interface WagerQuestion extends BaseQuestion {
  options: string[];
}

interface RapidFireQuestion extends BaseQuestion {
  timeLimit?: number;
}

interface RapidFireSet {
  setId: number;
  timeLimit: number;
  questions: RapidFireQuestion[];
}

function isVisualQuestion(question: any): question is VisualQuestion {
  return 'imageUrl' in question;
}

function isWagerQuestion(question: any): question is WagerQuestion {
  return 'options' in question;
}

function isRapidFireSet(question: any): question is RapidFireSet {
  return 'questions' in question && Array.isArray(question.questions);
}

export function QuizInterface({ round, onBack }: QuizInterfaceProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentPassIndex, setCurrentPassIndex] = useState(0);
  const [passingOrder, setPassingOrder] = useState<Team[]>([]);
  const [allTeamsAttempted, setAllTeamsAttempted] = useState(false);
  const [currentRapidFireSet, setCurrentRapidFireSet] = useState<number>(0);
  const [currentRapidFireQuestion, setCurrentRapidFireQuestion] = useState<number>(0);
  const [rapidFireSetActive, setRapidFireSetActive] = useState(false);
  const [timerKey, setTimerKey] = useState<number>(0);
  const { toast } = useToast();

  const roundQuestions = (() => {
    switch (round.id) {
      case "elimination":
        return quizData.elimination_round;
      case "general":
        return quizData.general_round;
      case "visual":
        return quizData.visual_round;
      case "rapid-fire":
        isRapidFireSet(quizData.rapid_fire_round);
        return quizData.rapid_fire_round.map((set, index) => ({
          id: index + 1,
          question: `Rapid Fire Set ${set.setId}`,
          answer: "Complete Set to See Answers",
          points: set.questions.reduce((sum, q) => sum + (q.points || 0), 0),
          questions: set.questions,
          timeLimit: 3
        }));
      case "wager":
      case "buzzer":
        return quizData.wager_round;
      default:
        return [];
    }
  })();

  const getTeamsForRound = (): Team[] => {
    return round.id === "elimination" ? TEAMS_ELIMINATION : TEAMS_GENERAL;
  };

  const getCurrentCycle = () => {
    const cycleSize = round.id === "elimination" ? 5 : 4;
    return Math.floor(answeredQuestions.length / cycleSize);
  };

  const shouldReverseOrder = () => {
    return getCurrentCycle() % 2 === 1;
  };

  const getCurrentQuestion = () => {
    if (round.id === "rapid-fire" && rapidFireSetActive) {
      const currentSet = quizData.rapid_fire_round[currentRapidFireSet];
      if (!currentSet?.questions) return null;
      return currentSet.questions[currentRapidFireQuestion];
    }
    return roundQuestions.find(q => q.id === selectedQuestion) || null;
  };

  const handleQuestionSelect = (questionId: number) => {
    if (!answeredQuestions.includes(questionId)) {
      setSelectedQuestion(questionId);
      setSelectedTeam(null);
      setShowAnswer(false);
      setCurrentPassIndex(0);
      setAllTeamsAttempted(false);
      setPassingOrder([]);

      if (round.id === "rapid-fire") {
        const setIndex = questionId - 1; // Adjust for 0-based index
        setCurrentRapidFireSet(setIndex);
        setCurrentRapidFireQuestion(0);
        setRapidFireSetActive(true);
        setTimerKey(prev => prev + 1); // Reset timer key to restart the timer
      }
    }
  };

  const getTimerDuration = () => {
    if (round.id === "visual") {
      switch (currentPassIndex) {
        case 0: return 35;
        case 1: return 17;
        case 2: return 10;
        default: return 5;
      }
    }

    if (round.id === "rapid-fire") {
      return 45;
    }

    switch (currentPassIndex) {
      case 0: return 30;
      case 1: return 15;
      case 2: return 10;
      default: return 5;
    }
  };

  const calculatePassingOrder = (startTeam: Team): Team[] => {
    const teams = getTeamsForRound();
    const startIndex = teams.findIndex(t => t.id === startTeam.id);

    if (startIndex === -1) return teams;

    if (shouldReverseOrder()) {
      return [
        startTeam,
        ...teams.slice(0, startIndex).reverse(),
        ...teams.slice(startIndex + 1).reverse()
      ];
    }

    return [
      startTeam,
      ...teams.slice(startIndex + 1),
      ...teams.slice(0, startIndex)
    ];
  };

  const handlePass = () => {
    if (round.id === "wager" || round.id === "buzzer") {
      setShowAnswer(true);
      setAllTeamsAttempted(true);

      toast({
        title: "Incorrect Answer",
        description: "Question completed",
        duration: 2000,
      });

      setTimeout(() => {
        setAnsweredQuestions(prev => [...prev, selectedQuestion!]);
        resetQuestionState();
      }, 7000);
      return;
    }

    if (round.id === "rapid-fire") {
      const currentSet = quizData.rapid_fire_round[currentRapidFireSet];
      if (currentRapidFireQuestion < currentSet.questions.length - 1) {
        setCurrentRapidFireQuestion(prev => prev + 1);
        setTimeout(() => {
          setShowAnswer(false);
        }, 7000);
      } else {
        setRapidFireSetActive(false);
        setAnsweredQuestions(prev => [...prev, selectedQuestion!]);

        toast({
          title: "Set Complete",
          description: "Rapid fire round set completed",
          duration: 2000,
        });

        setTimeout(() => {
          resetQuestionState();
        }, 7000);
      }
      return;
    }

    if (currentPassIndex < passingOrder.length - 1) {
      setCurrentPassIndex(prev => prev + 1);
      setShowAnswer(false);

      const nextTeam = passingOrder[currentPassIndex + 1];
      toast({
        title: "Question Passed",
        description: `Question passed to ${nextTeam.name}`,
        duration: 2000,
      });
    } else {
      setAllTeamsAttempted(true);
      setShowAnswer(true);

      toast({
        title: "Question Complete",
        description: "All teams have attempted. Question completed.",
        duration: 2000,
      });

      setTimeout(() => {
        setAnsweredQuestions(prev => [...prev, selectedQuestion!]);
        resetQuestionState();
      }, 7000);
    }
  };

  useEffect(() => {
    if (round.id === "rapid-fire" && rapidFireSetActive) {
      const questionTimer = setTimeout(() => {
        handlePass();
      }, 7000);

      return () => clearTimeout(questionTimer);
    }
  }, [currentRapidFireQuestion, rapidFireSetActive, currentRapidFireSet]);

  useEffect(() => {
    if (round.id === "rapid-fire" && rapidFireSetActive) {
      const setTimer = setTimeout(() => {
        setShowAnswer(true);
      }, 45000);

      return () => clearTimeout(setTimer);
    }
  }, [rapidFireSetActive]);

  const handleTeamSelect = (teamName: string) => {
    const teams = getTeamsForRound();
    const selectedTeamObj = teams.find(team => team.name === teamName);

    if (!selectedTeamObj) return;

    setSelectedTeam(selectedTeamObj);
    setCurrentPassIndex(0);
    setAllTeamsAttempted(false);

    if (round.id === "wager" || round.id === "buzzer") {
      setPassingOrder([selectedTeamObj]);
    } else {
      setPassingOrder(calculatePassingOrder(selectedTeamObj));
    }
  };

  const handleCorrectAnswer = () => {
    if (!selectedQuestion) return;

    const question = getCurrentQuestion();
    const points = question?.points || 0;
    const currentTeam = getCurrentTeam();

    setAnsweredQuestions(prev => [...prev, selectedQuestion]);
    setShowAnswer(true);

    toast({
      title: "Correct Answer!",
      description: `${currentTeam?.name} earned ${points} points!`,
      duration: 3000,
    });

    setTimeout(() => {
      resetQuestionState();
    }, 7000);
  };

  const resetQuestionState = () => {
    setSelectedQuestion(null);
    setSelectedTeam(null);
    setShowAnswer(false);
    setCurrentPassIndex(0);
    setPassingOrder([]);
    setAllTeamsAttempted(false);
    if (round.id === "rapid-fire") {
      setRapidFireSetActive(false);
      setCurrentRapidFireQuestion(0);
      setTimerKey(prev => prev + 1); // Reset timer key to restart the timer
    }
  };

  const getCurrentTeam = (): Team | null => {
    return passingOrder[currentPassIndex] || selectedTeam || null;
  };

  const handleOptionSelect = (option: string) => {
    const question = getCurrentQuestion();
    if (option === question?.answer) {
      handleCorrectAnswer();
    } else {
      handlePass();
    }
  };

  const handleNextQuestion = () => {
    if (currentRapidFireQuestion < quizData.rapid_fire_round[currentRapidFireSet].questions.length - 1) {
      setCurrentRapidFireQuestion(prev => prev + 1);
    }
  };

  const renderQuestionContent = () => {
    const question = getCurrentQuestion();
    if (!question) return null;

    return (
      <div className="space-y-6">
        {isVisualQuestion(question) && (
          <div className="w-full h-96 relative bg-muted rounded-lg overflow-hidden">
            <img
              src={question.imageUrl}
              alt="Question Image"
              className="object-contain w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-image.jpg";
                toast({
                  title: "Image Error",
                  description: "Failed to load question image",
                  duration: 3000,
                });
              }}
            />
          </div>
        )}

        {round.id === "rapid-fire" && (
          <div className="mt-4">
            <Timer
              key={`rapid-fire-${timerKey}`}
              duration={45}
              onComplete={() => setShowAnswer(true)}
            />
          </div>
        )}

        <h2 className="text-2xl font-semibold">
          {question.question}
        </h2>

        {(isWagerQuestion(question) || round.id === "buzzer") && !showAnswer && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {isWagerQuestion(question) && question.options.map((option: string, index: number) => (
              <Button
                key={index}
                onClick={() => handleOptionSelect(option)}
                className="w-full py-4"
                variant="outline"
              >
                {option}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRapidFireQuestions = () => {
    const currentSet = quizData.rapid_fire_round[currentRapidFireSet];
    if (!currentSet) return null;

    return (
      <div className="space-y-6">
        {currentSet.questions.slice(0, currentRapidFireQuestion + 1).map((question, index) => (
          <div key={index}>
            <h2 className="text-2xl font-semibold">{question.question}</h2>
          </div>
        ))}
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-muted rounded-lg"
          >
            <h3 className="font-semibold mb-2">Answers:</h3>
            {currentSet.questions.map((question, index) => (
              <p key={index}>{question.answer}</p>
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 w-full">
      <Button variant="ghost" onClick={onBack} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Rounds
      </Button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{round.name}</h1>
        <div className="text-sm">
          Questions Answered: {answeredQuestions.length} / {roundQuestions.length}
          {round.id === "elimination" && (
            <span className="ml-2">
              (Cycle {getCurrentCycle() + 1}: {shouldReverseOrder() ? "Reverse" : "Normal"} Order)
            </span>
          )}
          {round.id === "rapid-fire" && rapidFireSetActive && (
            <span className="ml-2">
              Set {currentRapidFireSet + 1}, Question {currentRapidFireQuestion + 1}/
              {quizData.rapid_fire_round[currentRapidFireSet]?.questions.length || 5}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedQuestion ? (
          <QuestionGrid
            questions={roundQuestions}
            answeredQuestions={answeredQuestions}
            onQuestionSelect={handleQuestionSelect}
          />
        ) : !selectedTeam && round.id !== "rapid-fire" && round.id !== "buzzer" ? (
          <TeamSelector
            teams={getTeamsForRound().map(team => team.name)}
            onTeamSelect={handleTeamSelect}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full mx-auto"
          >
            <div className="grid grid-cols-[1fr,2fr,1fr] gap-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">
                  {getCurrentTeam()?.name}
                </h3>
                {!showAnswer && !allTeamsAttempted && round.id !== "rapid-fire" && (
                  <Timer
                    key={`${currentPassIndex}-${getCurrentTeam()?.id}`}
                    duration={getTimerDuration()}
                    onComplete={handlePass}
                  />
                )}


{round.id === "rapid-fire" && rapidFireSetActive && (
                  <Timer
                    key={`rapid-fire-question-${currentRapidFireQuestion}`}
                    duration={7}
                    onComplete={handlePass}
                  />
                )}
                
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border/50">
                {round.id === "rapid-fire" ? renderRapidFireQuestions() : renderQuestionContent()}
              </div>

              <div className="flex flex-col gap-4">
                {!showAnswer && !allTeamsAttempted && round.id !== "wager" && round.id !== "buzzer" && (
                  <Button
                    onClick={handleCorrectAnswer}
                    className="w-full"
                    variant="default"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Correct
                  </Button>
                )}
                {round.id === "rapid-fire" && rapidFireSetActive && (
                  <Button
                    onClick={handleNextQuestion}
                    className="w-full"
                    variant="default"
                  >
                    Next Question
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}