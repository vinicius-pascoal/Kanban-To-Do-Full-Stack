'use client';

import { Column as ColumnType, Card as CardType } from '@/lib/types';
import Card from './Card';
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ColumnProps {
  column: ColumnType;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (id: string) => void;
  onViewCardDetails: (card: CardType) => void;
  onDeleteColumn?: (id: string) => void;
  onCardDrop: (cardId: string, targetColumnId: string) => void;
  onMoveColumn?: (columnId: string, direction: 'left' | 'right') => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  isDraggingColumn?: boolean;
}

export default function Column({
  column,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onViewCardDetails,
  onDeleteColumn,
  onCardDrop,
  onMoveColumn,
  canMoveLeft,
  canMoveRight,
  isDraggingColumn,
}: ColumnProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  const columnColors: Record<string, string> = {
    'A Fazer': 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-900',
    'Em Progresso': 'bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/20',
    'Concluído': 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/20',
  };

  const columnColorValue = column.color?.trim();
  const bgColor = columnColors[column.name] || 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900';
  const columnStyle = columnColorValue ? { backgroundColor: columnColorValue } : undefined;

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
      style={columnStyle}
      className={`rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 ${columnColorValue ? '' : bgColor} p-5 min-w-[340px] max-w-[340px] flex flex-col h-[calc(100vh-220px)] transition-all backdrop-blur-sm ${dragOverId === column.id ? 'ring-2 ring-blue-400 dark:ring-blue-500 shadow-xl' : ''
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0 pb-4 border-b border-gray-200 dark:border-slate-600">
        <div className="flex items-center gap-3 flex-1">
          <h2 className="font-bold text-xl text-gray-800 dark:text-white">{column.name}</h2>
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            {column.cards.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAddCard(column.id)}
            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all hover:scale-110"
            title="Adicionar card"
          >
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </button>
          {onDeleteColumn && column.cards.length === 0 && (
            <button
              onClick={() => {
                if (confirm(`Deseja deletar a coluna "${column.name}"?`)) {
                  onDeleteColumn(column.id);
                }
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
              title="Deletar coluna"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div
        className={`flex-1 overflow-y-auto space-y-3 pr-2 rounded-lg transition-all ${dragOverId === column.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {column.cards.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 mb-3 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p>Arraste cards aqui</p>
          </div>
        ) : (
          column.cards.map((card) => (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => handleCardDragStart(e, card.id)}
              onDragEnd={handleCardDragEnd}
              className="h-auto"
            >
              <Card
                card={card}
                columnName={column.name}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
                onViewDetails={onViewCardDetails}
                isDragging={draggedCardId === card.id}
              />
            </div>
          ))
        )}
      </div>

      {onMoveColumn && (canMoveLeft || canMoveRight) && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-600 flex items-center justify-between">
          <button
            onClick={() => canMoveLeft && onMoveColumn(column.id, 'left')}
            disabled={!canMoveLeft}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all border border-gray-300 dark:border-slate-600 bg-white/90 dark:bg-slate-900/80 text-gray-800 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Mover coluna para a esquerda"
          >
            <ArrowLeft className="w-4 h-4" />
            Esquerda
          </button>
          <button
            onClick={() => canMoveRight && onMoveColumn(column.id, 'right')}
            disabled={!canMoveRight}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all border border-gray-300 dark:border-slate-600 bg-white/90 dark:bg-slate-900/80 text-gray-800 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Mover coluna para a direita"
          >
            Direita
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
