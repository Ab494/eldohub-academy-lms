import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Star,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  earnedDate?: string;
  earned: boolean;
}

const StudentAchievements: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      // Placeholder achievements - in real implementation, fetch from API
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: Star,
          earned: true,
          earnedDate: '2024-01-15'
        },
        {
          id: '2',
          title: 'Course Completer',
          description: 'Finish your first course',
          icon: Award,
          earned: false
        },
        {
          id: '3',
          title: 'Learning Streak',
          description: 'Learn for 7 consecutive days',
          icon: Trophy,
          earned: false
        },
        {
          id: '4',
          title: 'Quiz Master',
          description: 'Score 100% on a quiz',
          icon: Star,
          earned: false
        }
      ];
      setAchievements(mockAchievements);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load achievements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const lockedAchievements = achievements.filter(a => !a.earned);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Achievements
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your learning milestones and unlock badges
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6 text-center shadow-card">
          <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{earnedAchievements.length}</div>
          <div className="text-sm text-muted-foreground">Earned</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center shadow-card">
          <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{lockedAchievements.length}</div>
          <div className="text-sm text-muted-foreground">Available</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center shadow-card">
          <Star className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{achievements.length}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : achievements.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Achievements Yet</h3>
          <p className="text-muted-foreground">
            Start learning to unlock your first achievement!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Earned Achievements */}
          {earnedAchievements.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Earned Badges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {earnedAchievements.map((achievement) => (
                  <div key={achievement.id} className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <achievement.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          Earned {achievement.earnedDate ? new Date(achievement.earnedDate).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Available Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement) => (
                  <div key={achievement.id} className="bg-card rounded-xl border border-border p-6 shadow-card opacity-60">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <achievement.icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-muted-foreground">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground">Not earned yet</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentAchievements;