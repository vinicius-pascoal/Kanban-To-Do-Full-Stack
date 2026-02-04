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
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0, scale: isDragging ? 0.95 : 1 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.03, y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onViewDetails(card)}
      className={`p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-md cursor-pointer hover:shadow-xl transition-all flex flex-col h-full ${getStatusColor(
        status
      )} ${isDragging ? 'opacity-40 cursor-grabbing' : 'cursor-grab'}`}
      draggable
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 flex-shrink-0">
        <h3 className="font-bold text-base text-gray-900 dark:text-white flex-1 line-clamp-2 leading-tight">{card.title}</h3>
        {isHovered && (
          <div className="flex gap-1.5 ml-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
              }}
              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all hover:scale-110"
              title="Editar"
            >
              <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Deseja realmente deletar este card?')) {
                  onDelete(card.id);
                }
              }}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"
              title="Deletar"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {card.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-shrink-0">{card.description}</p>
      )}

      {/* Assigned User */}
      {card.assignedTo && (
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full flex-shrink-0 w-fit border border-blue-200 dark:border-blue-800">
          <span className="text-sm">👤</span>
          <span className="line-clamp-1">{card.assignedTo.name}</span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs flex-shrink-0 mb-2 gap-2 flex-wrap">
        {/* Priority */}
        <span className={`px-3 py-1.5 rounded-full font-semibold flex-shrink-0 shadow-sm ${getPriorityColor(card.priority)}`}>
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
