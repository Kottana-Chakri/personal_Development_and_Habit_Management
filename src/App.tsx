import React, { useState, useEffect } from 'react';
import { User, Calendar, Target, TrendingUp, Award, Plus, CheckCircle, Circle, Flame, Brain, Heart, BookOpen, Briefcase, Home, X, Edit, Trash2, Settings, BarChart3, Clock, Star, Download, Upload, Zap, Trophy, ArrowUp, Activity, Lightbulb, Rocket, ChevronRight, Medal, Crown } from 'lucide-react';

interface Habit {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  streak: number;
  completed: boolean;
  completedDates: string[];
  goal: number;
  color: string;
  createdAt: string;
  bestStreak: number;
  totalCompletions: number;
  notes?: string;
  reminder?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  totalHabits: number;
  completedToday: number;
  longestStreak: number;
  badges: Badge[];
  level: number;
  xp: number;
  avatar?: string;
  timezone: string;
  preferredTime: string;
  notifications: boolean;
  weekStartsOn: 'monday' | 'sunday';
  theme: 'light' | 'dark' | 'auto';
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Assessment {
  strengths: string[];
  weaknesses: string[];
  goals: string[];
  lifestyle: string;
  profession: string;
  badHabits: string[];
  timeAvailable: string;
  motivation: string;
  sleepSchedule: string;
  workSchedule: string;
  stressLevel: number;
  activityLevel: string;
  previousExperience: string;
  challenges: string[];
  preferredHabitTime: string[];
  priorityAreas: string[];
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  benefits: string[];
  tips: string[];
  priority: number;
  personalizedReason: string;
}

interface ProgressInsight {
  id: string;
  type: 'improvement' | 'achievement' | 'suggestion' | 'milestone';
  title: string;
  description: string;
  value: string;
  comparison?: string;
  icon: string;
  color: string;
  actionable?: boolean;
}

interface PersonalMetrics {
  weeklyGrowth: number;
  monthlyGrowth: number;
  consistencyScore: number;
  productivityGains: number;
  stressReduction: number;
  energyIncrease: number;
  overallProgress: number;
}

const categories = [
  { name: 'Health', icon: Heart, color: 'from-red-500 to-pink-500' },
  { name: 'Productivity', icon: Target, color: 'from-blue-500 to-indigo-500' },
  { name: 'Learning', icon: BookOpen, color: 'from-emerald-500 to-teal-500' },
  { name: 'Mindfulness', icon: Brain, color: 'from-purple-500 to-violet-500' },
  { name: 'Career', icon: Briefcase, color: 'from-orange-500 to-amber-500' },
];

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
};

const badgeTemplates = [
  { id: 'first-habit', name: 'Getting Started', description: 'Created your first habit', icon: '🌱', rarity: 'common' as const },
  { id: 'week-streak', name: 'Week Warrior', description: '7-day streak achieved', icon: '🔥', rarity: 'common' as const },
  { id: 'month-streak', name: 'Monthly Master', description: '30-day streak achieved', icon: '💪', rarity: 'rare' as const },
  { id: 'early-bird', name: 'Early Bird', description: 'Completed habits before 8 AM', icon: '🌅', rarity: 'common' as const },
  { id: 'consistency', name: 'Consistency King', description: 'Completed all habits for 5 days', icon: '👑', rarity: 'epic' as const },
  { id: 'perfectionist', name: 'Perfectionist', description: '100% completion rate for a month', icon: '⭐', rarity: 'legendary' as const },
  { id: 'dedicated', name: 'Dedicated', description: 'Maintained habits for 100 days', icon: '🏆', rarity: 'epic' as const },
  { id: 'habit-master', name: 'Habit Master', description: 'Created 10 different habits', icon: '🎯', rarity: 'rare' as const },
];

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: '',
    email: '',
    joinDate: new Date().toISOString().split('T')[0],
    totalHabits: 0,
    completedToday: 0,
    longestStreak: 0,
    badges: [],
    level: 1,
    xp: 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    preferredTime: '09:00',
    notifications: true,
    weekStartsOn: 'monday',
    theme: 'light'
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessment, setAssessment] = useState<Partial<Assessment>>({});
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showBadgeModal, setShowBadgeModal] = useState<Badge | null>(null);
  const [showActionModal, setShowActionModal] = useState<ProgressInsight | null>(null);
  const [progressInsights, setProgressInsights] = useState<ProgressInsight[]>([]);
  const [personalMetrics, setPersonalMetrics] = useState<PersonalMetrics>({
    weeklyGrowth: 0,
    monthlyGrowth: 0,
    consistencyScore: 0,
    productivityGains: 0,
    stressReduction: 0,
    energyIncrease: 0,
    overallProgress: 0
  });
  const [newHabitForm, setNewHabitForm] = useState({
    title: '',
    description: '',
    category: 'Health',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    goal: 30,
    notes: '',
    reminder: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    const savedProfile = localStorage.getItem('userProfile');
    const savedAssessment = localStorage.getItem('assessment');
    
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile(profile);
      // If user doesn't have name or email, show profile setup
      if (!profile.name || !profile.email) {
        setShowProfileSetup(true);
      }
    } else {
      // New user - show profile setup
      setShowProfileSetup(true);
    }
    if (savedAssessment) {
      setAssessment(JSON.parse(savedAssessment));
      if (Object.keys(JSON.parse(savedAssessment)).length > 0) {
        generateRecommendations(JSON.parse(savedAssessment));
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
    updateUserProfile();
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('assessment', JSON.stringify(assessment));
  }, [assessment]);

  const updateUserProfile = () => {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
    const longestStreak = Math.max(0, ...habits.map(h => h.bestStreak));
    const totalXP = habits.reduce((sum, h) => sum + (h.totalCompletions * 10), 0);
    const level = Math.floor(totalXP / 100) + 1;

    setUserProfile(prev => ({
      ...prev,
      totalHabits: habits.length,
      completedToday,
      longestStreak,
      xp: totalXP,
      level
    }));

    // Calculate progress metrics and insights
    calculateProgressMetrics();
    generateProgressInsights();

    // Check for new badges
    checkForNewBadges();
  };

  const calculateProgressMetrics = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate weekly growth
    const thisWeekCompletions = habits.reduce((sum, habit) => {
      return sum + habit.completedDates.filter(date => new Date(date) >= oneWeekAgo).length;
    }, 0);
    
    const lastWeekStart = new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekCompletions = habits.reduce((sum, habit) => {
      return sum + habit.completedDates.filter(date => {
        const d = new Date(date);
        return d >= lastWeekStart && d < oneWeekAgo;
      }).length;
    }, 0);

    const weeklyGrowth = lastWeekCompletions > 0 
      ? Math.round(((thisWeekCompletions - lastWeekCompletions) / lastWeekCompletions) * 100)
      : thisWeekCompletions > 0 ? 100 : 0;

    // Calculate consistency score
    const totalDays = Math.min(30, Math.floor((today.getTime() - new Date(userProfile.joinDate).getTime()) / (24 * 60 * 60 * 1000)));
    const activeDays = new Set();
    habits.forEach(habit => {
      habit.completedDates.forEach(date => {
        if (new Date(date) >= oneMonthAgo) {
          activeDays.add(date);
        }
      });
    });
    const consistencyScore = totalDays > 0 ? Math.round((activeDays.size / totalDays) * 100) : 0;

    // Calculate overall progress
    const totalPossibleCompletions = habits.reduce((sum, habit) => {
      const habitAge = Math.floor((today.getTime() - new Date(habit.createdAt).getTime()) / (24 * 60 * 60 * 1000)) + 1;
      return sum + habitAge;
    }, 0);
    
    const actualCompletions = habits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
    const overallProgress = totalPossibleCompletions > 0 ? Math.round((actualCompletions / totalPossibleCompletions) * 100) : 0;

    setPersonalMetrics({
      weeklyGrowth,
      monthlyGrowth: 0, // Could be calculated similarly
      consistencyScore,
      productivityGains: Math.min(100, Math.max(0, weeklyGrowth + consistencyScore * 0.5)),
      stressReduction: Math.min(100, Math.max(0, consistencyScore * 0.8)),
      energyIncrease: Math.min(100, Math.max(0, overallProgress * 0.9)),
      overallProgress
    });
  };

  const generateProgressInsights = () => {
    const insights: ProgressInsight[] = [];

    // Achievement insights
    if (userProfile.longestStreak >= 7) {
      insights.push({
        id: 'streak-achievement',
        type: 'achievement',
        title: 'Streak Master!',
        description: `You've maintained a ${userProfile.longestStreak}-day streak. This consistency is building lasting change!`,
        value: `${userProfile.longestStreak} days`,
        icon: '🔥',
        color: 'from-orange-500 to-red-500',
        actionable: false
      });
    }

    // Improvement insights
    if (personalMetrics.weeklyGrowth > 0) {
      insights.push({
        id: 'weekly-growth',
        type: 'improvement',
        title: 'Growing Stronger',
        description: 'Your habit completion has increased compared to last week. Keep up the momentum!',
        value: `+${personalMetrics.weeklyGrowth}%`,
        comparison: 'vs last week',
        icon: '📈',
        color: 'from-green-500 to-emerald-500',
        actionable: false
      });
    }

    // Suggestion insights
    if (personalMetrics.consistencyScore < 70) {
      insights.push({
        id: 'consistency-suggestion',
        type: 'suggestion',
        title: 'Boost Your Consistency',
        description: 'Small daily actions create big results. Try starting with easier habits to build momentum.',
        value: `${personalMetrics.consistencyScore}%`,
        icon: '💡',
        color: 'from-blue-500 to-indigo-500',
        actionable: true
      });
    }

    // Add more actionable suggestions
    if (habits.length < 3) {
      insights.push({
        id: 'add-more-habits',
        type: 'suggestion',
        title: 'Expand Your Growth',
        description: 'Building multiple complementary habits creates a powerful transformation system.',
        value: `${habits.length} habits`,
        icon: '🚀',
        color: 'from-purple-500 to-pink-500',
        actionable: true
      });
    }

    if (userProfile.completedToday === 0 && habits.length > 0) {
      insights.push({
        id: 'start-today',
        type: 'suggestion',
        title: 'Start Your Day Right',
        description: 'Every expert was once a beginner. Take the first step today!',
        value: '0 completed',
        icon: '⭐',
        color: 'from-yellow-500 to-orange-500',
        actionable: true
      });
    }

    // Milestone insights
    if (userProfile.totalHabits >= 5 && userProfile.level >= 3) {
      insights.push({
        id: 'milestone-progress',
        type: 'milestone',
        title: 'Transformation in Progress',
        description: 'You\'re building a comprehensive personal development system. Your future self will thank you!',
        value: `Level ${userProfile.level}`,
        icon: '🌟',
        color: 'from-purple-500 to-pink-500',
        actionable: false
      });
    }

    setProgressInsights(insights.slice(0, 3)); // Show top 3 insights
  };

  const handleTakeAction = (insight: ProgressInsight) => {
    setShowActionModal(insight);
  };

  const getActionSuggestions = (insight: ProgressInsight) => {
    switch (insight.id) {
      case 'consistency-suggestion':
        return {
          title: 'Boost Your Consistency - Action Plan',
          actions: [
            {
              title: 'Start with 5-minute habits',
              description: 'Break down your current habits into smaller, easier actions',
              action: () => {
                setNewHabitForm({
                  title: '5-Minute Morning Stretch',
                  description: 'Simple stretching routine to start the day',
                  category: 'Health',
                  difficulty: 'easy',
                  goal: 5,
                  notes: 'Focus on consistency over perfection',
                  reminder: ''
                });
                setShowAddHabit(true);
                setShowActionModal(null);
              }
            },
            {
              title: 'Set up habit reminders',
              description: 'Use phone notifications or visual cues to remember your habits',
              action: () => {
                alert('💡 Tip: Set phone alarms for each habit time and place visual reminders where you\'ll see them!');
                setShowActionModal(null);
              }
            },
            {
              title: 'Track in a visible place',
              description: 'Put a habit tracker where you\'ll see it daily',
              action: () => {
                setCurrentPage('dashboard');
                setShowActionModal(null);
              }
            }
          ]
        };
      
      case 'add-more-habits':
        return {
          title: 'Expand Your Growth - Recommended Habits',
          actions: [
            {
              title: 'Add a morning routine habit',
              description: 'Start your day with intention and energy',
              action: () => {
                setNewHabitForm({
                  title: 'Morning Energizer Routine',
                  description: 'Drink water, stretch, and set daily intention',
                  category: 'Health',
                  difficulty: 'easy',
                  goal: 15,
                  notes: 'The foundation of a productive day',
                  reminder: ''
                });
                setShowAddHabit(true);
                setShowActionModal(null);
              }
            },
            {
              title: 'Add a learning habit',
              description: 'Continuous learning accelerates personal growth',
              action: () => {
                setNewHabitForm({
                  title: 'Daily Learning Session',
                  description: 'Read, watch educational content, or practice a skill',
                  category: 'Learning',
                  difficulty: 'medium',
                  goal: 20,
                  notes: 'Invest in yourself every day',
                  reminder: ''
                });
                setShowAddHabit(true);
                setShowActionModal(null);
              }
            },
            {
              title: 'Add a mindfulness habit',
              description: 'Reduce stress and increase self-awareness',
              action: () => {
                setNewHabitForm({
                  title: 'Mindful Moment',
                  description: 'Practice meditation, deep breathing, or gratitude',
                  category: 'Mindfulness',
                  difficulty: 'easy',
                  goal: 10,
                  notes: 'Peace of mind is the ultimate wealth',
                  reminder: ''
                });
                setShowAddHabit(true);
                setShowActionModal(null);
              }
            }
          ]
        };

      case 'start-today':
        return {
          title: 'Start Your Day Right - Quick Wins',
          actions: [
            {
              title: 'Complete your easiest habit first',
              description: 'Build momentum with a quick win',
              action: () => {
                const easiestHabit = habits.find(h => h.difficulty === 'easy') || habits[0];
                if (easiestHabit) {
                  toggleHabit(easiestHabit.id);
                  alert(`🎉 Great start! You completed "${easiestHabit.title}". Momentum is building!`);
                }
                setShowActionModal(null);
              }
            },
            {
              title: 'Set a 2-minute timer',
              description: 'Commit to just 2 minutes of any habit',
              action: () => {
                alert('⏰ Set a 2-minute timer right now and do ANY habit for just 2 minutes. You\'ve got this!');
                setShowActionModal(null);
              }
            },
            {
              title: 'Plan your ideal day',
              description: 'Schedule when you\'ll do each habit today',
              action: () => {
                const now = new Date();
                const timeSlots = habits.map((habit, index) => {
                  const time = new Date(now.getTime() + (index + 1) * 60 * 60 * 1000);
                  return `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')} - ${habit.title}`;
                }).join('\n');
                alert(`📅 Your habit schedule for today:\n\n${timeSlots}\n\nSet these times in your calendar!`);
                setShowActionModal(null);
              }
            }
          ]
        };

      default:
        return {
          title: 'Take Action',
          actions: [
            {
              title: 'Continue building habits',
              description: 'Keep up the great work!',
              action: () => setShowActionModal(null)
            }
          ]
        };
    }
  };

  const checkForNewBadges = () => {
    const newBadges: Badge[] = [];
    const today = new Date().toISOString().split('T')[0];

    // First habit badge
    if (habits.length >= 1 && !userProfile.badges.some(b => b.id === 'first-habit')) {
      newBadges.push({
        ...badgeTemplates.find(b => b.id === 'first-habit')!,
        earnedAt: today
      });
    }

    // Week streak badge
    if (habits.some(h => h.streak >= 7) && !userProfile.badges.some(b => b.id === 'week-streak')) {
      newBadges.push({
        ...badgeTemplates.find(b => b.id === 'week-streak')!,
        earnedAt: today
      });
    }

    // Month streak badge
    if (habits.some(h => h.streak >= 30) && !userProfile.badges.some(b => b.id === 'month-streak')) {
      newBadges.push({
        ...badgeTemplates.find(b => b.id === 'month-streak')!,
        earnedAt: today
      });
    }

    // Habit master badge
    if (habits.length >= 10 && !userProfile.badges.some(b => b.id === 'habit-master')) {
      newBadges.push({
        ...badgeTemplates.find(b => b.id === 'habit-master')!,
        earnedAt: today
      });
    }

    // Consistency badge
    const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
    if (completedToday === habits.length && habits.length >= 3 && !userProfile.badges.some(b => b.id === 'consistency')) {
      newBadges.push({
        ...badgeTemplates.find(b => b.id === 'consistency')!,
        earnedAt: today
      });
    }

    if (newBadges.length > 0) {
      setUserProfile(prev => ({
        ...prev,
        badges: [...prev.badges, ...newBadges]
      }));
      
      // Show badge modal for the first new badge
      setShowBadgeModal(newBadges[0]);
    }
  };

  const generateRecommendations = (assessmentData: Partial<Assessment>) => {
    const recs: Recommendation[] = [];

    // Enhanced AI-powered recommendations based on comprehensive assessment
    if (assessmentData.goals?.includes('Improve productivity')) {
      if (assessmentData.stressLevel && assessmentData.stressLevel > 7) {
        recs.push({
          id: 'stress-management',
          title: 'Stress Management Break',
          description: 'Take a 10-minute break every 2 hours to reduce stress and improve focus',
          reason: 'Your high stress level indicates you need regular breaks to maintain productivity',
          personalizedReason: `Based on your stress level of ${assessmentData.stressLevel}/10, incorporating stress breaks will significantly improve your productivity.`,
          category: 'Mindfulness',
          difficulty: 'easy',
          estimatedTime: '10 minutes',
          benefits: ['Reduced stress', 'Better focus', 'Improved decision making'],
          tips: ['Set a timer for every 2 hours', 'Use breathing exercises', 'Step away from your workspace'],
          priority: 9
        });
      }

      if (assessmentData.workSchedule === 'Work from home') {
        recs.push({
          id: 'home-productivity',
          title: 'Dedicated Workspace Setup',
          description: 'Create and maintain a dedicated workspace at home',
          reason: 'Working from home requires clear boundaries to maintain productivity',
          personalizedReason: 'Since you work from home, having a dedicated workspace will improve your focus and work-life balance.',
          category: 'Productivity',
          difficulty: 'medium',
          estimatedTime: '30 minutes',
          benefits: ['Better focus', 'Clear work-life boundaries', 'Professional mindset'],
          tips: ['Choose a quiet corner', 'Keep it organized', 'Use it only for work'],
          priority: 8
        });
      }
    }

    if (assessmentData.goals?.includes('Better health habits')) {
      if (assessmentData.activityLevel === 'Sedentary (little to no exercise)') {
        recs.push({
          id: 'gentle-movement',
          title: 'Gentle Daily Movement',
          description: 'Start with 15 minutes of gentle movement like walking or stretching',
          reason: 'Since you\'re currently sedentary, starting small will help build sustainable habits',
          personalizedReason: 'Given your current activity level, gentle movement is the perfect starting point for building a healthy lifestyle.',
          category: 'Health',
          difficulty: 'easy',
          estimatedTime: '15 minutes',
          benefits: ['Increased energy', 'Better mood', 'Improved circulation'],
          tips: ['Start with short walks', 'Use stairs instead of elevators', 'Stretch during TV time'],
          priority: 10
        });
      }
    }

    if (assessmentData.goals?.includes('Learn new skills')) {
      if (assessmentData.timeAvailable === '15-30 minutes') {
        recs.push({
          id: 'micro-learning',
          title: 'Micro-Learning Sessions',
          description: 'Dedicate 20 minutes daily to learning something new',
          reason: 'Short, focused learning sessions are perfect for your available time',
          personalizedReason: 'With your 15-30 minute availability, micro-learning will help you consistently build new skills.',
          category: 'Learning',
          difficulty: 'easy',
          estimatedTime: '20 minutes',
          benefits: ['Continuous growth', 'New perspectives', 'Career advancement'],
          tips: ['Use apps like Duolingo', 'Watch educational videos', 'Read industry articles'],
          priority: 7
        });
      }
    }

    if (assessmentData.sleepSchedule === 'Night owl (sleep after 12 AM, wake after 8 AM)') {
      recs.push({
        id: 'sleep-optimization',
        title: 'Evening Wind-Down Routine',
        description: 'Create a 30-minute wind-down routine before bed',
        reason: 'As a night owl, establishing a consistent evening routine will improve sleep quality',
        personalizedReason: 'Your night owl schedule can be optimized with a proper wind-down routine for better rest.',
        category: 'Health',
        difficulty: 'medium',
        estimatedTime: '30 minutes',
        benefits: ['Better sleep quality', 'More energy', 'Improved focus'],
        tips: ['No screens 1 hour before bed', 'Try reading or meditation', 'Keep room cool and dark'],
        priority: 8
      });
    }

    if (assessmentData.challenges?.includes('Lack of motivation')) {
      recs.push({
        id: 'motivation-tracking',
        title: 'Daily Wins Journal',
        description: 'Write down 3 wins or positive moments from each day',
        reason: 'Tracking positive moments helps build motivation and gratitude',
        personalizedReason: 'Since motivation is a challenge for you, a wins journal will help you see progress and stay motivated.',
        category: 'Mindfulness',
        difficulty: 'easy',
        estimatedTime: '10 minutes',
        benefits: ['Increased motivation', 'Better mood', 'Clearer progress tracking'],
        tips: ['Keep it simple', 'Include small wins', 'Review weekly for patterns'],
        priority: 9
      });
    }

    // Sort by priority and limit to top recommendations
    recs.sort((a, b) => b.priority - a.priority);
    setRecommendations(recs.slice(0, 6));
  };

  const exportData = () => {
    const data = {
      habits,
      userProfile,
      assessment,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.habits) setHabits(data.habits);
        if (data.userProfile) setUserProfile(data.userProfile);
        if (data.assessment) setAssessment(data.assessment);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // Continue with the rest of the component functions...
  const toggleHabit = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setHabits(prevHabits => prevHabits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = !habit.completed;
        const newCompletedDates = isCompleted 
          ? [...habit.completedDates.filter(date => date !== today), today]
          : habit.completedDates.filter(date => date !== today);
        
        const newStreak = isCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1);
        const newBestStreak = Math.max(habit.bestStreak, newStreak);
        const newTotalCompletions = isCompleted ? habit.totalCompletions + 1 : Math.max(0, habit.totalCompletions - 1);

        return {
          ...habit,
          completed: isCompleted,
          completedDates: newCompletedDates,
          streak: newStreak,
          bestStreak: newBestStreak,
          totalCompletions: newTotalCompletions
        };
      }
      return habit;
    }));
  };

  const addHabit = () => {
    if (!newHabitForm.title.trim()) return;

    const categoryColor = categories.find(c => c.name === newHabitForm.category)?.color || 'from-gray-400 to-gray-500';
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      title: newHabitForm.title,
      description: newHabitForm.description,
      category: newHabitForm.category,
      difficulty: newHabitForm.difficulty,
      goal: newHabitForm.goal,
      color: categoryColor,
      streak: 0,
      completed: false,
      completedDates: [],
      createdAt: new Date().toISOString().split('T')[0],
      bestStreak: 0,
      totalCompletions: 0,
      notes: newHabitForm.notes,
      reminder: newHabitForm.reminder
    };

    setHabits(prev => [...prev, newHabit]);
    setNewHabitForm({
      title: '',
      description: '',
      category: 'Health',
      difficulty: 'medium',
      goal: 30,
      notes: '',
      reminder: ''
    });
    setShowAddHabit(false);
  };

  const deleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      setHabits(prev => prev.filter(h => h.id !== habitId));
    }
  };

  const editHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setNewHabitForm({
      title: habit.title,
      description: habit.description,
      category: habit.category,
      difficulty: habit.difficulty,
      goal: habit.goal,
      notes: habit.notes || '',
      reminder: habit.reminder || ''
    });
    setShowAddHabit(true);
  };

  const updateHabit = () => {
    if (!editingHabit || !newHabitForm.title.trim()) return;

    const categoryColor = categories.find(c => c.name === newHabitForm.category)?.color || 'from-gray-400 to-gray-500';

    setHabits(prev => prev.map(habit => 
      habit.id === editingHabit.id 
        ? {
            ...habit,
            title: newHabitForm.title,
            description: newHabitForm.description,
            category: newHabitForm.category,
            difficulty: newHabitForm.difficulty,
            goal: newHabitForm.goal,
            color: categoryColor,
            notes: newHabitForm.notes,
            reminder: newHabitForm.reminder
          }
        : habit
    ));

    setEditingHabit(null);
    setNewHabitForm({
      title: '',
      description: '',
      category: 'Health',
      difficulty: 'medium',
      goal: 30,
      notes: '',
      reminder: ''
    });
    setShowAddHabit(false);
  };

  const addRecommendedHabit = (rec: Recommendation) => {
    const categoryColor = categories.find(c => c.name === rec.category)?.color || 'from-gray-400 to-gray-500';
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      title: rec.title,
      description: rec.description,
      category: rec.category,
      difficulty: rec.difficulty,
      goal: parseInt(rec.estimatedTime.split(' ')[0]) || 30,
      color: categoryColor,
      streak: 0,
      completed: false,
      completedDates: [],
      createdAt: new Date().toISOString().split('T')[0],
      bestStreak: 0,
      totalCompletions: 0,
      notes: rec.personalizedReason
    };

    setHabits(prev => [...prev, newHabit]);
  };

  // Show profile setup if needed
  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-2xl w-full border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
              <User className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Welcome to HabitFlow
            </h2>
            <p className="text-gray-600 mt-2">Let's set up your profile to get started</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Habit Time
              </label>
              <input
                type="time"
                value={userProfile.preferredTime}
                onChange={(e) => setUserProfile(prev => ({ ...prev, preferredTime: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={userProfile.notifications}
                onChange={(e) => setUserProfile(prev => ({ ...prev, notifications: e.target.checked }))}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">Enable habit reminders and progress notifications</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => {
                if (!userProfile.name.trim() || !userProfile.email.trim()) {
                  alert('Please fill in all required fields');
                  return;
                }
                setShowProfileSetup(false);
                setCurrentPage('landing');
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding assessment if needed
  if (showOnboarding) {
    const assessmentQuestions = [
      {
        question: "What are your main goals for personal development?",
        type: "multiple" as const,
        key: "goals" as keyof Assessment,
        options: [
          "Improve productivity", 
          "Better health habits", 
          "Learn new skills", 
          "Reduce stress", 
          "Career advancement", 
          "Better relationships",
          "Financial wellness",
          "Mental well-being",
          "Physical fitness",
          "Work-life balance"
        ]
      },
      {
        question: "What's your current lifestyle?",
        type: "single" as const,
        key: "lifestyle" as keyof Assessment,
        options: ["Very busy, limited time", "Moderate schedule, some flexibility", "Flexible schedule, plenty of time"]
      },
      {
        question: "What's your profession or role?",
        type: "single" as const,
        key: "profession" as keyof Assessment,
        options: ["Student", "Software Developer", "Manager/Executive", "Healthcare Professional", "Teacher/Educator", "Entrepreneur", "Freelancer", "Retired", "Other"]
      },
      {
        question: "How much time can you dedicate to new habits daily?",
        type: "single" as const,
        key: "timeAvailable" as keyof Assessment,
        options: ["15-30 minutes", "30-60 minutes", "1-2 hours", "2+ hours"]
      },
      {
        question: "What's your typical sleep schedule?",
        type: "single" as const,
        key: "sleepSchedule" as keyof Assessment,
        options: ["Early bird (sleep before 10 PM, wake before 6 AM)", "Normal schedule (sleep 10 PM-12 AM, wake 6-8 AM)", "Night owl (sleep after 12 AM, wake after 8 AM)", "Irregular schedule"]
      },
      {
        question: "What's your work schedule like?",
        type: "single" as const,
        key: "workSchedule" as keyof Assessment,
        options: ["Traditional 9-5", "Flexible hours", "Shift work", "Work from home", "Student schedule", "Irregular/varying"]
      },
      {
        question: "How would you rate your current stress level? (1-10)",
        type: "scale" as const,
        key: "stressLevel" as keyof Assessment,
        min: 1,
        max: 10,
        labels: ["Very Low", "Very High"]
      },
      {
        question: "How active are you currently?",
        type: "single" as const,
        key: "activityLevel" as keyof Assessment,
        options: ["Sedentary (little to no exercise)", "Lightly active (light exercise 1-3 days/week)", "Moderately active (moderate exercise 3-5 days/week)", "Very active (hard exercise 6-7 days/week)"]
      },
      {
        question: "Do you have experience with habit tracking?",
        type: "single" as const,
        key: "previousExperience" as keyof Assessment,
        options: ["Complete beginner", "Some experience", "Experienced with habit tracking", "Expert level"]
      },
      {
        question: "What are your biggest challenges in maintaining habits?",
        type: "multiple" as const,
        key: "challenges" as keyof Assessment,
        options: [
          "Lack of motivation",
          "Forgetting to do the habit",
          "Too busy/no time",
          "Lack of immediate results",
          "Social pressure/environment",
          "Perfectionism",
          "Starting too many habits at once",
          "Lack of accountability"
        ]
      },
      {
        question: "When do you prefer to work on personal habits?",
        type: "multiple" as const,
        key: "preferredHabitTime" as keyof Assessment,
        options: ["Early morning", "Mid-morning", "Lunch time", "Afternoon", "Evening", "Before bed", "Flexible/varies"]
      },
      {
        question: "What bad habits would you like to overcome?",
        type: "text" as const,
        key: "badHabits" as keyof Assessment,
        placeholder: "e.g., procrastination, excessive social media, poor sleep schedule, unhealthy eating..."
      }
    ];

    const currentQ = assessmentQuestions[assessmentStep];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-2xl w-full border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
              <Brain className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Personal Development Assessment
            </h2>
            <p className="text-gray-600 mt-2">Step {assessmentStep + 1} of {assessmentQuestions.length}</p>
          </div>

          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((assessmentStep + 1) / assessmentQuestions.length) * 100}%` }}
              ></div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-6">{currentQ.question}</h3>

            {currentQ.type === "multiple" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQ.options?.map((option, index) => {
                  const isSelected = (assessment[currentQ.key] as string[])?.includes(option);
                  return (
                    <button
                      key={index}
                      className={`p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                      onClick={() => {
                        const currentValues = (assessment[currentQ.key] as string[]) || [];
                        const newValues = isSelected 
                          ? currentValues.filter(v => v !== option)
                          : [...currentValues, option];
                        setAssessment({ ...assessment, [currentQ.key]: newValues });
                      }}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="text-white w-3 h-3" />}
                        </div>
                        {option}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ.type === "single" && (
              <div className="space-y-3">
                {currentQ.options?.map((option, index) => {
                  const isSelected = assessment[currentQ.key] === option;
                  return (
                    <button
                      key={index}
                      className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                      onClick={() => {
                        setAssessment({ ...assessment, [currentQ.key]: option });
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ.type === "scale" && (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{currentQ.labels?.[0]}</span>
                  <span>{currentQ.labels?.[1]}</span>
                </div>
                <input
                  type="range"
                  min={currentQ.min}
                  max={currentQ.max}
                  value={(assessment[currentQ.key] as number) || 5}
                  onChange={(e) => setAssessment({ ...assessment, [currentQ.key]: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {(assessment[currentQ.key] as number) || 5}
                  </span>
                </div>
              </div>
            )}

            {currentQ.type === "text" && (
              <textarea
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                rows={4}
                placeholder={currentQ.placeholder}
                value={(assessment[currentQ.key] as string) || ''}
                onChange={(e) => setAssessment({ ...assessment, [currentQ.key]: e.target.value })}
              />
            )}
          </div>

          <div className="flex justify-between">
            <button
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              onClick={() => setAssessmentStep(assessmentStep - 1)}
              disabled={assessmentStep === 0}
            >
              Previous
            </button>
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => {
                if (assessmentStep === assessmentQuestions.length - 1) {
                  generateRecommendations(assessment);
                  setShowOnboarding(false);
                  setCurrentPage('recommendations');
                } else {
                  setAssessmentStep(assessmentStep + 1);
                }
              }}
            >
              {assessmentStep === assessmentQuestions.length - 1 ? 'Complete Assessment' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getDayProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    const completed = habits.filter(h => h.completedDates.includes(today)).length;
    const total = habits.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getWeekProgress = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + index + 1);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayHabits = habits.filter(h => h.completedDates.includes(dateStr));
      const totalHabitsOnDay = habits.filter(h => new Date(h.createdAt) <= date).length;
      
      return {
        day,
        date: dateStr,
        completed: dayHabits.length === totalHabitsOnDay && totalHabitsOnDay > 0,
        percentage: totalHabitsOnDay > 0 ? Math.round((dayHabits.length / totalHabitsOnDay) * 100) : 0
      };
    });
  };

  const getFilteredHabits = () => {
    if (selectedCategory === 'All') return habits;
    return habits.filter(h => h.category === selectedCategory);
  };

  const renderDashboard = () => {
    const progress = getDayProgress();
    const weekProgress = getWeekProgress();
    const filteredHabits = getFilteredHabits();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Target className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">HabitFlow</h1>
                  <p className="text-sm text-gray-600">Welcome back, {userProfile.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-medium">{userProfile.longestStreak}</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">Level {userProfile.level}</span>
                </div>
                <button 
                  onClick={() => setCurrentPage('profile')}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Insights Section */}
          {progressInsights.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Lightbulb className="w-6 h-6 mr-2 text-yellow-500" />
                Your Personal Development Journey
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {progressInsights.map((insight) => (
                  <div key={insight.id} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${insight.color} rounded-full flex items-center justify-center text-2xl`}>
                        {insight.icon}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        insight.type === 'achievement' ? 'bg-yellow-100 text-yellow-800' :
                        insight.type === 'improvement' ? 'bg-green-100 text-green-800' :
                        insight.type === 'suggestion' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">{insight.value}</span>
                        {insight.comparison && (
                          <span className="text-sm text-gray-500 ml-2">{insight.comparison}</span>
                        )}
                      </div>
                      {insight.actionable && (
                        <button 
                          onClick={() => handleTakeAction(insight)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
                        >
                          Take Action <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Stats Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Today's Overview</h2>
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Progress</p>
                    <p className="text-3xl font-bold text-gray-900">{progress.completed}/{progress.total}</p>
                    <p className="text-sm text-green-600">{progress.percentage}% complete</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-white w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Streak</p>
                    <p className="text-3xl font-bold text-gray-900">{userProfile.longestStreak}</p>
                    <p className="text-sm text-orange-600">days in a row</p>
                    {personalMetrics.weeklyGrowth > 0 && (
                      <div className="flex items-center mt-1">
                        <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">+{personalMetrics.weeklyGrowth}% this week</span>
                      </div>
                    )}
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                    <Flame className="text-white w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Consistency Score</p>
                    <p className="text-3xl font-bold text-gray-900">{personalMetrics.consistencyScore}%</p>
                    <p className="text-sm text-blue-600">past 30 days</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${personalMetrics.consistencyScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <Activity className="text-white w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Level & XP</p>
                    <p className="text-3xl font-bold text-gray-900">{userProfile.level}</p>
                    <p className="text-sm text-purple-600">{userProfile.xp} XP earned</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-violet-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(userProfile.xp % 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full flex items-center justify-center">
                    <Trophy className="text-white w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Week Progress */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Progress</h3>
            <div className="grid grid-cols-7 gap-2">
              {weekProgress.map((day, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm text-gray-600 mb-2">{day.day}</p>
                  <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                    day.completed 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                      : 'bg-gray-200'
                  }`}>
                    {day.completed ? (
                      <CheckCircle className="text-white w-6 h-6" />
                    ) : (
                      <Circle className="text-gray-400 w-6 h-6" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{day.percentage}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === 'All'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                  : 'bg-white/60 text-gray-600 hover:bg-white/80'
              }`}
            >
              All ({habits.length})
            </button>
            {categories.map(category => {
              const count = habits.filter(h => h.category === category.name).length;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.name
                      ? `bg-gradient-to-r ${category.color} text-white`
                      : 'bg-white/60 text-gray-600 hover:bg-white/80'
                  }`}
                >
                  <category.icon className="w-4 h-4 inline mr-1" />
                  {category.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Today's Habits */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCategory === 'All' ? "Today's Habits" : `${selectedCategory} Habits`}
              </h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentPage('analytics')}
                  className="bg-white/60 text-gray-600 px-4 py-2 rounded-xl hover:bg-white/80 transition-all duration-200 flex items-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </button>
                <button 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  onClick={() => setShowAddHabit(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Habit</span>
                </button>
              </div>
            </div>

            {filteredHabits.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h4>
                <p className="text-gray-600 mb-4">
                  {selectedCategory === 'All' 
                    ? "Start building better habits today!" 
                    : `No ${selectedCategory.toLowerCase()} habits found. Create one to get started!`}
                </p>
                <button 
                  onClick={() => setShowAddHabit(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                >
                  Add Your First Habit
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center space-x-4 p-4 bg-white/60 rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-200"
                  >
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className="flex-shrink-0"
                    >
                      {habit.completed ? (
                        <CheckCircle className="text-green-500 w-6 h-6" />
                      ) : (
                        <Circle className="text-gray-400 w-6 h-6 hover:text-green-400 transition-colors" />
                      )}
                    </button>
                    
                    <div className="flex-grow">
                      <h4 className={`font-medium ${habit.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {habit.title}
                      </h4>
                      <p className="text-sm text-gray-600">{habit.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${habit.color} text-white`}>
                          {habit.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[habit.difficulty]}`}>
                          {habit.difficulty}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Flame className="text-orange-500 w-4 h-4" />
                          <span className="text-sm text-gray-600">{habit.streak} days</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="text-blue-500 w-4 h-4" />
                          <span className="text-sm text-gray-600">{habit.goal} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => editHabit(habit)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Habit Modal */}
        {showAddHabit && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingHabit ? 'Edit Habit' : 'Add New Habit'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddHabit(false);
                    setEditingHabit(null);
                    setNewHabitForm({
                      title: '',
                      description: '',
                      category: 'Health',
                      difficulty: 'medium',
                      goal: 30,
                      notes: '',
                      reminder: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newHabitForm.title}
                    onChange={(e) => setNewHabitForm({ ...newHabitForm, title: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., Morning Exercise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newHabitForm.description}
                    onChange={(e) => setNewHabitForm({ ...newHabitForm, description: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                    rows={3}
                    placeholder="Describe your habit..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newHabitForm.category}
                    onChange={(e) => setNewHabitForm({ ...newHabitForm, category: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={newHabitForm.difficulty}
                    onChange={(e) => setNewHabitForm({ ...newHabitForm, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal (minutes)</label>
                  <input
                    type="number"
                    value={newHabitForm.goal}
                    onChange={(e) => setNewHabitForm({ ...newHabitForm, goal: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    min="1"
                    max="480"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                  <textarea
                    value={newHabitForm.notes}
                    onChange={(e) => setNewHabitForm({ ...newHabitForm, notes: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                    rows={2}
                    placeholder="Any additional notes or motivation..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddHabit(false);
                    setEditingHabit(null);
                    setNewHabitForm({
                      title: '',
                      description: '',
                      category: 'Health',
                      difficulty: 'medium',
                      goal: 30,
                      notes: '',
                      reminder: ''
                    });
                  }}
                  className="flex-1 px-4 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingHabit ? updateHabit : addHabit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                >
                  {editingHabit ? 'Update' : 'Add'} Habit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Badge Modal */}
        {showBadgeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full border border-white/20 shadow-2xl text-center">
              <div className="text-6xl mb-4">{showBadgeModal.icon}</div>
              <div className={`inline-block px-4 py-2 rounded-full text-white text-sm font-medium mb-4 bg-gradient-to-r ${
                showBadgeModal.rarity === 'common' ? 'from-gray-400 to-gray-600' :
                showBadgeModal.rarity === 'rare' ? 'from-blue-400 to-blue-600' :
                showBadgeModal.rarity === 'epic' ? 'from-purple-400 to-purple-600' :
                'from-yellow-400 to-yellow-600'
              }`}>
                {showBadgeModal.rarity.toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{showBadgeModal.name}</h3>
              <p className="text-gray-600 mb-6">{showBadgeModal.description}</p>
              <button
                onClick={() => setShowBadgeModal(null)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                Awesome!
              </button>
            </div>
          </div>
        )}

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-lg w-full border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${showActionModal.color} rounded-full flex items-center justify-center text-2xl`}>
                    {showActionModal.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{getActionSuggestions(showActionModal).title}</h3>
                </div>
                <button
                  onClick={() => setShowActionModal(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {getActionSuggestions(showActionModal).actions.map((action, index) => (
                  <div key={index} className="bg-white/60 rounded-xl p-4 border border-white/40 hover:bg-white/80 transition-all">
                    <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{action.description}</p>
                    <button
                      onClick={action.action}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium"
                    >
                      {action.title}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 text-center">
                  <strong>💡 Remember:</strong> Small consistent actions lead to extraordinary results. 
                  Every expert was once a beginner who never gave up!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRecommendations = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Home className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">AI Recommendations</h1>
              <div></div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4">
              <Brain className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Personalized Habit Recommendations
            </h2>
            <p className="text-gray-600 mt-2">
              Based on your assessment, here are habits that will help you achieve your goals
            </p>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
              <p className="text-gray-600 mb-4">Complete the assessment to get personalized habit recommendations</p>
              <button 
                onClick={() => setShowOnboarding(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                Take Assessment
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{rec.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                          categories.find(c => c.name === rec.category)?.color || 'from-gray-400 to-gray-500'
                        } text-white`}>
                          {rec.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[rec.difficulty]}`}>
                          {rec.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{rec.description}</p>
                      
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>Why this works for you:</strong> {rec.personalizedReason || rec.reason}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {rec.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Tips to get started:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {rec.tips.map((tip, index) => (
                              <li key={index} className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">
                        <strong>Estimated time:</strong> {rec.estimatedTime}
                      </p>
                    </div>
                    <button 
                      onClick={() => addRecommendedHabit(rec)}
                      className="ml-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Habit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Home className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Profile & Settings</h1>
              <div></div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-lg mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="text-white w-12 h-12" />
              </div>
              <div className="flex-grow">
                <h2 className="text-3xl font-bold text-gray-900">{userProfile.name}</h2>
                <p className="text-gray-600 mb-2">{userProfile.email}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">Level {userProfile.level}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-medium">{userProfile.xp} XP</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Joined {new Date(userProfile.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={exportData}
                className="flex items-center justify-center space-x-2 p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-all"
              >
                <Download className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Export Data</span>
              </button>
              <label className="flex items-center justify-center space-x-2 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer">
                <Upload className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Import Data</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={importData} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions</h3>
            <div className="space-y-4">
              <button 
                onClick={() => setShowOnboarding(true)}
                className="w-full flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/40 hover:bg-white/80 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Retake Assessment</p>
                    <p className="text-sm text-gray-600">Update your goals and get new recommendations</p>
                  </div>
                </div>
                <Settings className="w-5 h-5 text-gray-400" />
              </button>

              <button 
                onClick={() => setCurrentPage('recommendations')}
                className="w-full flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/40 hover:bg-white/80 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">View Recommendations</p>
                    <p className="text-sm text-gray-600">See AI-powered habit suggestions</p>
                  </div>
                </div>
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Determine which component to render
  switch (currentPage) {
    case 'dashboard':
      return renderDashboard();
    case 'recommendations':
      return renderRecommendations();
    case 'profile':
      return renderProfile();
    case 'analytics':
      return renderDashboard(); // For now, redirect to dashboard
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
            <div className="absolute inset-0 opacity-40">
              <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <g fill="none" fillRule="evenodd">
                  <g fill="#6366f1" fillOpacity="0.03">
                    <circle cx="30" cy="30" r="1"/>
                  </g>
                </g>
              </svg>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-8 shadow-xl">
                  <Rocket className="text-white text-3xl" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
                  Transform Your Life
                  <br />
                  <span className="text-4xl md:text-6xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Become Your Best Self
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                  Join <span className="font-semibold text-blue-600">50,000+</span> ambitious individuals using AI-powered insights to build 
                  <span className="font-semibold"> lasting habits</span>, eliminate obstacles, and achieve 
                  <span className="font-semibold text-purple-600"> extraordinary personal growth</span>.
                </p>
                
                {/* Social Proof */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white"></div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">Join our community</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">4.9/5 from 12,000+ users</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <button 
                    onClick={() => setShowOnboarding(true)}
                    className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center"
                  >
                    <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Start Your Transformation
                  </button>
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="bg-white/80 backdrop-blur-sm text-gray-800 px-8 py-4 rounded-xl text-lg font-medium border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                  >
                    <Activity className="w-5 h-5 mr-2" />
                    View Dashboard
                  </button>
                </div>

                {/* Key Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
                    <Crown className="w-8 h-8 text-yellow-500" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Elite Performance</p>
                      <p className="text-sm text-gray-600">Top 1% habits system</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
                    <Medal className="w-8 h-8 text-purple-500" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Proven Results</p>
                      <p className="text-sm text-gray-600">Science-backed methods</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
                    <Trophy className="w-8 h-8 text-green-500" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Track Progress</p>
                      <p className="text-sm text-gray-600">See your growth daily</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Stories Section */}
          <div className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Real People, Real Transformations
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  See how others have used HabitFlow to achieve extraordinary results and become the best version of themselves
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Sarah Chen",
                    role: "Software Developer",
                    achievement: "Lost 30 lbs & Promoted to Senior Dev",
                    quote: "HabitFlow helped me build a morning routine that transformed my energy and career. I went from struggling to stay focused to leading major projects.",
                    metrics: "90% consistency • 6 months • 12 new habits",
                    avatar: "👩‍💻"
                  },
                  {
                    name: "Marcus Rodriguez",
                    role: "Entrepreneur",
                    achievement: "Built $100K Side Business",
                    quote: "The productivity habits I learned through HabitFlow gave me the discipline to build my business while working full-time. Game changer!",
                    metrics: "95% consistency • 8 months • 15 new habits",
                    avatar: "👨‍💼"
                  },
                  {
                    name: "Emily Johnson",
                    role: "Student",
                    achievement: "4.0 GPA & Stress-Free",
                    quote: "I went from procrastinating constantly to having a study system that actually works. My stress levels dropped and grades soared!",
                    metrics: "88% consistency • 4 months • 8 new habits",
                    avatar: "👩‍🎓"
                  }
                ].map((story, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                        {story.avatar}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">{story.name}</h3>
                        <p className="text-gray-600 text-sm">{story.role}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 mb-4">
                      <p className="font-semibold text-green-800 text-sm">🎯 Achievement</p>
                      <p className="text-green-900 font-medium">{story.achievement}</p>
                    </div>
                    <blockquote className="text-gray-700 italic mb-4">
                      "{story.quote}"
                    </blockquote>
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                      {story.metrics}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20 bg-white/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Everything You Need to Succeed
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Powered by AI and backed by behavioral science to help you build habits that stick
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: Brain,
                    title: "AI-Powered Recommendations",
                    description: "Get personalized habit suggestions based on your goals, lifestyle, and current patterns."
                  },
                  {
                    icon: TrendingUp,
                    title: "Progress Tracking",
                    description: "Visual dashboards and analytics to monitor your progress and celebrate achievements."
                  },
                  {
                    icon: Target,
                    title: "Goal-Oriented Approach",
                    description: "Set specific, measurable goals and track your journey with precision and motivation."
                  },
                  {
                    icon: Award,
                    title: "Achievement System",
                    description: "Earn badges, maintain streaks, and unlock rewards as you build consistent habits."
                  },
                  {
                    icon: Calendar,
                    title: "Smart Scheduling",
                    description: "Intelligent reminders and calendar integration to fit habits into your busy life."
                  },
                  {
                    icon: User,
                    title: "Personal Assessment",
                    description: "Comprehensive evaluation of your strengths, weaknesses, and areas for improvement."
                  }
                ].map((feature, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                      <feature.icon className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Life?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of people who have already started their personal development journey
              </p>
              <button 
                onClick={() => setShowOnboarding(true)}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      );
  }
}

export default App;
