import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface OrgFormData {
  name: string;
  contact_email: string;
  contact_phone: string;
  description: string;
}

interface OrganizationSettingsFormProps {
  orgForm: OrgFormData;
  setOrgForm: (form: OrgFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const OrganizationSettingsForm = ({ orgForm, setOrgForm, onSubmit, loading }: OrganizationSettingsFormProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Icon name="Building2" size={24} />
        Настройки организации
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="org_name" className="block text-sm font-medium mb-2">
            Название организации <span className="text-destructive">*</span>
          </label>
          <input
            id="org_name"
            type="text"
            required
            value={orgForm.name}
            onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="ООО «Технологии»"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium mb-2">
              Контактный Email
            </label>
            <input
              id="contact_email"
              type="email"
              value={orgForm.contact_email}
              onChange={(e) => setOrgForm({ ...orgForm, contact_email: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="contact@company.ru"
            />
          </div>

          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium mb-2">
              Контактный телефон
            </label>
            <input
              id="contact_phone"
              type="tel"
              value={orgForm.contact_phone}
              onChange={(e) => setOrgForm({ ...orgForm, contact_phone: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+7 (999) 123-45-67"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Описание
          </label>
          <textarea
            id="description"
            rows={3}
            value={orgForm.description}
            onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Краткое описание вашей организации..."
          />
        </div>

        <Button
          type="submit"
          className="gradient-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Icon name="Save" size={20} className="mr-2" />
              Сохранить настройки
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default OrganizationSettingsForm;