'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { api } from '@/lib/api';
import { Calendar, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface CardWithTeam {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: string | null;
  column: {
    name: string;
    board: {
      team: {
        id: string;
        name: string;
      } | null;
    };
  };
}

export default function DashboardHome() {
  const router = useRouter();
  const { user, token, teams, fetchTeams } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [myCards, setMyCards] = useState<CardWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [recentTeams, setRecentTeams] = useState<typeof teams>([]);

  useEffect(() => {
    setMounted(true);
    // Carregar times recentes do localStorage
    const storedRecentTeams = localStorage.getItem('recentTeams');
    if (storedRecentTeams) {
      try {
        setRecentTeams(JSON.parse(storedRecentTeams));
      } catch (error) {
        console.error('Erro ao carregar times recentes:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user || !token) {
      router.push('/login');
      return;
    }
  }, [mounted, user, token, router]);

  useEffect(() => {
    if (token) {
      fetchTeams();
      loadMyCards();
    }
  }, [token]);

  const loadMyCards = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const cards = await api.getMyCards(token);
      setMyCards(cards);
    } catch (error) {
      console.error('Erro ao carregar cards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !user || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Carregando...</h1>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Filtrar cards do dia atual
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCards = myCards.filter((card) => {
    if (!card.dueDate) return false;
    const dueDate = new Date(card.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  // Gerar dias do mês para o calendário
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Mapear cards por dia
  const cardsByDay: Record<number, CardWithTeam[]> = {};
  myCards.forEach((card) => {
    if (!card.dueDate) return;
    const dueDate = new Date(card.dueDate);
    if (dueDate.getMonth() === month && dueDate.getFullYear() === year) {
      const day = dueDate.getDate();
      if (!cardsByDay[day]) cardsByDay[day] = [];
      cardsByDay[day].push(card);
    }
  });

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'média':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'baixa':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Seção de Calendário e Cards do Dia */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Calendário */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Meus Cards - {monthNames[month]} {year}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="px-3 py-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 rounded transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => {
                    setCurrentDate(new Date());
                    setSelectedDay(null);
                  }}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/70 rounded transition-colors"
                >
                  Hoje
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="px-3 py-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 rounded transition-colors"
                >
                  →
                </button>
                {selectedDay && (
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/70 rounded transition-colors ml-2"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = day === selectedDay;
                const dayCards = day ? cardsByDay[day] || [] : [];

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (day) {
                        setSelectedDay(isSelected ? null : day);
                      }
                    }}
                    className={`min-h-[80px] p-2 rounded-lg border transition-all cursor-pointer ${day
                      ? isSelected
                        ? 'bg-blue-200 dark:bg-blue-700 border-blue-500 dark:border-blue-400 ring-2 ring-blue-400 dark:ring-blue-300'
                        : isToday
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900'
                          : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600'
                      : 'bg-transparent border-transparent cursor-default'
                      }`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-semibold mb-1 ${isSelected ? 'text-blue-900 dark:text-white' : isToday ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}>
                          {day}
                        </div>
                        {dayCards.length > 0 && (
                          <div className="space-y-1">
                            {dayCards.slice(0, 2).map((card) => (
                              <div
                                key={card.id}
                                className={`text-xs p-1 rounded border ${getPriorityColor(card.priority)}`}
                                title={card.title}
                              >
                                <div className="truncate">{card.title}</div>
                              </div>
                            ))}
                            {dayCards.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                +{dayCards.length - 2} mais
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards do Dia */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              {selectedDay ? `Cards - ${selectedDay} de ${monthNames[month]}` : 'Cards de Hoje'}
            </h2>
            {selectedDay ? (
              <div className="space-y-3">
                {cardsByDay[selectedDay]?.length > 0 ? (
                  cardsByDay[selectedDay].map((card) => (
                    <div
                      key={card.id}
                      className={`p-3 rounded-lg border-2 ${getPriorityColor(card.priority)}`}
                    >
                      <h3 className="font-semibold mb-1">{card.title}</h3>
                      {card.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{card.description}</p>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{card.column.name}</span>
                          {card.column.board.team && (
                            <>
                              <span>•</span>
                              <span>{card.column.board.team.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum card neste dia</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {todayCards.length > 0 ? (
                  <div className="space-y-3">
                    {todayCards.map((card) => (
                      <div
                        key={card.id}
                        className={`p-3 rounded-lg border-2 ${getPriorityColor(card.priority)}`}
                      >
                        <h3 className="font-semibold mb-1">{card.title}</h3>
                        {card.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{card.description}</p>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{card.column.name}</span>
                            {card.column.board.team && (
                              <>
                                <span>•</span>
                                <span>{card.column.board.team.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum card para hoje</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Meus Times */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Meus Times</h2>
            {teams && teams.length > 3 && (
              <Link href="/teams" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                Ver todos →
              </Link>
            )}
          </div>
          {teams && teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.slice(0, 3).map((team) => (
                <Link
                  key={team.id}
                  href={`/dashboard/${team.id}`}
                  onClick={() => {
                    // Atualizar lista de times recentes
                    const storedRecentTeams = localStorage.getItem('recentTeams');
                    let recentList = storedRecentTeams ? JSON.parse(storedRecentTeams) : [];

                    // Remover o time se já existir
                    recentList = recentList.filter((t: any) => t.id !== team.id);

                    // Adicionar no começo
                    recentList.unshift(team);

                    // Manter apenas os 3 últimos
                    recentList = recentList.slice(0, 3);

                    localStorage.setItem('recentTeams', JSON.stringify(recentList));
                  }}
                  className="p-4 border-2 border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">
                        {team.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {team.members?.length || 0} membros
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Você ainda não faz parte de nenhum time</p>
              <Link
                href="/teams"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar ou Entrar em um Time
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
