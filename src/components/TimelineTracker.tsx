import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Complaint } from '@/types';

interface TimelineTrackerProps {
  complaint: Complaint;
}

export const TimelineTracker = ({ complaint }: TimelineTrackerProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimelineItems = () => {
    const items = [
      {
        status: 'submitted',
        label: 'Complaint Submitted',
        date: complaint.createdAt,
        icon: <Calendar className="w-4 h-4" />,
        completed: true,
      },
    ];

    if (complaint.inProgressAt) {
      items.push({
        status: 'in-progress',
        label: 'Work In Progress',
        date: complaint.inProgressAt,
        icon: <AlertCircle className="w-4 h-4" />,
        completed: true,
      });
    }

    if (complaint.completedAt) {
      items.push({
        status: 'resolved',
        label: 'Issue Resolved',
        date: complaint.completedAt,
        icon: <CheckCircle className="w-4 h-4" />,
        completed: true,
      });
    }

    return items;
  };

  const timelineItems = getTimelineItems();

  const calculateDuration = () => {
    if (!complaint.completedAt) return null;
    
    const start = new Date(complaint.createdAt);
    const end = new Date(complaint.completedAt);
    const diffInHours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    const days = Math.floor(diffInHours / 24);
    const hours = diffInHours % 24;
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  };

  return (
    <div className="bg-gradient-card p-4 rounded-lg border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground">Timeline</h4>
        {complaint.status === 'resolved' && (
          <div className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
            Completed in {calculateDuration()}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {timelineItems.map((item, index) => (
          <div key={item.status} className="flex items-start space-x-3">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center border-2
              ${item.completed 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'bg-background border-muted-foreground text-muted-foreground'
              }
            `}>
              {item.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${
                  item.completed ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.date)}
                </span>
              </div>
              
              {index < timelineItems.length - 1 && (
                <div className="w-px h-6 bg-border ml-4 mt-2" />
              )}
            </div>
          </div>
        ))}
      </div>

      {complaint.status === 'pending' && (
        <div className="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-warning" />
            <p className="text-sm text-warning font-medium">
              Awaiting department review
            </p>
          </div>
        </div>
      )}
    </div>
  );
};