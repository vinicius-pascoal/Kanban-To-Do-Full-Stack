'use client';

import { useState, useEffect } from 'react';
import { useKanbanStore } from '@/lib/store';
import { Card, Priority, Tag } from '@/lib/types';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { api } from '@/lib/api';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  editingCard?: Card | null;
  token?: string;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#6366f1', '#a855f7', '#ec4899',
  '#64748b', '#0ea5e9',
];

export default function CardModal({ isOpen, onClose, columnId, editingCard, token }: CardModalProps) {
  const { fetchBoard, fetchMetrics, board, teamId } = useKanbanStore();
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('média');
  const [dueDate, setDueDate] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tag state
  const [boardTags, setBoardTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [showTagPanel, setShowTagPanel] = useState(false);

  useEffect(() => {
    const storedTeam = localStorage.getItem('currentTeam');
    if (storedTeam) {
      try {
        setCurrentTeam(JSON.parse(storedTeam));
      } catch (e) {
        console.error('Error parsing currentTeam:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (editingCard) {
      setTitle(editingCard.title);
      setDescription(editingCard.description || '');
      setPriority(editingCard.priority);
      setDueDate(editingCard.dueDate ? editingCard.dueDate.split('T')[0] : '');
      setAssignedToId(editingCard.assignedToId || '');
      setSelectedTagIds(new Set(editingCard.tags?.map((t) => t.id) ?? []));
    } else {
      setTitle('');
      setDescription('');
      setPriority('média');
      setDueDate('');
      setAssignedToId('');
      setSelectedTagIds(new Set());
    }
    setShowTagPanel(false);
    setNewTagName('');
  }, [editingCard, isOpen]);

  // Carregar tags do board
  useEffect(() => {
    if (isOpen && board?.id && token) {
      api.getBoardTags(board.id, token)
        .then(setBoardTags)
        .catch(console.error);
    }
  }, [isOpen, board?.id, token]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !board?.id || !token) return;
    setIsCreatingTag(true);
    try {
      const tag = await api.createTag({ name: newTagName.trim(), color: newTagColor, boardId: board.id }, token);
      setBoardTags((prev) => [...prev, tag]);
      setSelectedTagIds((prev) => new Set([...prev, tag.id]));
      setNewTagName('');
    } catch (e) {
      console.error('Erro ao criar tag:', e);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);

    try {
      let cardId: string;

      if (editingCard) {
        const updated = await api.updateCard(editingCard.id, {
          title,
          description: description || null,
          priority,
          dueDate: dueDate || null,
          assignedToId: assignedToId || null,
        }, token);
        cardId = updated.id;
      } else {
        const created = await api.createCard({
          title,
          description,
          priority,
          dueDate,
          columnId,
          assignedToId: assignedToId || null,
        }, token);
        cardId = created.id;
      }

      // Atualizar tags
      await api.updateCardTags(cardId, Array.from(selectedTagIds), token);

      // Refresh store
      if (teamId) {
        await fetchBoard(teamId, token);
        await fetchMetrics(teamId, token);
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-transparent dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {editingCard ? 'Editar Card' : 'Novo Card'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
              placeholder="Digite o título do card"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
              placeholder="Digite a descrição (opcional)"
            />
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prioridade *
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
            >
              <option value="baixa">Baixa</option>
              <option value="média">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data de Vencimento
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
            />
          </div>

          {/* Assigned To */}
          {currentTeam && (
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Atribuído a
              </label>
              <select
                id="assignedTo"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
              >
                <option value="">Sem atribuição</option>
                {currentTeam.members?.map((member: any) => (
                  <option key={member.user?.id} value={member.user?.id || ''}>
                    {member.user?.name} ({member.user?.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Etiquetas
              </label>
              <button
                type="button"
                onClick={() => setShowTagPanel((v) => !v)}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                <TagIcon className="w-3 h-3" />
                {showTagPanel ? 'Fechar' : 'Gerenciar'}
              </button>
            </div>

            {/* Selected tags preview */}
            {selectedTagIds.size > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {boardTags
                  .filter((t) => selectedTagIds.has(t.id))
                  .map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white cursor-pointer"
                      style={{ backgroundColor: tag.color }}
                      onClick={() => toggleTag(tag.id)}
                      title="Clique para remover"
                    >
                      {tag.name} ×
                    </span>
                  ))}
              </div>
            )}

            {showTagPanel && (
              <div className="border border-gray-200 dark:border-slate-700 rounded-md p-3 space-y-3 bg-gray-50 dark:bg-slate-800">
                {/* Existing tags */}
                {boardTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {boardTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white transition-all ${selectedTagIds.has(tag.id)
                          ? 'ring-2 ring-offset-1 ring-gray-400 dark:ring-offset-slate-800'
                          : 'opacity-70'
                          }`}
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                        {selectedTagIds.has(tag.id) && ' ✓'}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">Nenhuma etiqueta cadastrada.</p>
                )}

                <hr className="border-gray-200 dark:border-slate-600" />

                {/* Create new tag */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Nova etiqueta</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Nome da etiqueta"
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateTag();
                        }
                      }}
                    />
                    <div className="relative">
                      <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-slate-600 p-0.5"
                        title="Escolher cor"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateTag}
                      disabled={isCreatingTag || !newTagName.trim()}
                      className="px-2 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Criar
                    </button>
                  </div>
                  {/* Color presets */}
                  <div className="flex gap-1 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTagColor(color)}
                        className={`w-5 h-5 rounded-full border-2 transition-transform ${newTagColor === color ? 'border-gray-800 dark:border-white scale-125' : 'border-transparent'
                          }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : editingCard ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
