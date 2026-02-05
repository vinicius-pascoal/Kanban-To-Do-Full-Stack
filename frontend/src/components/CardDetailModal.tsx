'use client';

import { Card as CardType } from '@/lib/types';
import { X, Calendar, Clock, User, Flag, Edit, Trash2 } from 'lucide-react';
import { formatDate, getDaysUntilDue, getCardStatus } from '@/lib/date-utils';

interface CardDetailModalProps {
  card: CardType | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (card: CardType) => void;
  onDelete: (id: string) => void;
}

export default function CardDetailModal({
  card,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CardDetailModalProps) {
  if (!isOpen || !card) return null;

  const daysUntil = getDaysUntilDue(card.dueDate);
  // Status é determinado apenas pela data, não precisa do nome da coluna
  const status = getCardStatus(card.dueDate, '');

  const priorityColors: Record<string, string> = {
    baixa: 'bg-blue-100 text-blue-800 border border-blue-300',
    média: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    alta: 'bg-red-100 text-red-800 border border-red-300',
  };

  const statusColors: Record<string, string> = {
    overdue: 'bg-red-100 text-red-800 border border-red-300',
    today: 'bg-orange-100 text-orange-800 border border-orange-300',
    ontime: 'bg-green-100 text-green-800 border border-green-300',
    completed: 'bg-gray-100 text-gray-800 border border-gray-300',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border-b border-gray-200 dark:border-slate-700 p-6 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{card.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">ID: {card.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description Section */}
            {card.description && (
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Descrição</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{card.description}</p>
              </div>
            )}

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flag className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <h4 className="font-semibold text-gray-800 dark:text-white">Prioridade</h4>
                </div>
                <span
                  className={`inline-block px-4 py-2 rounded-lg font-medium ${priorityColors[card.priority]
                    }`}
                >
                  {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
                </span>
              </div>

              {/* Assigned To */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <h4 className="font-semibold text-gray-800 dark:text-white">Atribuído a</h4>
                </div>
                {card.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-200 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 dark:text-blue-200 font-bold">
                        {card.assignedTo.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{card.assignedTo.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{card.assignedTo.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">Não atribuído</p>
                )}
              </div>

              {/* Due Date */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <h4 className="font-semibold text-gray-800 dark:text-white">Data de Vencimento</h4>
                </div>
                {card.dueDate ? (
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{formatDate(card.dueDate)}</p>
                    {daysUntil !== null && status !== 'completed' && (
                      <p
                        className={`text-sm font-medium mt-1 ${daysUntil < 0 ? 'text-red-600' : daysUntil === 0 ? 'text-orange-600' : 'text-green-600'
                          }`}
                      >
                        {daysUntil > 0
                          ? `Vence em ${daysUntil} dia${daysUntil === 1 ? '' : 's'}`
                          : daysUntil === 0
                            ? 'Vence hoje!'
                            : `Atrasado ${Math.abs(daysUntil)} dia${Math.abs(daysUntil) === 1 ? '' : 's'}`}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">Sem data definida</p>
                )}
              </div>

              {/* Status */}
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <h4 className="font-semibold text-gray-800 dark:text-white">Status</h4>
                </div>
                <div className="space-y-2">
                  <span
                    className={`inline-block px-4 py-2 rounded-lg font-medium text-sm ${statusColors[status] || 'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}
                  >
                    {status === 'overdue'
                      ? 'Atrasado'
                      : status === 'today'
                        ? 'Vence Hoje'
                        : status === 'ontime'
                          ? 'No Prazo'
                          : 'Concluído'}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Linha do Tempo</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Criado em</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(card.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Última atualização</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(card.updatedAt)}</p>
                  </div>
                </div>

                {card.history && card.history.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-slate-600">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Histórico de Movimentação</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {card.history.map((h, idx) => (
                        <div key={idx} className="text-xs bg-white dark:bg-slate-900 p-2 rounded border border-gray-200 dark:border-slate-700">
                          <p className="text-gray-700 dark:text-gray-200">
                            <span className="font-medium">{h.from}</span>
                            <span className="text-gray-400"> → </span>
                            <span className="font-medium">{h.to}</span>
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{formatDate(h.movedAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Informações Técnicas</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-300">ID do Card</p>
                  <p className="font-mono text-xs text-gray-700 dark:text-gray-200 break-all">{card.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Ordem</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{card.order}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onEdit(card);
                onClose();
              }}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={() => {
                if (confirm('Deseja realmente deletar este card?')) {
                  onDelete(card.id);
                  onClose();
                }
              }}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Deletar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
