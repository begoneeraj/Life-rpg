import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import Icon from '../components/ui/icons';
import routineIcon from '../utils/routineIcon';

// Displayed Monday-first (natural weekly reading order), but each day's
// value is the backend's 0=Sunday..6=Saturday convention (xpEngine.toDayOfWeek)
// so it lines up with dayOfWeek/todayDayOfWeek from the server untouched.
const DAYS = [
  { value: 1, label: 'Monday', short: 'MON' },
  { value: 2, label: 'Tuesday', short: 'TUE' },
  { value: 3, label: 'Wednesday', short: 'WED' },
  { value: 4, label: 'Thursday', short: 'THU' },
  { value: 5, label: 'Friday', short: 'FRI' },
  { value: 6, label: 'Saturday', short: 'SAT' },
  { value: 0, label: 'Sunday', short: 'SUN' },
];

function RoutineCard({ task, isToday, highlight, onToggle, onEdit, onDelete }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const done = Boolean(task.completedToday);

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

  const moveTask = (value) =>
    onEdit(task.id, { dayOfWeek: value }).catch(() => toast.error('Could not move that task.'));

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -14 }}
      transition={{ duration: 0.2 }}
      className={`group relative overflow-hidden rounded-md border px-2.5 py-2 transition-colors duration-300 ${
        done
          ? 'border-xp-600/30 bg-xp-500/[0.06]'
          : highlight
            ? 'border-gold-400/80 bg-dungeon-900/80'
            : 'border-dungeon-700 bg-dungeon-900/60'
      }`}
    >
      <div className="flex items-center gap-2">
        {/* completion toggle (today only — completion is per calendar day) */}
        {isToday ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={done}
            aria-label={`Mark "${task.title}" ${done ? 'not ' : ''}done for today`}
            onClick={() => onToggle(task.id)}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-150 ${
              done
                ? 'border-xp-500 bg-xp-500/25 text-xp-300 shadow-glow-xp'
                : 'border-dungeon-500 text-transparent hover:border-gold-400'
            }`}
          >
            <AnimatePresence initial={false}>
              {done && (
                <motion.span
                  key="tick"
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                >
                  <Icon name="check" className="h-3 w-3" aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ) : (
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-dashed border-dungeon-600"
          >
            <Icon name={routineIcon(task.title)} className="h-3 w-3 text-parchment-300/50" />
          </span>
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
            className={`min-w-0 flex-1 truncate text-left text-sm font-medium transition-colors hover:text-gold-400 ${
              done ? 'text-parchment-300/45 line-through decoration-xp-500' : 'text-parchment-100'
            }`}
            title="Click to rename"
          >
            {task.title}
          </button>
        )}

        <select
          value={task.dayOfWeek}
          onChange={(e) => moveTask(Number(e.target.value))}
          className="shrink-0 rounded border border-dungeon-600 bg-dungeon-800 px-1 py-0.5 text-[10px] text-parchment-300/60 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
          aria-label={`Move "${task.title}" to a different day`}
        >
          {DAYS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.short}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="shrink-0 rounded px-1 text-xs text-parchment-300/30 transition-colors hover:text-ember-400"
          aria-label={`Delete "${task.title}"`}
        >
          ✕
        </button>
      </div>
    </motion.li>
  );
}

/**
 * Routine Planner — the player's recurring weekly schedule, separate from the
 * AI-classified Quest system. Tasks group under their day immediately after
 * being added (same store array, keyed by dayOfWeek); each week when that day
 * arrives the task becomes checkable again (completion is per-occurrence,
 * tracked server-side by calendar date — see backend WeeklyTaskCompletion).
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
  const [justAddedDay, setJustAddedDay] = useState(null); // day value → brief gold highlight

  useEffect(() => {
    loadWeeklyTasks();
  }, [loadWeeklyTasks]);

  useEffect(() => {
    if (todayDayOfWeek !== null) setDayOfWeek(todayDayOfWeek);
  }, [todayDayOfWeek]);

  // tasks grouped per day — one source array, grouped for render
  const byDay = useMemo(() => {
    const map = new Map(DAYS.map((d) => [d.value, []]));
    for (const t of weeklyTasks) {
      if (map.has(t.dayOfWeek)) map.get(t.dayOfWeek).push(t);
    }
    return map;
  }, [weeklyTasks]);

  const totalTasks = weeklyTasks.length;
  const todayTasks = todayDayOfWeek !== null ? byDay.get(todayDayOfWeek) || [] : [];
  const todayDone = todayTasks.filter((t) => t.completedToday).length;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addWeeklyTask(title.trim(), dayOfWeek);
      setTitle('');
      setJustAddedDay(dayOfWeek);
      setTimeout(() => setJustAddedDay(null), 900);
      toast.success(`Added to ${DAYS.find((d) => d.value === dayOfWeek)?.label}.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not add that task.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-container space-y-5">
      {/* ---------------- page header ---------------- */}
      <header className="page-header">
        <div>
          <p className="flex items-center gap-2 font-hud text-[10px] uppercase tracking-[0.3em] text-gold-500/80">
            <Icon name="routine" className="h-3 w-3" aria-hidden="true" />
            Routine planner
          </p>
          <h1 className="page-title mt-1">Weekly Routine</h1>
          <p className="page-subtitle">Build habits that become part of your adventure.</p>
        </div>
        {todayTasks.length > 0 && (
          <span
            className="hud-badge hud-badge-sm border-gold-600/40 bg-dungeon-900/70 text-gold-400"
            aria-label={`${todayDone} of ${todayTasks.length} routines done today`}
          >
            <Icon name="check" className="h-3 w-3 text-xp-400" aria-hidden="true" />
            {todayDone}/{todayTasks.length} today
          </span>
        )}
      </header>

      {/* ---------------- add to schedule ---------------- */}
      <form onSubmit={handleSubmit} noValidate className="game-panel hud-frame space-y-3 p-4 sm:p-5">
        <PixelRow />
        <label htmlFor="routine-title" className="label-text">
          Add to Schedule
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="routine-title"
            className="input-field min-w-0 flex-1"
            placeholder="e.g. Gym session"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
          />
          <select
            aria-label="Day of week"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="input-field sm:w-40"
          >
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
                {d.value === todayDayOfWeek ? ' · Today' : ''}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="btn-primary shrink-0 px-5 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? 'Adding…' : '+ Add to Schedule'}
          </button>
        </div>
        <p className="text-[11px] text-parchment-300/50">
          Each task repeats weekly — when its day arrives it becomes checkable again.
        </p>
      </form>

      {weeklyTasksStatus === 'loading' && (
        <p className="text-sm text-parchment-300/60">Loading your routine…</p>
      )}
      {weeklyTasksStatus === 'error' && (
        <div className="game-panel p-8 text-center">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-ember-400">
            Routine unavailable
          </p>
          <p className="mt-1 text-sm text-parchment-300/60">Refresh to try again.</p>
        </div>
      )}

      {weeklyTasksStatus === 'ready' && (
        totalTasks === 0 ? (
          /* intentional empty state — the whole week is unscheduled */
          <div className="game-panel flex flex-col items-center gap-3 p-12 text-center">
            <Icon name="routine" className="h-10 w-10 text-parchment-300/25" aria-hidden="true" />
            <p className="font-display text-base font-bold text-parchment-100">Your week awaits</p>
            <p className="max-w-sm text-sm text-parchment-300/60">
              Schedule your first routine above — it will appear under its day and repeat every week.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {DAYS.map((day) => {
              const isToday = day.value === todayDayOfWeek;
              const tasksForDay = byDay.get(day.value) || [];
              const doneCount = tasksForDay.filter((t) => t.completedToday).length;
              return (
                <section
                  key={day.value}
                  aria-label={`${day.label} schedule`}
                  className={`game-panel flex min-h-[120px] flex-col gap-2 p-3 transition-colors duration-500 ${
                    isToday ? 'border-gold-500/70 bg-gold-500/[0.03]' : ''
                  } ${justAddedDay === day.value ? 'border-gold-400 bg-gold-500/[0.07]' : ''}`}
                >
                  <header className="flex items-baseline justify-between gap-1">
                    <h2
                      className={`font-display text-xs font-bold uppercase tracking-[0.2em] ${
                        isToday ? 'text-gold-300' : 'text-parchment-300/70'
                      }`}
                    >
                      {day.short}
                    </h2>
                    {isToday ? (
                      <span className="rounded-sm border border-gold-500/60 bg-gold-500/10 px-1 py-px font-hud text-[8px] font-bold uppercase tracking-[0.2em] text-gold-400">
                        Today
                      </span>
                    ) : (
                      tasksForDay.length > 0 && (
                        <span className="font-hud text-[9px] text-parchment-300/40">
                          {doneCount}/{tasksForDay.length}
                        </span>
                      )
                    )}
                  </header>

                  {tasksForDay.length === 0 ? (
                    /* compact empty day — no giant blank card */
                    <button
                      type="button"
                      onClick={() => {
                        setDayOfWeek(day.value);
                        document.getElementById('routine-title')?.focus();
                      }}
                      className="mt-1 flex flex-1 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-dungeon-700/70 py-3 text-parchment-300/30 transition-colors hover:border-gold-500/50 hover:text-gold-500/70"
                      aria-label={`Add a routine to ${day.label}`}
                    >
                      <span aria-hidden="true" className="text-[10px] font-semibold uppercase tracking-widest">
                        No routines
                      </span>
                      <span aria-hidden="true" className="text-[10px]">
                        + add
                      </span>
                    </button>
                  ) : (
                    <ul className="space-y-1.5">
                      <AnimatePresence initial={false}>
                        {tasksForDay.map((task) => (
                          <RoutineCard
                            key={task.id}
                            task={task}
                            isToday={isToday}
                            highlight={justAddedDay === day.value}
                            onToggle={toggleWeeklyTaskToday}
                            onEdit={editWeeklyTask}
                            onDelete={removeWeeklyTask}
                          />
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

/* pixel corner brackets on the add-form panel */
function PixelRow() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-gold-500/70"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-gold-500/70"
      />
    </>
  );
}
