import { useState, useEffect } from 'react';
import { userAPI } from '@/services/api';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
                active: users.filter(u => u.isActive).length,
                roles: new Set(users.map(u => u.role?.name)).size,
                todayLogins: users.filter(u => {
                    if (!u.lastLoginAt) return false;
                    const today = new Date().toDateString();
                    return new Date(u.lastLoginAt).toDateString() === today;
                }).length,
            });

        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const cardsData = [
        {
            id: 'total',
            icon: 'users',
            iconcolor: 'text-safe-blue-btn',
            label: 'Total Users',
            value: loading ? '...' : String(stats.total),
            trend: loading ? '...' : `${stats.total} registered`,
        },
        {
            id: 'active',
            icon: 'chart-line',
            iconcolor: 'text-safe-green',
            label: 'Active Users',
            value: loading ? '...' : String(stats.active),
            trend: loading
                ? '...'
                : `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% active`,
        },
        {
            id: 'roles',
            icon: 'shield',
            iconcolor: 'text-safe-accent',
            label: 'Roles Assigned',
            value: loading ? '...' : String(stats.roles),
            trend: 'different roles',
        },
        {
            id: 'logins',
            icon: 'chart-simple',
            iconcolor: 'text-safe-blue-btn',
            label: "Today's Logins",
            value: loading ? '...' : String(stats.todayLogins),
            trend: loading ? '...' : 'logins today',
        },
    ];

    return (
        <div className="grid grid-cols-4 gap-7">
            {cardsData.map((item) => (
                <div
                    key={item.id}
                    className="bg-safe-sidebar rounded-xl p-6 border border-safe-border relative overflow-hidden"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="text-sm font-semibold text-safe-text-gray">
                            {item.label}
                        </div>
                        <div className="text-2xl px-2 py-1">
                            <FontAwesomeIcon
                                icon={item.icon}
                                className={item.iconcolor}
                            />
                        </div>
                    </div>

                    <div className="text-3xl font-bold text-safe-dark mb-5">
                        {item.value}
                    </div>

                    <div className="text-xs text-safe-text-gray">
                        {item.trend}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default UserManagementCards;
