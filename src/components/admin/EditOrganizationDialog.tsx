import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Organization {
  id: number;
  name: string;
  subscription_tier: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  users_limit: number;
  matrices_limit: number;
  clients_limit: number;
  created_at: string;
  status: string;
  users_count: number;
  matrices_count: number;
  clients_count: number;
}

interface EditOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrg: Organization | null;
  editForm: {
    subscription_tier: string;
    subscription_start_date: string;
    subscription_end_date: string;
    users_limit: number;
    matrices_limit: number;
    clients_limit: number;
  };
  onFormChange: (form: {
    subscription_tier: string;
    subscription_start_date: string;
    subscription_end_date: string;
    users_limit: number;
    matrices_limit: number;
    clients_limit: number;
  }) => void;
  onSave: () => void;
}

export default function EditOrganizationDialog({
  open,
  onOpenChange,
  selectedOrg,
  editForm,
  onFormChange,
  onSave,
}: EditOrganizationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать тариф</DialogTitle>
          <DialogDescription>
            {selectedOrg?.name} (ID: #{selectedOrg?.id})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Тариф</Label>
            <Select
              value={editForm.subscription_tier}
              onValueChange={(value) =>
                onFormChange({ ...editForm, subscription_tier: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Дата начала</Label>
              <Input
                type="date"
                value={editForm.subscription_start_date}
                onChange={(e) =>
                  onFormChange({ ...editForm, subscription_start_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Дата окончания</Label>
              <Input
                type="date"
                value={editForm.subscription_end_date}
                onChange={(e) =>
                  onFormChange({ ...editForm, subscription_end_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Лимит пользователей</Label>
            <Input
              type="number"
              min="1"
              value={editForm.users_limit}
              onChange={(e) =>
                onFormChange({ ...editForm, users_limit: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Лимит матриц</Label>
            <Input
              type="number"
              min="1"
              value={editForm.matrices_limit}
              onChange={(e) =>
                onFormChange({ ...editForm, matrices_limit: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Лимит клиентов</Label>
            <Input
              type="number"
              min="1"
              value={editForm.clients_limit}
              onChange={(e) =>
                onFormChange({ ...editForm, clients_limit: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onSave} className="flex-1">
              Сохранить
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}