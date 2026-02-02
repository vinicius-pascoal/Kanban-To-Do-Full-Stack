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
  onViewDetails: (card: CardType) => void;
  isDragging?: boolean;
}

export default function Card({ card, columnName, onEdit, onDelete, onViewDetails, isDragging }: CardProps) {
  const status = getCardStatus(card.dueDate, columnName);
  const daysUntil = getDaysUntilDue(card.dueDate);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onViewDetails(card)}
      className={`p-4 rounded-lg border-2 bg-white shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col h-full ${getStatusColor(
        status
      )} ${isDragging ? 'opacity-50' : ''}`}
      draggable
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2 flex-shrink-0">
        <h3 className="font-semibold text-gray-800 flex-1 line-clamp-2">{card.title}</h3>
        {isHovered && (
          <div className="flex gap-1 ml-2 flex-shrink-0">
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
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-shrink-0">{card.description}</p>
      )}

      {/* Assigned User */}
      {card.assignedTo && (
        <div className="mb-3 inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex-shrink-0 w-fit">
          👤 <span className="line-clamp-1">{card.assignedTo.name}</span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs flex-shrink-0 mb-2 gap-2 flex-wrap">
        {/* Priority */}
        <span className={`px-2 py-1 rounded-full font-medium flex-shrink-0 ${getPriorityColor(card.priority)}`}>
          {card.priority}
        </span>

        {/* Due Date */}
        {card.dueDate && (
          <div className="flex items-center gap-1 text-gray-600 flex-shrink-0">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className="line-clamp-1">{formatDate(card.dueDate)}</span>
            {daysUntil !== null && status !== 'completed' && (
              <span className="ml-1 font-medium flex-shrink-0">
                ({daysUntil > 0 ? `+${daysUntil}d` : daysUntil === 0 ? 'hoje' : `${daysUntil}d`})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Time info */}
      <div className="pt-2 border-t border-gray-200 flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
        <Clock className="w-3 h-3 flex-shrink-0" />
        <span className="line-clamp-1">Criado em {formatDate(card.createdAt)}</span>
      </div>
    </motion.div>
  );
}
