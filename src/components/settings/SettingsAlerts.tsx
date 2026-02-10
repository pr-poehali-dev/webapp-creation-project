import Icon from '@/components/ui/icon';

interface SettingsAlertsProps {
  error: string;
  success: string;
}

const SettingsAlerts = ({ error, success }: SettingsAlertsProps) => {
  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
          <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
          <Icon name="CheckCircle" size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-500">{success}</p>
        </div>
      )}
    </>
  );
};

export default SettingsAlerts;
