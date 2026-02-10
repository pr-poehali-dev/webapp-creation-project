import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createForm: {
    name: string;
    owner_username: string;
    owner_password: string;
    subscription_tier: string;
    subscription_start_date: string;
    subscription_end_date: string;
    users_limit: number;
    matrices_limit: number;
    clients_limit: number;
  };
  onFormChange: (form: {
    name: string;
    owner_username: string;
    owner_password: string;
    subscription_tier: string;
    subscription_start_date: string;
    subscription_end_date: string;
    users_limit: number;
    matrices_limit: number;
    clients_limit: number;
  }) => void;
  onCreate: () => void;
}

export default function CreateOrganizationDialog({
  open,
  onOpenChange,
  createForm,
  onFormChange,
  onCreate,
}: CreateOrganizationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Создать организацию</DialogTitle>
          <DialogDescription>
            Будет создана организация и owner пользователь
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Название организации</Label>
            <Input
              value={createForm.name}
              onChange={(e) =>
                onFormChange({ ...createForm, name: e.target.value })
              }
              placeholder="Моя компания"
            />
          </div>

          <div className="space-y-2">
            <Label>Логин owner</Label>
            <Input
              value={createForm.owner_username}
              onChange={(e) =>
                onFormChange({ ...createForm, owner_username: e.target.value })
              }
              placeholder="owner_username"
            />
          </div>

          <div className="space-y-2">
            <Label>Пароль (оставьте пустым для автогенерации)</Label>
            <Input
              type="password"
              value={createForm.owner_password}
              onChange={(e) =>
                onFormChange({ ...createForm, owner_password: e.target.value })
              }
              placeholder="Автоматически"
            />
          </div>

          <div className="space-y-2">
            <Label>Тариф</Label>
            <Select
              value={createForm.subscription_tier}
              onValueChange={(value) =>
                onFormChange({ ...createForm, subscription_tier: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
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
                value={createForm.subscription_start_date}
                onChange={(e) =>
                  onFormChange({ ...createForm, subscription_start_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Дата окончания</Label>
              <Input
                type="date"
                value={createForm.subscription_end_date}
                onChange={(e) =>
                  onFormChange({ ...createForm, subscription_end_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Польз.</Label>
              <Input
                type="number"
                min="1"
                value={createForm.users_limit}
                onChange={(e) =>
                  onFormChange({ ...createForm, users_limit: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Матр.</Label>
              <Input
                type="number"
                min="1"
                value={createForm.matrices_limit}
                onChange={(e) =>
                  onFormChange({ ...createForm, matrices_limit: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Клиент.</Label>
              <Input
                type="number"
                min="1"
                value={createForm.clients_limit}
                onChange={(e) =>
                  onFormChange({ ...createForm, clients_limit: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onCreate} className="flex-1">
              Создать
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