import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Client {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  description: string;
  score_x: number;
  score_y: number;
  quadrant: string;
  matrix_id: number;
  matrix_name: string;
  created_at: string;
  deal_status_id: number | null;
  deal_status_name: string | null;
  deal_status_weight: number | null;
  responsible_user_id: number | null;
  responsible_user_name: string | null;
}

export interface DealStatus {
  id: number;
  name: string;
  weight: number;
  sort_order: number;
}

export interface Matrix {
  id: number;
  name: string;
  axis_x_name: string;
  axis_y_name: string;
}

export const useClientsData = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [selectedMatrix, setSelectedMatrix] = useState<Matrix | null>(null);
  const [dealStatuses, setDealStatuses] = useState<DealStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('');
  const [filterDealStatus, setFilterDealStatus] = useState<string>('');
  const [filterResponsibleUser, setFilterResponsibleUser] = useState<string>('');
  const [hasMatrices, setHasMatrices] = useState(true);
  const [showList, setShowList] = useState(false);
  const [viewMode, setViewMode] = useState<'matrices' | 'unrated' | 'kanban'>('matrices');
  const [unratedClients, setUnratedClients] = useState<Client[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [kanbanClients, setKanbanClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<Array<{ id: number; full_name: string; email: string; role: string }>>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserRole(parsedUser.role || '');
    }

    checkMatrices();
    fetchDealStatuses();
    fetchUnratedClients();
    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    if (selectedMatrix) {
      fetchClients();
    }
  }, [selectedMatrix]);

  useEffect(() => {
    if (selectedQuadrant || filterDealStatus || filterResponsibleUser) {
      filterClients();
    } else {
      setClients(allClients);
    }
  }, [selectedQuadrant, filterDealStatus, filterResponsibleUser, allClients]);

  useEffect(() => {
    if (viewMode === 'unrated') {
      fetchUnratedClients();
    } else if (viewMode === 'kanban') {
      fetchAllClientsForKanban();
    }
  }, [viewMode]);

  const checkMatrices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMatrices(data.matrices || []);
        setHasMatrices(data.matrices && data.matrices.length > 0);
        if (data.matrices && data.matrices.length > 0) {
          const firstMatrix = data.matrices[0];
          setSelectedMatrix(firstMatrix);
        }
      }
    } catch (error) {
      console.error('Ошибка проверки матриц:', error);
    }
  };

  const fetchDealStatuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/7a876a8c-dc4a-439e-aef5-23bde46d9fc2', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setDealStatuses(data.statuses);
      }
    } catch (error) {
      console.error('Ошибка загрузки статусов сделок:', error);
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'list',
          matrix_id: selectedMatrix?.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAllClients(data.clients);
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnratedClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'list_unrated',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUnratedClients(data.clients);
      }
    } catch (error) {
      console.error('Ошибка загрузки клиентов без оценки:', error);
    }
  };

  const filterClients = () => {
    let filtered = [...allClients];

    if (selectedQuadrant) {
      filtered = filtered.filter(c => c.quadrant === selectedQuadrant);
    }

    if (filterDealStatus) {
      filtered = filtered.filter(c => c.deal_status_id === parseInt(filterDealStatus));
    }

    if (filterResponsibleUser) {
      filtered = filtered.filter(c => c.responsible_user_id === parseInt(filterResponsibleUser));
    }

    setClients(filtered);
  };

  const fetchAllClientsForKanban = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'list',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setKanbanClients(data.clients);
      }
    } catch (error) {
      console.error('Ошибка загрузки клиентов для канбана:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/e31e3e4c-0a81-48d5-82da-b14d464e95a8', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  };

  const handleStatusChange = async (clientId: number, newStatusId: number | null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update_status',
          client_id: clientId,
          deal_status_id: newStatusId,
        }),
      });

      if (response.ok) {
        setKanbanClients(prev => 
          prev.map(c => 
            c.id === clientId 
              ? { ...c, deal_status_id: newStatusId } 
              : c
          )
        );
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
    }
  };

  return {
    clients,
    allClients,
    matrices,
    selectedMatrix,
    setSelectedMatrix,
    dealStatuses,
    loading,
    selectedQuadrant,
    setSelectedQuadrant,
    filterDealStatus,
    setFilterDealStatus,
    filterResponsibleUser,
    setFilterResponsibleUser,
    hasMatrices,
    showList,
    setShowList,
    viewMode,
    setViewMode,
    unratedClients,
    userRole,
    kanbanClients,
    handleStatusChange,
    users,
  };
};