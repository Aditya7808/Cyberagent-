import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  ShieldCheck,
  UserPlus,
  Trash2,
  RefreshCw,
  Key,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Shield,
  Lock,
  X,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  clearance_level: string;
  is_active: boolean;
  created_at?: string;
}

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New user form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('end_user');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch directory from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRoleValue: string) => {
    try {
      setActionLoading(true);
      await api.updateUserRole(userId, newRoleValue);
      setSuccess(`Security role and clearance level updated successfully.`);
      setTimeout(() => setSuccess(''), 3000);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update clearance level.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (confirm(`Are you sure you want to revoke access and delete identity for "${email}"?`)) {
      try {
        setActionLoading(true);
        await api.deleteUser(userId);
        setSuccess(`User "${email}" has been removed.`);
        setTimeout(() => setSuccess(''), 3000);
        await fetchUsers();
      } catch (err: any) {
        setError(err.message || 'Failed to revoke identity.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await api.register(newEmail, newPassword, newFullName, newRole);
      setSuccess(`New identity provisioned successfully for ${newEmail}`);
      setShowAddModal(false);
      setNewEmail('');
      setNewFullName('');
      setNewPassword('');
      await fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to provision new identity.');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'badge-indigo';
      case 'developer':
      case 'operator':
        return 'badge-emerald';
      case 'auditor':
        return 'badge-amber';
      default:
        return 'badge-cyan';
    }
  };

  const formatRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Root Super Admin';
      case 'admin': return 'Security Administrator';
      case 'developer': return 'AI Engineer / Dev';
      case 'auditor': return 'Compliance Auditor';
      case 'operator': return 'Operations Specialist';
      case 'end_user': return 'Business User';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UsersIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Identity & Access Management (IAM)
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Database-backed Zero-Trust directory. Enforce cryptographic role-based access control and security clearances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-medium text-slate-300 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            Sync Directory
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" />
            Provision User
          </button>
        </div>
      </div>

      {/* AI Identity Governance Banner */}
      <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 p-4 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="absolute inset-0 rounded-lg bg-indigo-500/20 animate-ping opacity-20" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-indigo-400 dark:text-indigo-300">Zero-Trust Identity Governance</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">ENFORCED</span>
          </div>
          <p className="text-xs text-slate-300 dark:text-slate-400 truncate">
            Bcrypt cost-10 hashing with signed HS256 JWT. Least-privilege RBAC with HITL escalation gates on all privileged mutations.
          </p>
        </div>
        <Zap className="w-4 h-4 text-indigo-400/50 flex-shrink-0" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="enterprise-card p-4 rounded-xl">
          <div className="text-xs font-medium text-slate-400">Total Registered Identities</div>
          <div className="text-2xl font-bold text-white mt-1.5">{users.length}</div>
          <div className="text-xs text-indigo-400 mt-1 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Active in SQLite Database
          </div>
        </div>

        <div className="enterprise-card p-4 rounded-xl">
          <div className="text-xs font-medium text-slate-400">Security Administrators</div>
          <div className="text-2xl font-bold text-indigo-300 mt-1.5">
            {users.filter(u => u.role === 'super_admin' || u.role === 'admin').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Full HITL write privileges</div>
        </div>

        <div className="enterprise-card p-4 rounded-xl">
          <div className="text-xs font-medium text-slate-400">AI Engineers & Developers</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5">
            {users.filter(u => u.role === 'developer').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Agent registry & sandbox access</div>
        </div>

        <div className="enterprise-card p-4 rounded-xl">
          <div className="text-xs font-medium text-slate-400">Authentication Guard</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5">Zero-Trust</div>
          <div className="text-xs text-slate-400 mt-1">Bcrypt (cost 10) + Signed JWT</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Directory Table */}
      <div className="enterprise-card rounded-xl overflow-hidden border border-slate-800">
        <div className="px-5 py-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Registered Identity Directory
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {users.length} Active Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/40 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800/60">
              <tr>
                <th className="px-5 py-3.5">User & Email</th>
                <th className="px-5 py-3.5">Security Clearance</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {users.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        {u.full_name}
                        {isCurrent && (
                          <span className="badge-indigo px-2 py-0.5 rounded text-[11px] font-semibold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {u.email}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 ${getRoleBadge(u.role)}`}>
                        <Shield className="w-3 h-3" />
                        {u.clearance_level}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        disabled={actionLoading || isCurrent}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                      >
                        <option value="super_admin">Level 5 — Root Security Admin</option>
                        <option value="developer">Level 3 — AI Developer</option>
                        <option value="auditor">Level 2 — Compliance Auditor</option>
                        <option value="end_user">Level 1 — Business End-User</option>
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {!isCurrent && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          disabled={actionLoading}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-colors"
                          title="Revoke Identity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Provision New User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md enterprise-card p-6 rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="font-bold text-white text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                Provision New Team Identity
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name / Callsign
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="maya@company.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Temporary Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Initial Clearance & Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="end_user">Level 1 — Business End-User</option>
                  <option value="developer">Level 3 — AI Developer</option>
                  <option value="auditor">Level 2 — Compliance Auditor</option>
                  <option value="super_admin">Level 5 — Root Security Admin</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  {actionLoading ? 'Provisioning...' : 'Confirm & Provision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};