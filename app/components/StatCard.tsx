import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendIcon?: LucideIcon;
  bgColor?: string;
  iconBgColor?: string;
  textColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendIcon: TrendIcon,
  bgColor = 'from-gray-50 to-gray-100',
  iconBgColor = 'bg-gray-500',
  textColor = 'text-gray-900',
}: StatCardProps) {
  return (
    <Card className={`p-6 bg-gradient-to-br ${bgColor} border-gray-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
          <p className={`text-2xl font-bold ${textColor} mt-2`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && TrendIcon && (
        <div className={`flex items-center gap-1 mt-4 text-sm ${textColor} opacity-80`}>
          <TrendIcon className="w-4 h-4" />
          <span>{trend}</span>
        </div>
      )}
    </Card>
  );
}
