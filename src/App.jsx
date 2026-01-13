import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, TrendingUp } from 'lucide-react';

export default function DailyTodoApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [dailyHistory, setDailyHistory] = useState([]);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const tasksResult = await window.storage.get('daily-tasks');
      const historyResult = await window.storage.get('daily-history');
      
      if (tasksResult) {
        const data = JSON.parse(tasksResult.value);
        if (data.date === getCurrentDate()) {
          setTasks(data.tasks);
        }
      }
      
      if (historyResult) {
        setDailyHistory(JSON.parse(historyResult.value));
      }
    } catch (error) {
      console.log('No existing data found');
    }
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await window.storage.set('daily-tasks', JSON.stringify({
        date: getCurrentDate(),
        tasks: updatedTasks
      }));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const saveHistory = async (history) => {
    try {
      await window.storage.set('daily-history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const addTask = () => {
    if (newTask.trim()) {
      const updated = [...tasks, { id: Date.now(), text: newTask, completed: false }];
      setTasks(updated);
      saveTasks(updated);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    const updated = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updated);
    saveTasks(updated);
  };

  const deleteTask = (id) => {
    const updated = tasks.filter(task => task.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  const endDay = async () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const newEntry = {
      date: getCurrentDate(),
      total,
      completed,
      percentage
    };

    const updated = [newEntry, ...dailyHistory].slice(0, 30);
    setDailyHistory(updated);
    await saveHistory(updated);
    
    setTasks([]);
    await saveTasks([]);
    setShowProgress(true);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const todayPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-amber-50 p-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
      <style>{`
        .doodle-border {
          border: 3px solid #2d3748;
          border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.2);
        }
        .doodle-btn {
          border: 2.5px solid #2d3748;
          border-radius: 12px 18px 15px 20px/18px 15px 20px 12px;
          box-shadow: 3px 3px 0px rgba(0,0,0,0.15);
          transform: rotate(-0.5deg);
          transition: all 0.2s;
        }
        .doodle-btn:hover {
          transform: rotate(0deg) translateY(-2px);
          box-shadow: 4px 4px 0px rgba(0,0,0,0.2);
        }
        .doodle-input {
          border: 2.5px solid #2d3748;
          border-radius: 18px 15px 20px 12px/15px 20px 12px 18px;
          transform: rotate(0.3deg);
        }
        .doodle-task {
          border: 2px solid #2d3748;
          border-radius: 20px 15px 18px 12px/12px 18px 15px 20px;
          transform: rotate(-0.2deg);
          transition: all 0.2s;
        }
        .doodle-task:hover {
          transform: rotate(0deg) translateX(2px);
          box-shadow: 2px 2px 0px rgba(0,0,0,0.1);
        }
        .wiggle {
          animation: wiggle 3s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
        .doodle-progress {
          border: 2px solid #2d3748;
          border-radius: 50px;
          background: repeating-linear-gradient(
            45deg,
            #fef3c7,
            #fef3c7 10px,
            #fde68a 10px,
            #fde68a 20px
          );
        }
        .doodle-fill {
          border-radius: 50px;
          background: repeating-linear-gradient(
            -45deg,
            #4ade80,
            #4ade80 8px,
            #22c55e 8px,
            #22c55e 16px
          );
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white doodle-border p-6 mb-6 relative">
          <div className="absolute top-2 right-2 text-4xl wiggle">✨</div>
          
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-gray-800" style={{ transform: 'rotate(-1deg)' }}>
              Daily To-Do! 📝
            </h1>
            <button
              onClick={() => setShowProgress(!showProgress)}
              className="doodle-btn flex items-center gap-2 px-4 py-2 bg-purple-200 hover:bg-purple-300"
            >
              <TrendingUp size={18} />
              Progress
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={18} className="text-gray-700" />
              <span className="text-sm text-gray-700 font-semibold">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="doodle-progress h-6 relative overflow-hidden">
              <div
                className="doodle-fill h-full transition-all duration-500"
                style={{ width: `${todayPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-700 mt-2 font-bold">
              {completedCount} of {totalCount} tasks done! ({todayPercentage}%) 🎯
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add a new task..."
              className="doodle-input flex-1 px-4 py-3 bg-yellow-50 focus:outline-none focus:bg-yellow-100"
            />
            <button
              onClick={addTask}
              className="doodle-btn px-5 py-3 bg-blue-300 hover:bg-blue-400 font-bold flex items-center gap-2"
            >
              <Plus size={20} />
              Add!
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {tasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-lg">
                No tasks yet! ✏️ Add one to get started!
              </p>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  className="doodle-task flex items-center gap-3 p-4 bg-gradient-to-r from-pink-100 to-yellow-100 hover:from-pink-200 hover:to-yellow-200 group"
                >
                  <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="text-green-600" size={28} strokeWidth={3} />
                    ) : (
                      <Circle className="text-gray-500" size={28} strokeWidth={3} />
                    )}
                  </button>
                  <span className={`flex-1 text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-800 font-semibold'}`}>
                    {task.text}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={20} strokeWidth={3} />
                  </button>
                </div>
              ))
            )}
          </div>

          {tasks.length > 0 && (
            <button
              onClick={endDay}
              className="doodle-btn w-full py-4 bg-gradient-to-r from-orange-300 to-pink-300 hover:from-orange-400 hover:to-pink-400 font-bold text-lg"
            >
              🌙 End Day & Save Progress! 🌙
            </button>
          )}
        </div>

        {showProgress && (
          <div className="bg-white doodle-border p-6 relative">
            <div className="absolute top-2 left-2 text-3xl wiggle">📊</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4" style={{ transform: 'rotate(-0.5deg)' }}>
              Progress History! 🏆
            </h2>
            {dailyHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-lg">
                No history yet! Complete your first day! 🎉
              </p>
            ) : (
              <div className="space-y-4">
                {dailyHistory.map((entry, idx) => (
                  <div 
                    key={idx} 
                    className="doodle-task p-5 bg-gradient-to-r from-green-100 to-blue-100"
                    style={{ transform: `rotate(${idx % 2 === 0 ? '-0.3deg' : '0.3deg'})` }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-800 text-lg">
                        {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full border-2 border-gray-800">
                        {entry.completed}/{entry.total} tasks ✓
                      </span>
                    </div>
                    <div className="doodle-progress h-5 relative overflow-hidden">
                      <div
                        className="doodle-fill h-full"
                        style={{ width: `${entry.percentage}%` }}
                      />
                    </div>
                    <p className="text-right font-bold text-gray-700 mt-2 text-lg">{entry.percentage}% 🎯</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}