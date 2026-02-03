'use client';

import { useEffect, useState } from 'react';
import { useKanbanStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-provider';
import Column from './Column';
import CardModal from './CardModal';
import CardDetailModal from './CardDetailModal';
import { Card as CardType } from '@/lib/types';
import { Plus } from 'lucide-react';

export default function Board({ teamId }: { teamId?: string }) {
  const { board, fetchBoard, deleteCard, moveCard, deleteColumn, clearBoard, reorderColumns } = useKanbanStore();
  const { token, currentTeam } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailCard, setSelectedDetailCard] = useState<CardType | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

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

  const handleAddColumn = async () => {
    if (!newColumnName.trim() || !token) return;
    const { createColumn } = useKanbanStore.getState();
    await createColumn(newColumnName, token);
    setNewColumnName('');
    setIsAddingColumn(false);
  };

  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumnId(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedColumnId || !board || draggedColumnId === targetColumnId || !token) return;

    const columns = board.columns.slice();
    const draggedIndex = columns.findIndex((c) => c.id === draggedColumnId);
    const targetIndex = columns.findIndex((c) => c.id === targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedColumn] = columns.splice(draggedIndex, 1);
    columns.splice(targetIndex, 0, draggedColumn);

    const newColumnIds = columns.map((c) => c.id);
    await reorderColumns(newColumnIds, token);
    setDraggedColumnId(null);
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
      <div className="flex gap-6 overflow-x-auto pb-6">
        {board.columns
          .sort((a, b) => a.order - b.order)
          .map((column) => (
            <Column
              key={column.id}
              column={column}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={(id) => token && deleteCard(id, token)}
              onViewCardDetails={handleViewCardDetails}
              onDeleteColumn={(id) => token && deleteColumn(id, token)}
              onCardDrop={handleCardDrop}
              onColumnDragStart={handleColumnDragStart}
              onColumnDragOver={handleColumnDragOver}
              onColumnDrop={handleColumnDrop}
              isDraggingColumn={draggedColumnId === column.id}
            />
          ))}

        {/* Add Column Button */}
        {isAddingColumn ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4 min-w-[320px] flex flex-col gap-3">
            <h3 className="font-bold text-gray-800">Nova Coluna</h3>
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddColumn}
                className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setIsAddingColumn(false);
                  setNewColumnName('');
                }}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingColumn(true)}
            className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4 min-w-[320px] flex items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50 transition-colors"
          >
            <Plus className="w-6 h-6 text-gray-600" />
            <span className="font-medium text-gray-700">Adicionar Coluna</span>
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
