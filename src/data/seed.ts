import type { Achievement, DailyQuest, GameState, Habit, ShopItem, TimeBlock } from '../types'
import { todayKey } from '../lib/time'

const uid = () => crypto.randomUUID()

function block(
  label: string,
  category: TimeBlock['category'],
  start: string,
  end: string,
  color: string,
  xp: number,
): TimeBlock {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return {
    id: uid(),
    label,
    category,
    startMin: sh * 60 + sm,
    endMin: eh * 60 + em,
    color,
    xp,
  }
}

const COLORS = {
  sleep: '#7b5cff',
  workout: '#2ee6d6',
  reading: '#ff8a3d',
  fresh: '#7CFF6B',
  office: '#1f8a4c',
  lunch: '#c4a35a',
  relax: '#ff8a3d',
  music: '#ff9f43',
  walk: '#a05a2c',
  dinner: '#c44b3c',
  free: '#1a1f2e',
}

export const weekdayBlocks = (): TimeBlock[] => [
  block('Sleep', 'sleep', '23:30', '06:30', COLORS.sleep, 20),
  block('Workout + Book', 'workout', '06:30', '07:30', COLORS.workout, 40),
  block('Fresh', 'fresh', '07:30', '08:30', COLORS.fresh, 15),
  block('Office', 'office', '08:30', '12:30', COLORS.office, 25),
  block('Lunch', 'lunch', '12:30', '13:30', COLORS.lunch, 10),
  block('Office', 'office', '13:30', '17:00', COLORS.office, 25),
  block('Relax', 'relax', '17:00', '18:00', COLORS.relax, 15),
  block('Music', 'music', '18:00', '19:30', COLORS.music, 20),
  block('Walk / Bike', 'walk', '19:30', '20:30', COLORS.walk, 25),
  block('Dinner', 'dinner', '20:30', '21:30', COLORS.dinner, 10),
  block('Office Catch-up', 'office', '21:30', '23:30', COLORS.office, 25),
]

export const weekendBlocks = (): TimeBlock[] => [
  block('Sleep', 'sleep', '23:30', '06:30', COLORS.sleep, 20),
  block('Workout', 'workout', '06:30', '07:30', COLORS.workout, 40),
  block('Newspaper', 'reading', '07:30', '08:30', COLORS.reading, 15),
  block('Book', 'reading', '08:30', '09:30', COLORS.reading, 20),
  block('Free Time', 'free', '09:30', '16:00', COLORS.free, 0),
  block('Relax', 'relax', '16:00', '17:00', COLORS.relax, 15),
  block('Music', 'music', '17:00', '18:00', COLORS.music, 20),
  block('Workout', 'workout', '18:00', '19:00', COLORS.workout, 40),
  block('Walk / Bike', 'walk', '19:00', '20:00', COLORS.walk, 25),
  block('Dinner', 'dinner', '20:00', '21:00', COLORS.dinner, 10),
  block('Office Catch-up', 'office', '21:00', '23:30', COLORS.office, 25),
]

export const seedQuests = (): DailyQuest[] =>
  [
    ['Morning workout', 'Fitness', 'Medium', 25],
    ['Meditate (10 min)', 'Habits', 'Easy', 15],
    ['Read book', 'Reading', 'Easy', 15],
    ['Study ML / System Design 1 hr', 'ML', 'Hard', 40],
    ['Log all meals + calories', 'Habits', 'Easy', 15],
    ['Drink 2L water', 'Habits', 'Easy', 15],
    ['No social media before 9 AM', 'Discipline', 'Medium', 25],
    ['Code 1 hour / 1 LeetCode', 'Coding', 'Medium', 25],
    ['Review finances', 'Finance', 'Easy', 15],
    ['Practice singing (20 min)', 'Singing', 'Easy', 15],
    ['Call / message friend or family', 'Relationships', 'Easy', 15],
    ["Plan tomorrow's tasks", 'Habits', 'Easy', 15],
    ['Walk 10,000 steps', 'Fitness', 'Medium', 25],
    ['Work on Main Quest 1 hr', 'Career', 'Hard', 40],
    ['Learn something new', 'Learning', 'Medium', 25],
    ['Sleep before 11 PM', 'Habits', 'Medium', 25],
    ['No junk food today', 'Habits', 'Medium', 25],
    ['Weekly Boss Battle progress', 'Boss', 'Legendary', 75],
  ].map(([name, category, difficulty, xp]) => ({
    id: uid(),
    name: name as string,
    category: category as string,
    difficulty: difficulty as DailyQuest['difficulty'],
    xp: xp as number,
    done: false,
  }))

export const seedHabits = (): Habit[] =>
  [
    'Wake up 05:00',
    'Morning Workout',
    'Read 20 pages',
    'Drink 2L water',
    'Meditate',
    'Cold shower',
    'No junk food',
    'Sleep by 11 PM',
    'Practice Singing',
    'Review Finances',
    'Plan tomorrow',
    'Walk 10K steps',
    'Study ML/SD',
    'Leetcode/Code 1 hour',
    'No phone morning',
    'Weekly review',
    'Networking',
    'Workout evening',
  ].map((name) => ({
    id: uid(),
    name,
    streak: 0,
    longest: 0,
    checks: {},
  }))

export const seedShop = (): ShopItem[] =>
  [
    ['Favorite Snack', 250, 'Small'],
    ['Movie Night', 500, 'Small'],
    ['Gaming Session (2 hrs)', 750, 'Small'],
    ['Dinner Out', 1000, 'Medium'],
    ['New Clothing Item', 1500, 'Medium'],
    ['New Book or Course', 2000, 'Medium'],
    ['Weekend Staycation', 3000, 'Large'],
    ['Weekend Trip', 5000, 'Large'],
    ['New Tech Accessory', 7500, 'Large'],
    ['New Gadget (smartwatch/tablet)', 10000, 'Epic'],
    ['International Trip', 15000, 'Epic'],
    ['Major Gadget (laptop/phone)', 20000, 'Legendary'],
    ['Dream Purchase', 50000, 'Legendary'],
  ].map(([name, cost, tier]) => ({
    id: uid(),
    name: name as string,
    cost: cost as number,
    tier: tier as string,
    redeemedCount: 0,
  }))

export const seedAchievements = (): Achievement[] => [
  {
    id: uid(),
    name: 'First Quest',
    description: 'Complete your first daily quest',
    target: 1,
    current: 0,
    unlocked: false,
    xp: 50,
  },
  {
    id: uid(),
    name: 'Daily Dozen',
    description: 'Complete 12 quests in one day',
    target: 12,
    current: 0,
    unlocked: false,
    xp: 125,
  },
  {
    id: uid(),
    name: 'Week Warrior',
    description: 'Reach a 7-day login streak',
    target: 7,
    current: 0,
    unlocked: false,
    xp: 200,
  },
  {
    id: uid(),
    name: 'Habit Spark',
    description: 'Check in 5 habits today',
    target: 5,
    current: 0,
    unlocked: false,
    xp: 75,
  },
  {
    id: uid(),
    name: 'Shopper',
    description: 'Redeem your first reward',
    target: 1,
    current: 0,
    unlocked: false,
    xp: 50,
  },
]

export function createInitialState(): GameState {
  const today = todayKey()
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    mode: 'full',
    player: {
      name: 'Player One',
      title: 'Apprentice Coder',
      totalXp: 1655,
      spentXp: 0,
      todayXp: 0,
      todayDate: today,
      loginStreak: 1,
      lastLoginDate: today,
      lifeScores: {
        mood: 7,
        energy: 7,
        health: 7,
        learning: 0,
        finance: 7,
        social: 7,
        career: 7,
        discipline: 0,
      },
    },
    wheels: [
      { id: 'weekday', name: 'Weekday Routine', blocks: weekdayBlocks() },
      { id: 'weekend', name: 'Weekend Routine', blocks: weekendBlocks() },
    ],
    quests: seedQuests(),
    habits: seedHabits(),
    shop: seedShop(),
    redemptions: [],
    achievements: seedAchievements(),
    toast: null,
  }
}
