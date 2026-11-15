import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  RefreshCw, 
  Key, 
  Radio, 
  CheckCircle2, 
  AlertTriangle 
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
      setError(err.message || 'Failed to fetch registered identities from database.');
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
      setSuccess(`Clearance level updated for user identity.`);
      setTimeout(() => setSuccess(''), 3000);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update clearance level.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (confirm(`Revoke and delete identity for "${email}" from the security perimeter?`)) {
      try {
        setActionLoading(true);
        await api.deleteUser(userId);
        setSuccess(`Identity for ${email} revoked.`);
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
      setSuccess(`New identity successfully provisioned for ${newEmail}!`);
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

  const getClearanceBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400';
      case 'developer':
      case 'operator':
        return 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400';
      case 'auditor':
        return 'bg-amber-500/10 border-amber-500/40 text-amber-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-black tracking-wider text-white glow-text-cyan">
              IDENTITY & ACCESS MANAGEMENT // RBAC VAULT
            </h1>
          </div>
          <p className="text-slate-400 text-[11px] mt-1">
            Dynamic database directory of authenticated identities, clearance tiers, and zero-trust credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            SYNC DB
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            PROVISION IDENTITY
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="cyber-card p-4 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 tracking-wider">TOTAL REGISTERED IDENTITIES</div>
          <div className="text-xl font-bold text-white mt-1">{users.length}</div>
          <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            Persistent in SQLite DB
          </div>
        </div>

        <div className="cyber-card p-4 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 tracking-wider">ROOT ADMINISTRATORS (L5)</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">
            {users.filter(u => u.role === 'super_admin' || u.role === 'admin').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Full HITL write privileges</div>
        </div>

        <div className="cyber-card p-4 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 tracking-wider">AI DEVELOPERS (L3)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {users.filter(u => u.role === 'developer').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Agent registry & sandbox access</div>
        </div>

        <div className="cyber-card p-4 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 tracking-wider">ZERO-TRUST ENFORCEMENT</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">100%</div>
          <div className="text-[10px] text-slate-500 mt-1">Bcrypt (cost 10) + Signed JWT</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded bg-rose-950/60 border border-rose-500/50 text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {success}
        </div>
      )}

      {/* Users Table */}
      <div className="cyber-card cyber-corners rounded-lg overflow-hidden border border-slate-800">
        <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="font-bold text-white tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            REGISTERED OPERATOR DIRECTORY
          </div>
          <span className="text-[10px] text-slate-500">
            SHOWING {users.length} SECURED IDENTITIES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Operator Callsign & Email</th>
                <th className="px-4 py-2.5">Clearance Tier</th>
                <th className="px-4 py-2.5">Dynamic Role Assignment</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        {u.full_name}
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] border border-cyan-500/40">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{u.email}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getClearanceBadge(u.role)}`}>
                        {u.clearance_level}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={actionLoading || isCurrent}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-[11px] text-cyan-300 focus:outline-none focus:border-cyan-500 disabled:opacity-50 cursor-pointer"
                      >
                        <option value="super_admin">Level 5 — Root Security Admin</option>
                        <option value="developer">Level 3 — AI Developer</option>
                        <option value="auditor">Level 2 — Compliance & Auditor</option>
                        <option value="end_user">Level 1 — Business End-User</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ACTIVE
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {!isCurrent && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          disabled={actionLoading}
                          className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 hover:border-rose-500 transition-colors"
                          title="Revoke Identity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal: Provision New Identity */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md cyber-card cyber-corners p-6 rounded-xl border border-cyan-500/40 space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                PROVISION NEW SECURITY IDENTITY
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">OPERATOR CALLSIGN / FULL NAME</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Security Specialist Zero"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-cyan-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">OPERATOR EMAIL</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="specialist@sentinelai.dev"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-cyan-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">INITIAL CIPHER KEY (PASSWORD)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-cyan-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">SECURITY CLEARANCE LEVEL</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="end_user">Level 1 — Business End-User</option>
                  <option value="developer">Level 3 — AI Developer</option>
                  <option value="auditor">Level 2 — Compliance & Auditor</option>
                  <option value="super_admin">Level 5 — Root Security Admin</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  {actionLoading ? 'PROVISIONING...' : 'CONFIRM & COMMIT TO DB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
