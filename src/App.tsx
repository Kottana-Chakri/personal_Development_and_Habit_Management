import React, { useState, useEffect } from 'react';
import { User, Calendar, Target, TrendingUp, Award, Plus, CheckCircle, Circle, Flame, Brain, Heart, BookOpen, Briefcase, Home, X, Edit, Trash2, Settings, BarChart3, Clock, Star } from 'lucide-react';

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
];

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    joinDate: new Date().toISOString().split('T')[0],
    totalHabits: 0,
    completedToday: 0,
    longestStreak: 0,
    badges: [],
    level: 1,
    xp: 0
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessment, setAssessment] = useState<Partial<Assessment>>({});
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showBadgeModal, setShowBadgeModal] = useState<Badge | null>(null);
  const [newHabitForm, setNewHabitForm] = useState({
    title: '',
    description: '',
    category: 'Health',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    goal: 30
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
      setUserProfile(JSON.parse(savedProfile));
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

    // Check for new badges
    checkForNewBadges();
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
      totalCompletions: 0
    };

    setHabits(prev => [...prev, newHabit]);
    setNewHabitForm({
      title: '',
      description: '',
      category: 'Health',
      difficulty: 'medium',
      goal: 30
    });
    setShowAddHabit(false);
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const editHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setNewHabitForm({
      title: habit.title,
      description: habit.description,
      category: habit.category,
      difficulty: habit.difficulty,
      goal: habit.goal
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
            color: categoryColor
          }
        : habit
    ));

    setEditingHabit(null);
    setNewHabitForm({
      title: '',
      description: '',
      category: 'Health',
      difficulty: 'medium',
      goal: 30
    });
    setShowAddHabit(false);
  };

  const generateRecommendations = (assessmentData: Partial<Assessment>) => {
    const recs: Recommendation[] = [];

    // Generate recommendations based on assessment
    if (assessmentData.goals?.includes('Improve productivity')) {
      recs.push({
        id: '1',
        title: 'Deep Work Sessions',
        description: 'Dedicate 90 minutes daily to focused, distraction-free work',
        reason: 'Based on your goal to improve productivity and your profession',
        category: 'Productivity',
        difficulty: 'medium',
        estimatedTime: '90 minutes',
        benefits: ['Increased focus', 'Higher quality output', 'Reduced stress'],
        tips: ['Turn off notifications', 'Use the Pomodoro technique', 'Choose your most important task']
      });
    }

    if (assessmentData.goals?.includes('Better health habits')) {
      recs.push({
        id: '2',
        title: 'Morning Exercise',
        description: '30 minutes of physical activity to start your day',
        reason: 'Aligns with your health improvement goals and energizes your day',
        category: 'Health',
        difficulty: 'medium',
        estimatedTime: '30 minutes',
        benefits: ['Increased energy', 'Better mood', 'Improved fitness'],
        tips: ['Start with light exercises', 'Prepare workout clothes the night before', 'Find activities you enjoy']
      });
    }

    if (assessmentData.goals?.includes('Learn new skills')) {
      recs.push({
        id: '3',
        title: 'Daily Reading',
        description: 'Read for 30 minutes daily to expand knowledge and skills',
        reason: 'Perfect for continuous learning and skill development',
        category: 'Learning',
        difficulty: 'easy',
        estimatedTime: '30 minutes',
        benefits: ['Expanded knowledge', 'Improved vocabulary', 'Better critical thinking'],
        tips: ['Choose books related to your goals', 'Read at the same time daily', 'Take notes on key insights']
      });
    }

    if (assessmentData.goals?.includes('Reduce stress')) {
      recs.push({
        id: '4',
        title: 'Mindfulness Meditation',
        description: '10 minutes of daily meditation to reduce stress and improve focus',
        reason: 'Directly addresses your goal to reduce stress and improve mental clarity',
        category: 'Mindfulness',
        difficulty: 'easy',
        estimatedTime: '10 minutes',
        benefits: ['Reduced stress', 'Better emotional regulation', 'Improved focus'],
        tips: ['Start with guided meditations', 'Find a quiet space', 'Be consistent with timing']
      });
    }

    if (assessmentData.profession === 'Software Developer' || assessmentData.profession === 'Manager/Executive') {
      recs.push({
        id: '5',
        title: 'Evening Planning',
        description: 'Spend 15 minutes each evening planning the next day',
        reason: 'Essential for professionals to stay organized and reduce decision fatigue',
        category: 'Productivity',
        difficulty: 'easy',
        estimatedTime: '15 minutes',
        benefits: ['Better time management', 'Reduced stress', 'Clearer priorities'],
        tips: ['Review accomplishments', 'Set 3 key priorities', 'Prepare materials needed']
      });
    }

    setRecommendations(recs);
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
      totalCompletions: 0
    };

    setHabits(prev => [...prev, newHabit]);
  };

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

  const renderOnboarding = () => {
    const assessmentQuestions = [
      {
        question: "What are your main goals for personal development?",
        type: "multiple" as const,
        key: "goals" as keyof Assessment,
        options: ["Improve productivity", "Better health habits", "Learn new skills", "Reduce stress", "Career advancement", "Better relationships"]
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
        options: ["Student", "Software Developer", "Manager/Executive", "Healthcare Professional", "Teacher/Educator", "Entrepreneur", "Other"]
      },
      {
        question: "How much time can you dedicate to new habits daily?",
        type: "single" as const,
        key: "timeAvailable" as keyof Assessment,
        options: ["15-30 minutes", "30-60 minutes", "1-2 hours", "2+ hours"]
      },
      {
        question: "What bad habits would you like to overcome?",
        type: "text" as const,
        key: "badHabits" as keyof Assessment,
        placeholder: "e.g., procrastination, excessive social media, poor sleep schedule..."
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
              Let's Get to Know You
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
                {currentQ.options.map((option, index) => {
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
                {currentQ.options.map((option, index) => {
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
              {assessmentStep === assessmentQuestions.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAddHabitModal = () => {
    if (!showAddHabit) return null;

    return (
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
                  goal: 30
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
                  goal: 30
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
    );
  };

  const renderBadgeModal = () => {
    if (!showBadgeModal) return null;

    const rarityColors = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-yellow-600'
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full border border-white/20 shadow-2xl text-center">
          <div className="text-6xl mb-4">{showBadgeModal.icon}</div>
          <div className={`inline-block px-4 py-2 rounded-full text-white text-sm font-medium mb-4 bg-gradient-to-r ${rarityColors[showBadgeModal.rarity]}`}>
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
    );
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
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Progress</p>
                  <p className="text-3xl font-bold text-gray-900">{progress.completed}/{progress.total}</p>
                  <p className="text-sm text-green-600">{progress.percentage}% complete</p>
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
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                  <Flame className="text-white w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Habits</p>
                  <p className="text-3xl font-bold text-gray-900">{userProfile.totalHabits}</p>
                  <p className="text-sm text-blue-600">actively tracked</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <Target className="text-white w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Level & XP</p>
                  <p className="text-3xl font-bold text-gray-900">{userProfile.level}</p>
                  <p className="text-sm text-purple-600">{userProfile.xp} XP earned</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full flex items-center justify-center">
                  <Award className="text-white w-8 h-8" />
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

        {renderAddHabitModal()}
        {renderBadgeModal()}
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
                          <strong>Why this works for you:</strong> {rec.reason}
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

  const renderAnalytics = () => {
    const completionRate = habits.length > 0 ? Math.round((habits.filter(h => h.totalCompletions > 0).length / habits.length) * 100) : 0;
    const avgStreak = habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / habits.length) : 0;
    const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);

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
              <h1 className="text-xl font-bold text-gray-900">Analytics & Insights</h1>
              <div></div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
                  <p className="text-sm text-green-600">Overall success</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-white w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Streak</p>
                  <p className="text-3xl font-bold text-gray-900">{avgStreak}</p>
                  <p className="text-sm text-orange-600">days per habit</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                  <Flame className="text-white w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Completions</p>
                  <p className="text-3xl font-bold text-gray-900">{totalCompletions}</p>
                  <p className="text-sm text-blue-600">all time</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-white w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                  <p className="text-3xl font-bold text-gray-900">{userProfile.badges.length}</p>
                  <p className="text-sm text-purple-600">achievements</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full flex items-center justify-center">
                  <Award className="text-white w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Habits by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => {
                const categoryHabits = habits.filter(h => h.category === category.name);
                const completions = categoryHabits.reduce((sum, h) => sum + h.totalCompletions, 0);
                const avgStreak = categoryHabits.length > 0 ? Math.round(categoryHabits.reduce((sum, h) => sum + h.streak, 0) / categoryHabits.length) : 0;
                
                return (
                  <div key={category.name} className="bg-white/60 rounded-xl p-4 border border-white/40">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center`}>
                        <category.icon className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-600">{categoryHabits.length} habits</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completions:</span>
                        <span className="font-medium">{completions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Streak:</span>
                        <span className="font-medium">{avgStreak} days</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Habit Performance */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Habit Performance</h3>
            {habits.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No habits to analyze yet. Start tracking habits to see insights!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.map(habit => {
                  const successRate = habit.completedDates.length > 0 ? Math.round((habit.totalCompletions / habit.completedDates.length) * 100) : 0;
                  
                  return (
                    <div key={habit.id} className="bg-white/60 rounded-xl p-4 border border-white/40">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${habit.color} rounded-full`}></div>
                          <div>
                            <h4 className="font-medium text-gray-900">{habit.title}</h4>
                            <p className="text-sm text-gray-600">{habit.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{habit.streak}</p>
                          <p className="text-sm text-gray-600">current streak</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Best Streak</p>
                          <p className="font-medium">{habit.bestStreak} days</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Completions</p>
                          <p className="font-medium">{habit.totalCompletions}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Success Rate</p>
                          <p className="font-medium">{successRate}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const rarityColors = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-yellow-600'
    };

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
              <h1 className="text-xl font-bold text-gray-900">Profile</h1>
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

          {/* Badges */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements & Badges</h3>
            {userProfile.badges.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No badges earned yet. Keep building habits to unlock achievements!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProfile.badges.map(badge => (
                  <div key={badge.id} className="bg-white/60 rounded-xl p-4 border border-white/40 text-center">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <div className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium mb-2 bg-gradient-to-r ${rarityColors[badge.rarity]}`}>
                      {badge.rarity.toUpperCase()}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{badge.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                    <p className="text-xs text-gray-500">Earned {new Date(badge.earnedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Settings & Actions</h3>
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

              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    localStorage.clear();
                    setHabits([]);
                    setUserProfile({
                      id: '1',
                      name: 'Alex Johnson',
                      email: 'alex@example.com',
                      joinDate: new Date().toISOString().split('T')[0],
                      totalHabits: 0,
                      completedToday: 0,
                      longestStreak: 0,
                      badges: [],
                      level: 1,
                      xp: 0
                    });
                    setAssessment({});
                    setRecommendations([]);
                    setCurrentPage('landing');
                  }
                }}
                className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <div className="text-left">
                    <p className="font-medium text-red-900">Clear All Data</p>
                    <p className="text-sm text-red-600">Reset everything and start fresh</p>
                  </div>
                </div>
                <Settings className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLanding = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-8">
                <Target className="text-white text-3xl" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-6">
                Transform Your Life
                <br />
                One Habit at a Time
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Join thousands of students and professionals using AI-powered insights to build lasting habits, 
                eliminate bad ones, and achieve their personal development goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setShowOnboarding(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start Your Journey
                </button>
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="bg-white/80 backdrop-blur-xl text-gray-800 px-8 py-4 rounded-xl text-lg font-medium hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20"
                >
                  View Demo
                </button>
              </div>
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
  };

  if (showOnboarding) {
    return renderOnboarding();
  }

  switch (currentPage) {
    case 'dashboard':
      return renderDashboard();
    case 'recommendations':
      return renderRecommendations();
    case 'analytics':
      return renderAnalytics();
    case 'profile':
      return renderProfile();
    default:
      return renderLanding();
  }
}

export default App;