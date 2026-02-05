import { Card } from '@/components/ui/card';

interface FormData {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  description: string;
  notes: string;
}

interface ClientBasicInfoFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const ClientBasicInfoForm = ({ formData, setFormData }: ClientBasicInfoFormProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium mb-2">
            Название компании <span className="text-destructive">*</span>
          </label>
          <input
            id="company_name"
            type="text"
            required
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact_person" className="block text-sm font-medium mb-2">
              Контактное лицо
            </label>
            <input
              id="contact_person"
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Телефон
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Описание
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            Заметки
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </Card>
  );
};

export default ClientBasicInfoForm;
