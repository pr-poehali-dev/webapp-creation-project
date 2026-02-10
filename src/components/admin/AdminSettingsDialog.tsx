import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdminSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminUsername: string | null;
  settingsForm: {
    new_username: string;
    current_password: string;
    new_password: string;
  };
  onFormChange: (form: {
    new_username: string;
    current_password: string;
    new_password: string;
  }) => void;
  onUpdateUsername: () => void;
  onUpdatePassword: () => void;
}

export default function AdminSettingsDialog({
  open,
  onOpenChange,
  adminUsername,
  settingsForm,
  onFormChange,
  onUpdateUsername,
  onUpdatePassword,
}: AdminSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Настройки администратора</DialogTitle>
          <DialogDescription>
            Изменение логина и пароля
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Изменить логин</h3>
            <div className="space-y-2">
              <Label>Новый логин</Label>
              <Input
                value={settingsForm.new_username}
                onChange={(e) =>
                  onFormChange({ ...settingsForm, new_username: e.target.value })
                }
                placeholder={adminUsername || ''}
              />
            </div>
            <Button onClick={onUpdateUsername} size="sm">
              Сохранить логин
            </Button>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-semibold">Изменить пароль</h3>
            <div className="space-y-2">
              <Label>Текущий пароль</Label>
              <Input
                type="password"
                value={settingsForm.current_password}
                onChange={(e) =>
                  onFormChange({ ...settingsForm, current_password: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Новый пароль</Label>
              <Input
                type="password"
                value={settingsForm.new_password}
                onChange={(e) =>
                  onFormChange({ ...settingsForm, new_password: e.target.value })
                }
              />
            </div>
            <Button onClick={onUpdatePassword} size="sm">
              Сохранить пароль
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
