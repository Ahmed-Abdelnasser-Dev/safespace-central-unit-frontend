import { useState, useEffect } from 'react';
import { userAPI } from '@/services/api';
import StatCard from '@/components/ui/StatCard';

/**
 * UserManagementCards — four KPI tiles shown above both admin tabs.
 * Uses the shared StatCard component so the visual vocabulary is identical
 * across Admin, Dashboard, and Road Observer.
 */
function UserManagementCards() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    roles: 0,
    todayLogins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await userAPI.listUsers({ page: 1, limit: 1000 });
      const users = data.users || [];
      setStats({
        total: data.total || users.length,
        active: users.filter((u) => u.isActive).length,
        roles: new Set(users.map((u) => u.role?.name)).size,
        todayLogins: users.filter((u) => {
          if (!u.lastLoginAt) return false;
          return new Date(u.lastLoginAt).toDateString() === new Date().toDateString();
        }).length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      id: 'total',
      icon: 'users',
      iconColor: 'text-safe-blue-btn',
      label: 'Total Users',
      value: loading ? '...' : String(stats.total),
      trend: loading ? null : `${stats.total} registered`,
    },
    {
      id: 'active',
      icon: 'chart-line',
      iconColor: 'text-safe-green',
      label: 'Active Users',
      value: loading ? '...' : String(stats.active),
      trend: loading
        ? null
        : `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% active`,
    },
    {
      id: 'roles',
      icon: 'shield',
      iconColor: 'text-safe-accent',
      label: 'Roles Assigned',
      value: loading ? '...' : String(stats.roles),
      trend: 'different roles',
    },
    {
      id: 'logins',
      icon: 'chart-simple',
      iconColor: 'text-safe-blue-btn',
      label: "Today's Logins",
      value: loading ? '...' : String(stats.todayLogins),
      trend: loading ? null : 'logins today',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-7">
      {cards.map((card) => (
        <StatCard
          key={card.id}
          label={card.label}
          value={card.value}
          trend={card.trend}
          icon={card.icon}
          iconColor={card.iconColor}
        />
      ))}
    </div>
  );
}

export default UserManagementCards;
