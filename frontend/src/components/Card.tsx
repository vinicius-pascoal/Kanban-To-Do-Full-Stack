'use client';

import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import { getCardStatus, formatDate, getDaysUntilDue, getStatusColor, getPriorityColor } from '@/lib/date-utils';
import { Calendar, Clock, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';

interface CardProps {
  card: CardType;
  columnName: string;
  onEdit: (card: CardType) => void;
  onDelete: (id: string) => void;
}

export default function Card({ card, columnName, onEdit, onDelete }: CardProps) {
  const status = getCardStatus(card.dueDate, columnName);
  const daysUntil = getDaysUntilDue(card.dueDate);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`p-4 rounded-lg border-2 bg-white shadow-sm cursor-move transition-all ${getStatusColor(status)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800 flex-1">{card.title}</h3>
        {isHovered && (
          <div className="flex gap-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Deseja realmente deletar este card?')) {
                  onDelete(card.id);
                }
              }}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              title="Deletar"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {card.description && (
        <p className="text-sm text-gray-600 mb-3">{card.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        {/* Priority */}
        <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(card.priority)}`}>
          {card.priority}
        </span>

        {/* Due Date */}
        {card.dueDate && (
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(card.dueDate)}</span>
            {daysUntil !== null && status !== 'completed' && (
              <span className="ml-1 font-medium">
                ({daysUntil > 0 ? `+${daysUntil}d` : daysUntil === 0 ? 'hoje' : `${daysUntil}d`})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Time info */}
      <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-1 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        <span>Criado em {formatDate(card.createdAt)}</span>
      </div>
    </motion.div>
  );
}
