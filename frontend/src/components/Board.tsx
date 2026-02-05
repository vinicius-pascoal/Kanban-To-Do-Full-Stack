'use client';

import { useEffect, useState } from 'react';
import { useKanbanStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-provider';
import Column from './Column';
import CardModal from './CardModal';
import CardDetailModal from './CardDetailModal';
import { Card as CardType, ColumnInsertPosition } from '@/lib/types';
import { Plus } from 'lucide-react';

export default function Board({ teamId }: { teamId?: string }) {
  const { board, fetchBoard, deleteCard, moveCard, deleteColumn, clearBoard } = useKanbanStore();
  const { token, currentTeam } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnPosition, setNewColumnPosition] = useState<ColumnInsertPosition>('end');
  const [newColumnAnchorId, setNewColumnAnchorId] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#F8FAFC');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailCard, setSelectedDetailCard] = useState<CardType | null>(null);

  useEffect(() => {
    console.log('🔄 Board useEffect triggered - teamId:', teamId);
    if (token && teamId) {
      // Limpar board anterior antes de carregar novo
      clearBoard();
      fetchBoard(teamId, token);
    }

    return () => {
      console.log('🧹 Board component unmounting');
    };
  }, [token, teamId]);

  const handleAddCard = (columnId: string) => {
    setSelectedColumnId(columnId);
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleEditCard = (card: CardType) => {
    setSelectedColumnId(card.columnId);
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedColumnId(null);
    setEditingCard(null);
  };

  const handleViewCardDetails = (card: CardType) => {
    setSelectedDetailCard(card);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDetailCard(null);
  };

  const handleCardDrop = async (cardId: string, targetColumnId: string) => {
    if (!board || !token) return;
    await moveCard({
      cardId,
      targetColumnId,
    }, token);
  };

  const isColumnAnchorRequired = newColumnPosition === 'before' || newColumnPosition === 'after';
  const isAddColumnDisabled = !newColumnName.trim() || (isColumnAnchorRequired && !newColumnAnchorId) || !token;

  const handleAddColumn = async () => {
    if (isAddColumnDisabled) return;
    const { createColumn } = useKanbanStore.getState();
    await createColumn(newColumnName, token, {
      position: newColumnPosition,
      anchorColumnId: newColumnAnchorId || null,
      color: newColumnColor || null,
    });
    setNewColumnName('');
    setNewColumnPosition('end');
    setNewColumnAnchorId('');
    setNewColumnColor('#F8FAFC');
    setIsAddingColumn(false);
  };

  const handleMoveColumn = async (columnId: string, direction: 'left' | 'right') => {
    if (!board || !token) return;

    const orderedColumns = [...board.columns].sort((a, b) => a.order - b.order);
    const currentIndex = orderedColumns.findIndex((column) => column.id === columnId);

    if (currentIndex === -1) return;

    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedColumns.length) return;

    const columnIds = orderedColumns.map((column) => column.id);
    [columnIds[currentIndex], columnIds[targetIndex]] = [columnIds[targetIndex], columnIds[currentIndex]];

    await useKanbanStore.getState().reorderColumns(columnIds, token);
  };

  if (!board) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando board...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-8 px-2">
        {board.columns
          .sort((a, b) => a.order - b.order)
          .map((column, index, columns) => (
            <Column
              key={column.id}
              column={column}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={(id) => token && deleteCard(id, token)}
              onViewCardDetails={handleViewCardDetails}
              onDeleteColumn={(id) => token && deleteColumn(id, token)}
              onCardDrop={handleCardDrop}
              onMoveColumn={handleMoveColumn}
              canMoveLeft={index > 0}
              canMoveRight={index < columns.length - 1}
            />
          ))}

        {/* Add Column Button */}
        {isAddingColumn ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 min-w-[340px] max-w-[340px] flex flex-col gap-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Nova Coluna</h3>
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddColumn();
                if (e.key === 'Escape') {
                  setIsAddingColumn(false);
                  setNewColumnName('');
                }
              }}
              placeholder="Nome da coluna"
              autoFocus
              className="px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Posição</label>
              <select
                value={newColumnPosition}
                onChange={(e) => setNewColumnPosition(e.target.value as ColumnInsertPosition)}
                className="px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="end">No final</option>
                <option value="start">No início</option>
                <option value="before">Antes de...</option>
                <option value="after">Depois de...</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cor</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newColumnColor}
                  onChange={(e) => setNewColumnColor(e.target.value)}
                  className="h-12 w-12 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-1"
                  aria-label="Selecionar cor da coluna"
                />
                <input
                  type="text"
                  value={newColumnColor}
                  onChange={(e) => setNewColumnColor(e.target.value)}
                  placeholder="#F8FAFC"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {(newColumnPosition === 'before' || newColumnPosition === 'after') && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Referência</label>
                <select
                  value={newColumnAnchorId}
                  onChange={(e) => setNewColumnAnchorId(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma coluna</option>
                  {board.columns
                    .sort((a, b) => a.order - b.order)
                    .map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleAddColumn}
                disabled={isAddColumnDisabled}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setIsAddingColumn(false);
                  setNewColumnName('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingColumn(true)}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg border-2 border-dashed border-gray-300 dark:border-slate-600 p-6 min-w-[340px] max-w-[340px] flex flex-col items-center justify-center gap-3 hover:border-blue-400 dark:hover:border-blue-500 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-900/10 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">
              Adicionar Coluna
            </span>
          </button>
        )}
      </div>

      {isModalOpen && selectedColumnId && (
        <CardModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          columnId={selectedColumnId}
          editingCard={editingCard}
        />
      )}

      {isDetailModalOpen && selectedDetailCard && (
        <CardDetailModal
          card={selectedDetailCard}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onEdit={handleEditCard}
          onDelete={(id) => token && deleteCard(id, token)}
        />
      )}
    </>
  );
}
