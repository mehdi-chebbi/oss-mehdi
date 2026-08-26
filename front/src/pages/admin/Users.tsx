import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth";
import { listUsers, createUser, updateUser, deleteUser, type User } from "../../api/auth";
import { Pencil, Trash2, X, UserPlus } from "lucide-react";

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });
  const [submitting, setSubmitting] = useState(false);

  const { data: users = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["users"],
    queryFn: () => listUsers(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (queryError) setError((queryError as Error).message);
  }, [queryError]);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "editor" });
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      if (editingUser) {
        const data: Record<string, string> = { name: form.name, email: form.email, role: form.role };
        if (form.password) data.password = form.password;
        await updateUser(token, editingUser.id, data);
      } else {
        if (!form.password) {
          setError("Le mot de passe est obligatoire pour un nouvel utilisateur.");
          setSubmitting(false);
          return;
        }
        await createUser(token, form);
      }
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (u: User) => {
    if (!token) return;
    if (u.id === currentUser?.id) return;
    if (!confirm(`Supprimer ${u.name} ?`)) return;
    setError("");
    try {
      await deleteUser(token, u.id);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-ink">Utilisateurs</h2>
          <p className="text-ink/50 text-sm mt-1">{users.length} au total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#489e42] hover:bg-[#3d8a37] text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter un utilisateur
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-ink/40">Chargement des utilisateurs...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-ink/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-ink/5 text-left text-sm text-ink/60">
                <th className="px-6 py-3 font-medium">Nom</th>
                <th className="px-6 py-3 font-medium">E-mail</th>
                <th className="px-6 py-3 font-medium">Rôle</th>
                <th className="px-6 py-3 font-medium">Création</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-ink/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-ink">{u.name}</td>
                  <td className="px-6 py-4 text-ink/70">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        u.role === "admin"
                          ? "bg-[#489e42]/10 text-[#489e42]"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {u.role === "admin" ? "Administrateur" : "Éditeur"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink/50">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "Indisponible"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-2 text-ink/40 hover:text-[#489e42] hover:bg-[#489e42]/5 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-2 text-ink/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
              <h3 className="text-lg font-semibold text-ink">
                {editingUser ? "Modifier l’utilisateur" : "Nouvel utilisateur"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-ink/40 hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1.5">Nom</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1.5">Adresse e-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1.5">
                  Mot de passe{editingUser ? " (laisser vide pour le conserver)" : ""}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingUser}
                  className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1.5">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#489e42] focus:border-transparent text-ink bg-white"
                >
                  <option value="editor">Éditeur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-ink/15 rounded-lg text-ink/70 font-medium hover:bg-ink/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#489e42] hover:bg-[#3d8a37] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? "Enregistrement..." : editingUser ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
