import { CATEGORY_ICON } from '../components/ui/icons';

/**
 * Deterministic title → icon mapping for routine tasks (spec: no random or
 * AI-generated icons — the same words always produce the same professional
 * glyph from the shared icon family). Keyword matching on the title the
 * player actually typed; falls back to the generic routine grid icon.
 * Shared by the Routine planner and Guild's Daily Focus so one task renders
 * the same sigil everywhere.
 */
const KEYWORD_ICONS = [
  { test: /gym|workout|lift|weights|training|exercise/i, icon: CATEGORY_ICON.gym },
  { test: /run|jog|sprint|marathon/i, icon: CATEGORY_ICON.running },
  { test: /read|book|pages|chapter|novel/i, icon: CATEGORY_ICON.study },
  { test: /study|learn|course|class|homework|revision|school|college/i, icon: CATEGORY_ICON.study },
  { test: /code|program|dev|build|leetcode|hashtable|algorithm/i, icon: CATEGORY_ICON.coding },
  { test: /meditat|yoga|breathe|mindful|calm/i, icon: CATEGORY_ICON.meditation },
  { test: /water|hydrat|drink/i, icon: CATEGORY_ICON.water },
  { test: /sleep|nap|bed|rest(?! day)/i, icon: CATEGORY_ICON.sleep },
  { test: /work|job|shift|client|meeting|office|freelance/i, icon: CATEGORY_ICON.work },
  { test: /finance|budget|invest|saving|money|expense/i, icon: CATEGORY_ICON.finance },
  { test: /clean|chores|laundry|dish|tidy|vacuum|grocer/i, icon: CATEGORY_ICON.chores },
  { test: /health|doctor|vitamin|stretch|walk/i, icon: CATEGORY_ICON.healthy_habits },
];

export default function routineIcon(title) {
  const text = typeof title === 'string' ? title : '';
  const hit = KEYWORD_ICONS.find((entry) => entry.test.test(text));
  return hit ? hit.icon : 'routine';
}
