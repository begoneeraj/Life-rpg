import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import Icon from '../components/ui/icons';
import { Skeleton } from '../components/Skeleton';

const MAX_TASKS_PER_ROUND = 5;

/** Splits a textarea's lines into up to MAX_TASKS_PER_ROUND non-empty task strings. */
function parseRoundTasks(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_TASKS_PER_ROUND);
}

function ChallengeModal({ opponentUsername, onClose }) {
  const challengeFriend = useStore((s) => s.challengeFriend);
  const navigate = useNavigate();
  const [roundDrafts, setRoundDrafts] = useState(['', '', '']);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const rounds = roundDrafts.map(parseRoundTasks);
    if (rounds.some((r) => r.length === 0)) {
      toast.error('Every round needs at least one task.');
      return;
    }
    if (!Number.isInteger(timeLimitMinutes) || timeLimitMinutes < 1) {
      toast.error('Time limit must be at least 1 minute.');
      return;
    }
    setIsSubmitting(true);
    try {
      const battle = await challengeFriend(opponentUsername, rounds, timeLimitMinutes);
      onClose();
      navigate(`/battle/${battle.id}`);
    } catch {
      // store already toasted the error
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-heading"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-dungeon-950/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="game-panel game-panel-gold hud-frame relative max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Icon name="battle" className="h-4 w-4 text-ember-400" />
          <h2 id="challenge-heading" className="font-display text-lg font-bold text-parchment-100">
            Challenge {opponentUsername}
          </h2>
        </div>
        <p className="mt-1 text-sm text-parchment-300/60">
          Best of 3 rounds. Whoever finishes more tasks in a round wins it; most rounds won takes the
          battle.
        </p>

        <div className="mt-4 space-y-3">
          {roundDrafts.map((draft, i) => (
            <div key={i}>
              <label htmlFor={`round-${i}`} className="label-text">
                Round {i + 1} tasks (one per line, up to {MAX_TASKS_PER_ROUND})
              </label>
              <textarea
                id={`round-${i}`}
                className="input-field min-h-[70px] w-full resize-y"
                placeholder={`e.g. Finish reading ch. ${i + 1}`}
                value={draft}
                onChange={(e) =>
                  setRoundDrafts((prev) => prev.map((d, idx) => (idx === i ? e.target.value : d)))
                }
              />
            </div>
          ))}

          <div>
            <label htmlFor="time-limit" className="label-text">
              Time limit (minutes)
            </label>
            <input
              id="time-limit"
              type="number"
              min={1}
              max={1440}
              className="input-field w-32"
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-game px-4 py-2 text-xs">
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary px-5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending…' : 'Send Challenge'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export default function Friends() {
  const navigate = useNavigate();

  const friends = useStore((s) => s.friends);
  const friendsStatus = useStore((s) => s.friendsStatus);
  const loadFriends = useStore((s) => s.loadFriends);

  const incomingFriendRequests = useStore((s) => s.incomingFriendRequests);
  const loadIncomingFriendRequests = useStore((s) => s.loadIncomingFriendRequests);
  const respondFriendRequest = useStore((s) => s.respondFriendRequest);
  const sendFriendRequest = useStore((s) => s.sendFriendRequest);

  const leaderboard = useStore((s) => s.leaderboard);
  const leaderboardStatus = useStore((s) => s.leaderboardStatus);
  const loadLeaderboard = useStore((s) => s.loadLeaderboard);

  const incomingBattles = useStore((s) => s.incomingBattles);
  const loadIncomingBattles = useStore((s) => s.loadIncomingBattles);
  const respondBattle = useStore((s) => s.respondBattle);

  const myBattles = useStore((s) => s.myBattles);
  const loadMyBattles = useStore((s) => s.loadMyBattles);

  const [usernameDraft, setUsernameDraft] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState(null); // username | null

  useEffect(() => {
    loadFriends();
    loadIncomingFriendRequests();
    loadLeaderboard();
    loadIncomingBattles();
    loadMyBattles();
  }, [loadFriends, loadIncomingFriendRequests, loadLeaderboard, loadIncomingBattles, loadMyBattles]);

  async function handleAddFriend(e) {
    e.preventDefault();
    const username = usernameDraft.trim();
    if (!username || isSendingRequest) return;
    setIsSendingRequest(true);
    try {
      await sendFriendRequest(username);
      setUsernameDraft('');
    } catch {
      // store already toasted
    } finally {
      setIsSendingRequest(false);
    }
  }

  async function handleAcceptBattle(battleId) {
    try {
      await respondBattle(battleId, 'accept');
      navigate(`/battle/${battleId}`);
    } catch {
      // toasted
    }
  }

  return (
    <div className="page-container space-y-6">
      {challengeTarget && (
        <ChallengeModal opponentUsername={challengeTarget} onClose={() => setChallengeTarget(null)} />
      )}

      <header className="page-header">
        <div>
          <p className="flex items-center gap-2 font-hud text-[10px] uppercase tracking-[0.3em] text-gold-500/80">
            <Icon name="friends" className="h-3 w-3" aria-hidden="true" />
            Guild Roster
          </p>
          <h1 className="page-title mt-1">Friends</h1>
          <p className="page-subtitle">Add friends, challenge them to a battle, and climb the board.</p>
        </div>
      </header>

      {/* ---------------- add friend ---------------- */}
      <form onSubmit={handleAddFriend} className="game-panel hud-frame flex flex-col gap-2 p-4 sm:flex-row sm:p-5">
        <input
          className="input-field min-w-0 flex-1"
          placeholder="Friend's username"
          value={usernameDraft}
          onChange={(e) => setUsernameDraft(e.target.value)}
          maxLength={20}
        />
        <button
          type="submit"
          className="btn-primary shrink-0 px-5 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isSendingRequest || !usernameDraft.trim()}
        >
          {isSendingRequest ? 'Sending…' : '+ Add Friend'}
        </button>
      </form>

      {/* ---------------- incoming battle challenges ---------------- */}
      {incomingBattles.length > 0 && (
        <section className="game-panel game-panel-gold p-4 sm:p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-gold-400">
            <Icon name="battle" className="h-4 w-4" /> Battle Challenges
          </h2>
          <ul className="space-y-2">
            {incomingBattles.map((b) => (
              <li
                key={b.battle_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dungeon-700/70 bg-dungeon-900/60 px-3 py-2.5"
              >
                <p className="text-sm text-parchment-100">
                  <span className="font-semibold text-gold-400">{b.from_username}</span> challenged you
                  · {b.task_count} tasks · {b.time_limit_minutes} min
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAcceptBattle(b.battle_id)}
                    className="btn-game px-3 py-1.5 text-[10px]"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => respondBattle(b.battle_id, 'decline')}
                    className="rounded-md border border-dungeon-600 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-parchment-300/60 transition-colors hover:border-ember-500 hover:text-ember-400"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------------- incoming friend requests ---------------- */}
      {incomingFriendRequests.length > 0 && (
        <section className="game-panel p-4 sm:p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
            <Icon name="friends" className="h-4 w-4 text-mystic-400/80" /> Friend Requests
          </h2>
          <ul className="space-y-2">
            {incomingFriendRequests.map((r) => (
              <li
                key={r.request_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dungeon-700/70 bg-dungeon-900/60 px-3 py-2.5"
              >
                <p className="text-sm text-parchment-100">
                  <span className="font-semibold">{r.from_username}</span> wants to be friends
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => respondFriendRequest(r.request_id, 'accept')}
                    className="btn-game px-3 py-1.5 text-[10px]"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => respondFriendRequest(r.request_id, 'reject')}
                    className="rounded-md border border-dungeon-600 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-parchment-300/60 transition-colors hover:border-ember-500 hover:text-ember-400"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------------- your active/pending battles ---------------- */}
      {myBattles.length > 0 && (
        <section className="game-panel p-4 sm:p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
            <Icon name="timer" className="h-4 w-4 text-xp-400" /> Your Battles
          </h2>
          <ul className="space-y-2">
            {myBattles.map((b) => (
              <li key={b.battle_id}>
                <button
                  type="button"
                  onClick={() => navigate(`/battle/${b.battle_id}`)}
                  className="flex w-full items-center justify-between gap-2 rounded-md border border-dungeon-700/70 bg-dungeon-900/60 px-3 py-2.5 text-left transition-colors hover:border-gold-500/50"
                >
                  <span className="text-sm text-parchment-100">
                    vs <span className="font-semibold text-gold-400">{b.opponent_username}</span>
                  </span>
                  <span className="tag-pill font-semibold uppercase tracking-widest text-parchment-300/60">
                    {b.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------------- friends list + leaderboard ---------------- */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="min-w-0 space-y-3">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
            <Icon name="friends" className="h-4 w-4 text-gold-500/80" /> Your Friends
          </h2>

          {friendsStatus === 'loading' && (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}

          {friendsStatus === 'ready' && friends.length === 0 && (
            <div className="game-panel flex flex-col items-center gap-3 p-10 text-center">
              <Icon name="friends" className="h-9 w-9 text-parchment-300/25" />
              <p className="font-display text-base font-bold text-parchment-100">No friends yet</p>
              <p className="text-sm text-parchment-300/60">
                Add someone by username above to start building your guild.
              </p>
            </div>
          )}

          {friendsStatus === 'ready' && friends.length > 0 && (
            <ul className="space-y-2">
              {friends.map((f) => (
                <li
                  key={f.username}
                  className="game-panel flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-parchment-100">
                      {f.username}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-parchment-300/50">
                      <span className="tag-pill font-semibold text-gold-400">LV {f.level}</span>
                      <span>{f.xp} XP</span>
                      <span>{f.total_quests_done} quests done</span>
                      <span>{f.win_count} battle wins</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChallengeTarget(f.username)}
                    className="btn-game shrink-0 px-3 py-1.5 text-[10px]"
                  >
                    <Icon name="battle" className="h-3 w-3" /> Challenge
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="min-w-0">
          <div className="game-panel h-fit p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
              <Icon name="crown" className="h-4 w-4 text-gold-500/80" /> Leaderboard
            </h2>

            {leaderboardStatus === 'loading' && (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}

            {leaderboardStatus === 'ready' && (
              <ol className="space-y-1.5">
                {leaderboard.map((row) => (
                  <li
                    key={row.username}
                    className={`flex items-center gap-3 rounded-md border px-3 py-2 ${
                      row.is_you
                        ? 'border-gold-500/60 bg-gold-500/[0.06]'
                        : 'border-dungeon-700/70 bg-dungeon-900/60'
                    }`}
                  >
                    <span
                      className={`font-hud text-xs font-bold ${
                        row.rank === 1 ? 'text-gold-400' : 'text-parchment-300/50'
                      }`}
                    >
                      #{row.rank}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-parchment-100">
                      {row.username}
                      {row.is_you ? ' (you)' : ''}
                    </span>
                    <span className="shrink-0 font-hud text-[10px] text-parchment-300/50">
                      LV {row.level}
                    </span>
                    <span className="shrink-0 font-hud text-[10px] text-reward">
                      {row.total_xp.toLocaleString()} XP
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
