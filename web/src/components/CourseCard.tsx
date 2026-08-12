import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';

interface CourseCardProps {
  title: string;
  description: string;
  progress: number;
  total: number;
  icon: React.ReactNode;
  colorClass: string;
  onClick?: () => void;
}

export const CourseCard = ({ title, description, progress, total, icon, colorClass, onClick }: CourseCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-soft hover:-translate-y-1 ${onClick ? '' : 'pointer-events-none'}`}
      {...(onClick ? { onClick } : {})}
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-theme-text mb-2">{title}</h3>
      <p className="text-sm text-theme-muted mb-6">{description}</p>
      
      <ProgressBar progress={progress} total={total} />
    </Card>
  );
};
