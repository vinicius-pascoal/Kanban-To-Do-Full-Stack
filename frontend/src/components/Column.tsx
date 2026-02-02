'use client';

import { Column as ColumnType, Card as CardType } from '@/lib/types';
import Card from './Card';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ColumnProps {
  column: ColumnType;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (id: string) => void;
  onDeleteColumn?: (id: string) => void;
  onCardDrop: (cardId: string, targetColumnId: string) => void;
}

export default function Column({
  column,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onDeleteColumn,
  onCardDrop,
}: ColumnProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  const columnColors: Record<string, string> = {
    'A Fazer': 'bg-gray-100 border-gray-300',
    'Em Progresso': 'bg-blue-100 border-blue-300',
    'Concluído': 'bg-green-100 border-green-300',
  };

  const bgColor = columnColors[column.name] || 'bg-gray-100';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(column.id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setDragOverId(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);

    const cardId = e.dataTransfer.getData('cardId');
    if (cardId) {
      onCardDrop(cardId, column.id);
    }
  };

  const handleCardDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cardId', cardId);
    setDraggedCardId(cardId);
  };

  const handleCardDragEnd = () => {
    setDraggedCardId(null);
  };

  return (
    <div
      className={`rounded-lg border-2 ${bgColor} p-4 min-w-[320px] flex flex-col transition-colors ${dragOverId === column.id ? 'bg-opacity-50 ring-2 ring-primary-400' : ''
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <h2 className="font-bold text-lg text-gray-800">{column.name}</h2>
          <span className="bg-white px-2 py-0.5 rounded-full text-sm font-medium text-gray-600">
            {column.cards.length}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onAddCard(column.id)}
            className="p-1 hover:bg-white/50 rounded transition-colors"
            title="Adicionar card"
          >
            <Plus className="w-5 h-5 text-gray-700" />
          </button>
          {onDeleteColumn && column.cards.length === 0 && (
            <button
              onClick={() => {
                if (confirm(`Deseja deletar a coluna "${column.name}"?`)) {
                  onDeleteColumn(column.id);
                }
              }}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              title="Deletar coluna"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
        {column.cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Nenhum card nesta coluna
          </div>
        ) : (
          column.cards.map((card) => (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => handleCardDragStart(e, card.id)}
              onDragEnd={handleCardDragEnd}
            >
              <Card
                card={card}
                columnName={column.name}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
                isDragging={draggedCardId === card.id}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
