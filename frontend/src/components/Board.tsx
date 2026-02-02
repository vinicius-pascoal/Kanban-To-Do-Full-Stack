'use client';

import { useEffect, useState } from 'react';
import { useKanbanStore } from '@/lib/store';
import Column from './Column';
import CardModal from './CardModal';
import { Card as CardType } from '@/lib/types';

export default function Board() {
  const { board, fetchBoard, deleteCard } = useKanbanStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

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
              onDeleteCard={deleteCard}
            />
          ))}
      </div>

      {isModalOpen && selectedColumnId && (
        <CardModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          columnId={selectedColumnId}
          editingCard={editingCard}
        />
      )}
    </>
  );
}
