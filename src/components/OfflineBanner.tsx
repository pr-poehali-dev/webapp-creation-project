import useNetworkStatus from '@/hooks/useNetworkStatus';
import Icon from '@/components/ui/icon';

const OfflineBanner = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-600 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
      <Icon name="WifiOff" size={16} />
      Нет подключения к интернету
    </div>
  );
};

export default OfflineBanner;
