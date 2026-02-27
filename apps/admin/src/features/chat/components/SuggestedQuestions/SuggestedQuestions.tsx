import { Sparkles } from 'lucide-react';
import { SUGGESTED_QUESTIONS } from '../../constants';

type SuggestedQuestionsProps = {
  onSelect: (question: string) => void;
};

const SuggestedQuestions = ({ onSelect }: SuggestedQuestionsProps) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Sparkles size={12} />
      <span>Suggested questions</span>
    </div>
    <div className="flex flex-col gap-1.5">
      {SUGGESTED_QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-secondary"
        >
          {q}
        </button>
      ))}
    </div>
  </div>
);

export default SuggestedQuestions;
