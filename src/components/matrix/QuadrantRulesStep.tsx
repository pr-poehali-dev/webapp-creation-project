import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import QuadrantRulesEditor, { QuadrantRule } from './QuadrantRulesEditor';

interface QuadrantRulesStepProps {
  quadrantRules: QuadrantRule[];
  onQuadrantRulesChange: (rules: QuadrantRule[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export const QuadrantRulesStep = ({
  quadrantRules,
  onQuadrantRulesChange,
  onBack,
  onNext
}: QuadrantRulesStepProps) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <QuadrantRulesEditor 
        rules={quadrantRules}
        onChange={onQuadrantRulesChange}
        maxScore={10}
      />

      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад
        </Button>
        <Button 
          onClick={onNext}
          className="gradient-primary"
        >
          Далее
          <Icon name="ArrowRight" size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default QuadrantRulesStep;
