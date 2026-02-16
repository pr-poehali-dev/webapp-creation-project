import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

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

interface OrganizationsTableProps {
  organizations: Organization[];
  onEdit: (org: Organization) => void;
  onChangeStatus: (orgId: number, status: string) => void;
}

export default function OrganizationsTable({
  organizations,
  onEdit,
  onChangeStatus,
}: OrganizationsTableProps) {
  const navigate = useNavigate();

  const getTierBadge = (tier: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-green-100 text-green-800',
    };
    return colors[tier as keyof typeof colors] || colors.free;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-orange-100 text-orange-800',
      deleted: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Организация</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Тариф</TableHead>
            <TableHead>Период</TableHead>
            <TableHead>Лимиты</TableHead>
            <TableHead>Использование</TableHead>
            <TableHead>Создана</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell className="font-mono text-sm">
                #{org.id}
              </TableCell>
              <TableCell className="font-medium">
                {org.name}
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadge(org.status)}>
                  {org.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getTierBadge(org.subscription_tier)}>
                  {org.subscription_tier}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                <div className={isExpired(org.subscription_end_date) ? 'text-red-600' : ''}>
                  {formatDate(org.subscription_start_date)} —{' '}
                  {formatDate(org.subscription_end_date)}
                  {isExpired(org.subscription_end_date) && (
                    <span className="ml-2 text-xs">⚠️ Истёк</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">
                <div className="space-y-1">
                  <div>👥 {org.users_limit} польз.</div>
                  <div>📊 {org.matrices_limit} матр.</div>
                  <div>👔 {org.clients_limit} клиент.</div>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                <div className="space-y-1">
                  <div className={org.users_count >= org.users_limit ? 'text-red-600 font-semibold' : ''}>
                    {org.users_count} / {org.users_limit}
                  </div>
                  <div className={org.matrices_count >= org.matrices_limit ? 'text-red-600 font-semibold' : ''}>
                    {org.matrices_count} / {org.matrices_limit}
                  </div>
                  <div className={org.clients_count >= org.clients_limit ? 'text-red-600 font-semibold' : ''}>
                    {org.clients_count} / {org.clients_limit}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDate(org.created_at)}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin-organization-team/${org.id}`)}
                    title="Управление командой"
                  >
                    <Icon name="Users" className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(org)}
                    title="Редактировать"
                  >
                    <Icon name="Edit" className="h-4 w-4" />
                  </Button>
                  {org.status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onChangeStatus(org.id, 'suspended')}
                      title="Приостановить"
                    >
                      <Icon name="Pause" className="h-4 w-4" />
                    </Button>
                  ) : org.status === 'suspended' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onChangeStatus(org.id, 'active')}
                      title="Активировать"
                    >
                      <Icon name="Play" className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {org.status !== 'deleted' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onChangeStatus(org.id, 'deleted')}
                      title="Удалить"
                    >
                      <Icon name="Trash2" className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}