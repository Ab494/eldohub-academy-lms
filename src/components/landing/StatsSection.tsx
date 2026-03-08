import React, { useEffect, useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { adminAPI } from '@/lib/apiClient';

interface StatData {
  students: number | null;
  instructors: number | null;
  courses: number | null;
  satisfaction: number | null;
}

const useCountUp = (end: number | null, duration = 1500, start = false) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!start || end === null) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * end));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, start]);

  return end === null ? null : count;
};

const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<StatData>({
    students: null,
    instructors: null,
    courses: null,
    satisfaction: null,
  });
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminAPI.getDashboardStats();
        const d = data?.data || data;
        setStats({
          students: d?.totalStudents ?? d?.activeStudents ?? null,
          instructors: d?.totalInstructors ?? null,
          courses: d?.totalCourses ?? null,
          satisfaction: d?.satisfactionRate ?? d?.averageRating ?? null,
        });
      } catch {
        // Keep nulls — will show "—"
      } finally {
        setLoading(false);
        setTimeout(() => setAnimate(true), 100);
      }
    };
    fetchStats();
  }, []);

  const studentsCount = useCountUp(stats.students, 1500, animate);
  const instructorsCount = useCountUp(stats.instructors, 1200, animate);
  const coursesCount = useCountUp(stats.courses, 1000, animate);
  const satisfactionCount = useCountUp(
    stats.satisfaction !== null ? Math.round(stats.satisfaction) : null,
    1300,
    animate
  );

  const items = [
    { value: studentsCount, label: 'Active Students', suffix: '' },
    { value: instructorsCount, label: 'Expert Instructors', suffix: '' },
    { value: coursesCount, label: 'Courses Available', suffix: '' },
    { value: satisfactionCount, label: 'Satisfaction Rate', suffix: '%' },
  ];

  return (
    <section className="py-12 gradient-dark">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <div key={i} className="text-center">
              {loading ? (
                <Skeleton className="h-10 w-20 mx-auto mb-1 bg-secondary/40" />
              ) : (
                <p className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                  {item.value !== null ? `${item.value.toLocaleString()}${item.suffix}` : '—'}
                </p>
              )}
              <p className="text-sm text-primary-foreground/70">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
