import { motion } from 'framer-motion';

interface Question {
  id: number;
  question: string;
  isRapidFireSet?: boolean;
}

interface QuestionGridProps {
  questions: Array<Question>;
  answeredQuestions: number[];
  onQuestionSelect: (id: number) => void;
}

export function QuestionGrid({ questions, answeredQuestions, onQuestionSelect }: QuestionGridProps) {
  const getDisplayText = (question: Question) => {
    if (question.isRapidFireSet) {
      // Extract set number from the question string or id
      return `Set ${question.id}`;
    }
    return question.id.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-4 max-w-6xl mx-auto"
    >
      {questions.map((question) => (
        <motion.button
          key={question.id}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onQuestionSelect(question.id)}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            text-xl font-bold transition-colors duration-200
            ${answeredQuestions.includes(question.id)
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
            }
          `}
        >
          {getDisplayText(question)}
        </motion.button>
      ))}
    </motion.div>
  );
}