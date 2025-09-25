import { BarChart3, TrendingUp, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getComplaints } from '@/utils/storage';
import { useMemo } from 'react';

export const Analytics = () => {
  const complaints = getComplaints();

  const analytics = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in-progress').length;

    // Department breakdown
    const departmentStats = complaints.reduce((acc, complaint) => {
      acc[complaint.department] = (acc[complaint.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average resolution time
    const resolvedComplaints = complaints.filter(c => c.completedAt);
    const avgResolutionTime = resolvedComplaints.length > 0 
      ? resolvedComplaints.reduce((sum, complaint) => {
          const start = new Date(complaint.createdAt);
          const end = new Date(complaint.completedAt!);
          return sum + (end.getTime() - start.getTime());
        }, 0) / resolvedComplaints.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      total,
      resolved,
      pending,
      inProgress,
      departmentStats: Object.entries(departmentStats),
      avgResolutionHours: Math.round(avgResolutionTime),
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    };
  }, [complaints]);

  const mockChartData = [
    { name: 'Road & Transport', value: analytics.departmentStats.find(([name]) => name === 'Road & Transport')?.[1] || 0 },
    { name: 'Sanitation & Drainage', value: analytics.departmentStats.find(([name]) => name === 'Sanitation & Drainage')?.[1] || 0 },
    { name: 'Electricity & Lighting', value: analytics.departmentStats.find(([name]) => name === 'Electricity & Lighting')?.[1] || 0 },
    { name: 'Environment', value: analytics.departmentStats.find(([name]) => name === 'Environment')?.[1] || 0 },
    { name: 'Others', value: analytics.departmentStats.find(([name]) => name === 'Others')?.[1] || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-foreground">{analytics.total}</p>
                <p className="text-xs text-muted-foreground">Total Issues</p>
              </div>
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-success">{analytics.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-primary">{analytics.resolutionRate}%</p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-warning">{analytics.avgResolutionHours}h</p>
                <p className="text-xs text-muted-foreground">Avg Resolution</p>
              </div>
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Issues by Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockChartData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ 
                      backgroundColor: `hsl(${(index * 72) % 360}, 70%, 50%)` 
                    }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="h-2 bg-primary rounded-full"
                    style={{ 
                      width: `${Math.max(item.value * 20, 4)}px`,
                      backgroundColor: `hsl(${(index * 72) % 360}, 70%, 50%)` 
                    }}
                  />
                  <Badge variant="outline">{item.value}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Heatmap Placeholder */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary" />
            Issue Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gradient-to-br from-primary/20 to-accent rounded-lg flex items-center justify-center border border-border/50">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Interactive map visualization</p>
              <p className="text-xs text-muted-foreground">Showing complaint density by location</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};