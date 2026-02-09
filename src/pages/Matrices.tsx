import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

interface Matrix {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  deleted_at: string | null;
  created_by_name: string;
  criteria_count: number;
}

interface DeleteStats {
  matrix_name: string;
  criteria_count: number;
  statuses_count: number;
  clients_count: number;
}

const Matrices = () => {
  const navigate = useNavigate();
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMatrix, setSelectedMatrix] = useState<number | null>(null);
  const [deleteStats, setDeleteStats] = useState<DeleteStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchMatrices(token);
  }, [navigate]);

  const fetchMatrices = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMatrices(data.matrices || []);
      }
    } catch (err) {
      console.error('Error fetching matrices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = async (matrixId: number) => {
    setSelectedMatrix(matrixId);
    setLoadingStats(true);
    setDeleteDialogOpen(true);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'get_delete_stats',
          matrix_id: matrixId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setDeleteStats(data);
      } else {
        toast.error(data.error || 'Ошибка загрузки статистики');
        setDeleteDialogOpen(false);
      }
    } catch (err) {
      toast.error('Ошибка загрузки статистики');
      setDeleteDialogOpen(false);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMatrix) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'delete_permanently',
          matrix_id: selectedMatrix
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Матрица удалена навсегда');
        setDeleteDialogOpen(false);
        setSelectedMatrix(null);
        setDeleteStats(null);
        fetchMatrices(token);
      } else {
        toast.error(data.error || 'Ошибка удаления матрицы');
      }
    } catch (err) {
      toast.error('Ошибка удаления матрицы');
    }
  };

  const getDaysUntilDeletion = (deletedAt: string): number => {
    const deleted = new Date(deletedAt);
    const deleteDate = new Date(deleted.getTime() + 3 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.ceil((deleteDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold">Матрицы приоритизации</h1>
          </div>
          <Button className="gradient-primary" onClick={() => navigate('/matrix/new')}>
            <Icon name="Plus" size={16} className="mr-2" />
            Создать матрицу
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {matrices.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-6">
                <Icon name="Grid3x3" size={48} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Создайте первую матрицу</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Матрица приоритизации поможет объективно оценивать клиентов по критериям влияния и зрелости
              </p>
              <Button className="gradient-primary" onClick={() => navigate('/matrix/new')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Создать матрицу
              </Button>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Активные матрицы</h2>
                {matrices.filter(m => !m.deleted_at).length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-muted-foreground">Нет активных матриц</p>
                  </Card>
                ) : (
                  matrices.filter(m => !m.deleted_at).map(matrix => (
                    <Card
                      key={matrix.id}
                      className="p-6 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => navigate(`/matrix/${matrix.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{matrix.name}</h3>
                            {matrix.is_active ? (
                              <Badge className="bg-accent/10 text-accent border-accent/20">Активна</Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">Неактивна</Badge>
                            )}
                          </div>
                          
                          {matrix.description && (
                            <p className="text-muted-foreground mb-3">{matrix.description}</p>
                          )}
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Icon name="ListChecks" size={16} />
                              <span>{matrix.criteria_count} критериев</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon name="User" size={16} />
                              <span>{matrix.created_by_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon name="Calendar" size={16} />
                              <span>{new Date(matrix.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Icon name="ChevronRight" size={24} className="text-muted-foreground flex-shrink-0 ml-4" />
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {matrices.filter(m => m.deleted_at).length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-muted-foreground">Удаленные матрицы</h2>
                  {matrices.filter(m => m.deleted_at).map(matrix => {
                    const daysLeft = getDaysUntilDeletion(matrix.deleted_at!);
                    return (
                      <Card key={matrix.id} className="p-6 bg-muted/30 border-dashed">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-muted-foreground">{matrix.name}</h3>
                              <Badge variant="outline" className="text-destructive border-destructive/20">
                                Удалится через {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}
                              </Badge>
                            </div>
                            
                            {matrix.description && (
                              <p className="text-muted-foreground mb-3">{matrix.description}</p>
                            )}
                            
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Icon name="ListChecks" size={16} />
                                <span>{matrix.criteria_count} критериев</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Icon name="Trash2" size={16} />
                                <span>Удалена {new Date(matrix.deleted_at!).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteDialog(matrix.id);
                            }}
                          >
                            <Icon name="Trash2" size={16} className="mr-2" />
                            Удалить навсегда
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Удалить матрицу навсегда?</DialogTitle>
            <DialogDescription>
              Это действие необратимо. Все данные будут удалены.
            </DialogDescription>
          </DialogHeader>

          {loadingStats ? (
            <div className="py-8 flex items-center justify-center">
              <Icon name="Loader2" size={32} className="animate-spin text-primary" />
            </div>
          ) : deleteStats ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <Icon name="AlertTriangle" size={20} />
                <AlertTitle>Внимание! Это действие необратимо</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p className="font-semibold">Будет удалено:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>{deleteStats.criteria_count}</strong> критериев оценки</li>
                    <li><strong>{deleteStats.statuses_count}</strong> статусов критериев</li>
                  </ul>
                  
                  {deleteStats.clients_count > 0 && (
                    <div className="mt-3 p-3 bg-background rounded-md border border-destructive/20">
                      <p className="font-semibold flex items-center gap-2 mb-1">
                        <Icon name="Users" size={16} />
                        {deleteStats.clients_count} {deleteStats.clients_count === 1 ? 'клиент будет отвязан' : deleteStats.clients_count < 5 ? 'клиента будут отвязаны' : 'клиентов будут отвязаны'} от матрицы
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Клиенты переместятся в раздел "Клиенты без оценки". 
                        Их контактные данные сохранятся, но оценки по осям X и Y будут сброшены.
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Icon name="Info" size={16} className="inline mr-1" />
                  Данные клиентов (название компании, контакты, описание) будут сохранены.
                </p>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedMatrix(null);
                setDeleteStats(null);
              }}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={loadingStats}
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Удалить навсегда
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Matrices;