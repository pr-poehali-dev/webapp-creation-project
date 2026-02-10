import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QuestionnaireFlow from '@/components/client/wizard/QuestionnaireFlow';

interface CriterionStatus {
  id: number;
  label: string;
  weight: number;
  sort_order: number;
}

interface Criterion {
  id: number;
  name: string;
  description: string;
  axis: string;
  weight: number;
  min_value: number;
  max_value: number;
  statuses: CriterionStatus[];
}

interface Score {
  criterion_id: number;
  score: number;
  comment: string;
}

interface ClientQuestionnaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reassessMode: boolean;
  criteria: Criterion[];
  scores: Score[];
  onComplete: (scores: Score[]) => void;
}

const ClientQuestionnaireDialog = ({
  open,
  onOpenChange,
  reassessMode,
  criteria,
  scores,
  onComplete,
}: ClientQuestionnaireDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reassessMode ? 'Переоценка клиента' : 'Оценка клиента'}
          </DialogTitle>
        </DialogHeader>
        {criteria.length > 0 && (
          <QuestionnaireFlow
            criteria={criteria}
            initialScores={reassessMode ? scores : []}
            onComplete={onComplete}
            onBack={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClientQuestionnaireDialog;
