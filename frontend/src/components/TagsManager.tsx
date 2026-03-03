'use client';

import { useEffect, useRef, useState } from 'react';
import { useKanbanStore } from '@/lib/store';
import { Tag } from '@/lib/types';
import { api } from '@/lib/api';
import {
  Tag as TagIcon,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────
// Paleta de cores pré-definidas
// ──────────────────────────────────────────────────────────────
const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#6b7280', '#1e293b',
];

// ──────────────────────────────────────────────────────────────
// ColorPicker
// ──────────────────────────────────────────────────────────────
function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-slate-600 shadow-inner hover:scale-105 transition-transform"
        style={{ backgroundColor: value }}
        title="Escolher cor"
      />
      {open && (
        <div className="absolute z-50 bottom-12 left-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 w-56">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Cores rápidas
          </p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => { onChange(color); setOpen(false); }}
                className={`w-9 h-9 rounded-lg shadow-sm transition-transform hover:scale-110 ${value === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                  }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="border-t dark:border-slate-700 pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Personalizado</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={value}
                maxLength={7}
                onChange={(e) => {
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onChange(e.target.value);
                }}
                className="flex-1 px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// TagsManager
// ──────────────────────────────────────────────────────────────
interface TagsManagerProps {
  teamId: string;
  token?: string;
}

export default function TagsManager({ teamId, token }: TagsManagerProps) {
  const { board, fetchBoard } = useKanbanStore();

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form — nova etiqueta
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [creating, setCreating] = useState(false);

  // Edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete com confirmação
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const boardId = board?.id;

  // Conta quantos cards usam cada tag
  const tagUsage = (tagId: string): number => {
    if (!board) return 0;
    let count = 0;
    board.columns.forEach((col) =>
      col.cards.forEach((card) => {
        if (card.tags?.some((t) => t.id === tagId)) count++;
      }),
    );
    return count;
  };

  // Garante que o board esteja carregado
  useEffect(() => {
    if (!token) return;
    if (!board) fetchBoard(teamId, token);
  }, [token, teamId]);

  // Busca as tags assim que temos o boardId
  useEffect(() => {
    if (!boardId || !token) return;
    loadTags();
  }, [boardId, token]);

  const loadTags = async () => {
    if (!boardId || !token) return;
    try {
      setLoading(true);
      setError(null);
      const data: Tag[] = await api.getBoardTags(boardId, token);
      setTags(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      setError('Erro ao carregar etiquetas.');
    } finally {
      setLoading(false);
    }
  };

  // ── CRUD ──────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !boardId || !token) return;
    setCreating(true);
    try {
      const created: Tag = await api.createTag(
        { name: newName.trim(), color: newColor, boardId },
        token,
      );
      setTags((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setNewName('');
      setNewColor('#6366f1');
    } catch {
      setError('Erro ao criar etiqueta.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('');
  };

  const handleSave = async (id: string) => {
    if (!editName.trim() || !token) return;
    setSaving(true);
    try {
      const updated: Tag = await api.updateTag(id, { name: editName.trim(), color: editColor }, token);
      setTags((prev) =>
        prev.map((t) => (t.id === id ? updated : t)).sort((a, b) => a.name.localeCompare(b.name)),
      );
      cancelEdit();
    } catch {
      setError('Erro ao salvar etiqueta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    setDeleting(true);
    try {
      await api.deleteTag(id, token);
      setTags((prev) => prev.filter((t) => t.id !== id));
      setConfirmDeleteId(null);
    } catch {
      setError('Erro ao deletar etiqueta.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────
  if (!boardId || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
        <span className="text-gray-500 dark:text-gray-400">Carregando etiquetas…</span>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto h-svh">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <TagIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Etiquetas</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {tags.length} etiqueta{tags.length !== 1 ? 's' : ''} neste board
          </p>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-0.5 hover:bg-red-100 dark:hover:bg-red-800 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Formulário — nova etiqueta */}
      <form
        onSubmit={handleCreate}
        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 mb-6 shadow-sm"
      >
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Nova etiqueta
        </h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Nome</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Urgente, Bug, Feature…"
              maxLength={30}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="shrink-0">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Cor</label>
            <ColorPicker value={newColor} onChange={setNewColor} />
          </div>
          <button
            type="submit"
            disabled={!newName.trim() || creating}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shrink-0"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Criar
          </button>
        </div>

        {/* Preview */}
        {newName.trim() && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">Pré-visualização:</span>
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
              style={{ backgroundColor: newColor }}
            >
              {newName.trim()}
            </span>
          </div>
        )}
      </form>

      {/* Lista de etiquetas */}
      {tags.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
          <TagIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhuma etiqueta criada</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Use o formulário acima para criar a primeira
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => {
            const usageCount = tagUsage(tag.id);
            const isEditing = editingId === tag.id;
            const isConfirmingDelete = confirmDeleteId === tag.id;

            if (isEditing) {
              return (
                <div
                  key={tag.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-blue-400 dark:border-blue-500 p-4 shadow-sm"
                >
                  <div className="flex gap-3 items-end flex-wrap">
                    <div className="flex-1 min-w-32">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        Nome
                      </label>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={30}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') cancelEdit();
                          if (e.key === 'Enter') handleSave(tag.id);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="shrink-0">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        Cor
                      </label>
                      <ColorPicker value={editColor} onChange={setEditColor} />
                    </div>
                    <button
                      onClick={() => handleSave(tag.id)}
                      disabled={!editName.trim() || saving}
                      className="flex items-center gap-1.5 px-3 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors shrink-0"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Salvar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                  {/* Preview no modo edição */}
                  {editName.trim() && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-400">Pré-visualização:</span>
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                        style={{ backgroundColor: editColor }}
                      >
                        {editName.trim()}
                      </span>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={tag.id}
                className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 shadow-sm flex items-center gap-3 hover:border-gray-300 dark:hover:border-slate-600 transition-all"
              >
                {/* Etiqueta */}
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm shrink-0"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>

                {/* Hex */}
                <code className="text-xs text-gray-400 dark:text-gray-500 font-mono hidden sm:block">
                  {tag.color}
                </code>

                {/* Uso */}
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  {usageCount} card{usageCount !== 1 ? 's' : ''}
                </span>

                {/* Confirmação de exclusão */}
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Confirmar exclusão?
                    </span>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      disabled={deleting}
                      className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      Deletar
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  /* Ações */
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      onClick={() => startEdit(tag)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(tag.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title={
                        usageCount > 0
                          ? `Remover de ${usageCount} card(s) e deletar`
                          : 'Deletar etiqueta'
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
