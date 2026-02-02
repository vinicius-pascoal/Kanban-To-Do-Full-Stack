'use client';

import { Column as ColumnType, Card as CardType } from '@/lib/types';
import Card from './Card';
import { Plus } from 'lucide-react';

interface ColumnProps {
  column: ColumnType;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (id: string) => void;
}

export default function Column({ column, onAddCard, onEditCard, onDeleteCard }: ColumnProps) {
  const columnColors: Record<string, string> = {
    'A Fazer': 'bg-gray-100 border-gray-300',
    'Em Progresso': 'bg-blue-100 border-blue-300',
    'Concluído': 'bg-green-100 border-green-300',
  };

  const bgColor = columnColors[column.name] || 'bg-gray-100';

  return (
    <div className={`rounded-lg border-2 ${bgColor} p-4 min-w-[320px] flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg text-gray-800">{column.name}</h2>
          <span className="bg-white px-2 py-0.5 rounded-full text-sm font-medium text-gray-600">
            {column.cards.length}
          </span>
        </div>
        <button
          onClick={() => onAddCard(column.id)}
          className="p-1 hover:bg-white/50 rounded transition-colors"
          title="Adicionar card"
        >
          <Plus className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
        {column.cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Nenhum card nesta coluna
          </div>
        ) : (
          column.cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              columnName={column.name}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))
        )}
      </div>
    </div>
  );
}
