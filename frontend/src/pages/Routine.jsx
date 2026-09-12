import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

// Displayed Monday-first (natural weekly reading order), but each day's
// value is the backend's 0=Sunday..6=Saturday convention (xpEngine.toDayOfWeek)
// so it lines up with dayOfWeek/todayDayOfWeek from the server untouched.
const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

function TaskRow({ task, isToday, onToggle, onEdit, onDelete }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);

  async function saveTitle() {
    setIsEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === task.title) {
      setTitleDraft(task.title);
      return;
    }
    try {
      await onEdit(task.id, { title: trimmed });
    } catch {
      setTitleDraft(task.title);
      toast.error('Could not update that task title.');
    }
  }

  return (
    <li className="flex items-center gap-2 rounded-md border border-dungeon-700 bg-dungeon-900/60 px-2.5 py-2">
      {isToday && (
        <input
          type="checkbox"
          checked={Boolean(task.completedToday)}
          onChange={() => onToggle(task.id)}
          className="h-4 w-4 shrink-0 accent-gold-500"
          aria-label={`Mark "${task.title}" done for today`}
        />
      )}
      {isEditingTitle ? (
        <input
          autoFocus
          className="input-field min-w-0 flex-1 py-1 text-sm"
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              setTitleDraft(task.title);
              setIsEditingTitle(false);
            }
          }}
          maxLength={140}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsEditingTitle(true)}
          className={`min-w-0 flex-1 truncate text-left text-sm text-parchment-100 hover:text-gold-400 ${
            isToday && task.completedToday ? 'line-through decoration-xp-500 text-parchment-300/50' : ''
          }`}
          title="Click to rename"
        >
          {task.title}
        </button>
      )}
      <select
        value={task.dayOfWeek}
        onChange={(e) => onEdit(task.id, { dayOfWeek: Number(e.target.value) }).catch(() => toast.error('Could not move that task.'))}
        className="shrink-0 rounded border border-dungeon-600 bg-dungeon-800 px-1 py-1 text-[10px] text-parchment-300/70"
        aria-label={`Move "${task.title}" to a different day`}
      >
        {DAYS.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label.slice(0, 3)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="shrink-0 rounded-md border border-dungeon-600 px-1.5 py-1 text-xs text-parchment-300/50 transition-colors hover:border-ember-500 hover:text-ember-400"
        aria-label={`Delete "${task.title}"`}
      >
        ✕
      </button>
    </li>
  );
}

/**
 * A recurring weekly schedule, separate from the AI-classified Quest system:
 * assign tasks to a day of the week once, and each week when that day
 * arrives it becomes checkable again (completion is per-occurrence, tracked
 * server-side by calendar date - see backend WeeklyTaskCompletion). Editable
 * any time - title and day can both change.
 */
export default function Routine() {
  const weeklyTasks = useStore((s) => s.weeklyTasks);
  const weeklyTasksStatus = useStore((s) => s.weeklyTasksStatus);
  const todayDayOfWeek = useStore((s) => s.weeklyTasksTodayDayOfWeek);
  const loadWeeklyTasks = useStore((s) => s.loadWeeklyTasks);
  const addWeeklyTask = useStore((s) => s.addWeeklyTask);
  const editWeeklyTask = useStore((s) => s.editWeeklyTask);
  const removeWeeklyTask = useStore((s) => s.removeWeeklyTask);
  const toggleWeeklyTaskToday = useStore((s) => s.toggleWeeklyTaskToday);

  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(todayDayOfWeek ?? 1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadWeeklyTasks();
  }, [loadWeeklyTasks]);

  useEffect(() => {
    if (todayDayOfWeek !== null) setDayOfWeek(todayDayOfWeek);
  }, [todayDayOfWeek]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await addWeeklyTask(title.trim(), dayOfWeek);
      setTitle('');
      toast.success('Added to your weekly routine.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not add that task.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-container space-y-6">
      <h1 className="font-display text-2xl font-bold text-gold-400 sm:text-3xl">Weekly Routine</h1>
      <p className="text-sm text-parchment-300/60">
        Schedule tasks against a day of the week — each week, when that day starts, it becomes
        checkable again. Change the title or day any time.
      </p>

      <form onSubmit={handleSubmit} noValidate className="parchment-card flex flex-wrap gap-2 p-4">
        <input
          className="input-field min-w-[180px] flex-1"
          placeholder="e.g. Gym session"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
        />
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(Number(e.target.value))}
          className="input-field w-auto"
        >
          {DAYS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary px-4" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? 'Adding…' : 'Add to Schedule'}
        </button>
      </form>

      {weeklyTasksStatus === 'loading' && (
        <p className="text-sm text-parchment-300/60">Loading your routine…</p>
      )}
      {weeklyTasksStatus === 'error' && (
        <p className="parchment-card p-6 text-center text-sm text-ember-400">
          Could not load your weekly routine. Refresh to try again.
        </p>
      )}

      {weeklyTasksStatus === 'ready' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {DAYS.map((day) => {
            const isToday = day.value === todayDayOfWeek;
            const tasksForDay = weeklyTasks.filter((t) => t.dayOfWeek === day.value);
            return (
              <div
                key={day.value}
                className={`parchment-card space-y-2 p-3 ${isToday ? 'border-gold-500/70 shadow-glow' : ''}`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-widest ${
                    isToday ? 'text-gold-400' : 'text-parchment-300/60'
                  }`}
                >
                  {day.label} {isToday && '· Today'}
                </p>
                {tasksForDay.length === 0 ? (
                  <p className="text-[11px] text-parchment-300/40">Nothing scheduled.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {tasksForDay.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        isToday={isToday}
                        onToggle={toggleWeeklyTaskToday}
                        onEdit={editWeeklyTask}
                        onDelete={removeWeeklyTask}
                      />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
