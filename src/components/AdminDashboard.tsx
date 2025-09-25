import { useState, useEffect } from 'react';
import { 
  LogOut, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  MapPin,
  Calendar,
  TrendingUp,
  Camera,
  MessageSquare,
  Upload,
  Car,
  Trash2,
  Zap,
  TreePine,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Analytics } from '@/components/Analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getComplaints, updateComplaintStatus } from '@/utils/storage';
import { Complaint, User } from '@/types';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [completionPhoto, setCompletionPhoto] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setComplaints(getComplaints());
  }, []);

  const handleStatusUpdate = (complaintId: string, newStatus: Complaint['status']) => {
    if (newStatus === 'resolved') {
      setSelectedComplaint(complaintId);
      setIsDialogOpen(true);
      return;
    }
    
    updateComplaintStatus(complaintId, newStatus);
    setComplaints(getComplaints());
    
    toast({
      title: "Status Updated",
      description: `Complaint status changed to ${newStatus.replace('-', ' ')}.`,
    });
  };

  const handleResolveWithPhoto = () => {
    if (!selectedComplaint) return;
    
    let photoData = '';
    if (completionPhoto) {
      // Convert file to base64 for localStorage
      const reader = new FileReader();
      reader.onload = () => {
        photoData = reader.result as string;
        updateComplaintStatus(selectedComplaint, 'resolved', photoData);
        setComplaints(getComplaints());
        
        // Simulate SMS notification
        toast({
          title: "Work Completed!",
          description: "Complaint resolved with photo. SMS notification sent to citizen.",
        });
        
        setIsDialogOpen(false);
        setSelectedComplaint(null);
        setCompletionPhoto(null);
      };
      reader.readAsDataURL(completionPhoto);
    } else {
      updateComplaintStatus(selectedComplaint, 'resolved');
      setComplaints(getComplaints());
      
      toast({
        title: "Work Completed!",
        description: "Complaint resolved. SMS notification sent to citizen.",
      });
      
      setIsDialogOpen(false);
      setSelectedComplaint(null);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCompletionPhoto(e.target.files[0]);
    }
  };

  const filteredComplaints = complaints.filter(complaint => 
    filter === 'all' || complaint.status === filter
  );

  const getStatusStats = () => {
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      inProgress: complaints.filter(c => c.status === 'in-progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
    };
    return stats;
  };

  const getDepartmentStats = () => {
    const departments: Record<string, number> = {};
    complaints.forEach(complaint => {
      departments[complaint.department] = (departments[complaint.department] || 0) + 1;
    });
    return Object.entries(departments).map(([name, count]) => ({ name, count }));
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'Road & Transport':
        return <Car className="w-5 h-5" />;
      case 'Sanitation & Drainage':
        return <Trash2 className="w-5 h-5" />;
      case 'Electricity & Lighting':
        return <Zap className="w-5 h-5" />;
      case 'Environment':
        return <TreePine className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getComplaintsByDepartment = (department: string) => {
    return complaints.filter(c => c.department === department);
  };

  const getStatusIcon = (status: Complaint['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: Complaint['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'in-progress':
        return 'default';
      case 'resolved':
        return 'destructive';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTimeToComplete = (createdAt: string, completedAt?: string) => {
    if (!completedAt) return null;
    
    const created = new Date(createdAt);
    const completed = new Date(completedAt);
    const diffInMs = completed.getTime() - created.getTime();
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays}d ${diffInHours % 24}h`;
    }
    return `${diffInHours}h`;
  };

  const stats = getStatusStats();
  const departmentStats = getDepartmentStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent">
      {/* Header */}
      <header className="bg-gradient-card shadow-custom-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">CitizenConnect Management Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">ID: {user.workId}</p>
              </div>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Complaints</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-success">{stats.resolved}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="Road & Transport" className="flex items-center space-x-1">
              <Car className="w-4 h-4" />
              <span>Transport</span>
            </TabsTrigger>
            <TabsTrigger value="Sanitation & Drainage" className="flex items-center space-x-1">
              <Trash2 className="w-4 h-4" />
              <span>Sanitation</span>
            </TabsTrigger>
            <TabsTrigger value="Electricity & Lighting" className="flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>Electricity</span>
            </TabsTrigger>
            <TabsTrigger value="Environment" className="flex items-center space-x-1">
              <TreePine className="w-4 h-4" />
              <span>Environment</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-1">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary" />
                      All Complaints
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                      {complaints.length > 0 ? (
                        complaints.map((complaint) => (
                          <Card key={complaint.id} className="border-border/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-foreground">{complaint.title}</h4>
                                  <p className="text-sm text-muted-foreground">ID: {complaint.id}</p>
                                </div>
                                <Badge variant={getStatusVariant(complaint.status)} className="flex items-center space-x-1">
                                  {getStatusIcon(complaint.status)}
                                  <span className="capitalize">{complaint.status.replace('-', ' ')}</span>
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {complaint.description}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                <div className="flex items-center space-x-4">
                                  <span className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {complaint.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(complaint.createdAt)}
                                  </span>
                                  {complaint.completedAt && (
                                    <span className="flex items-center text-success">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Completed: {formatDate(complaint.completedAt)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1">
                                  {getDepartmentIcon(complaint.department)}
                                  <span>{complaint.department}</span>
                                </div>
                              </div>
                              
                              {complaint.status === 'resolved' && complaint.completedAt && (
                                <div className="mb-3 p-2 bg-success/10 rounded-lg border border-success/20">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-success font-medium">
                                      Timeline: {calculateTimeToComplete(complaint.createdAt, complaint.completedAt)} to complete
                                    </span>
                                    {complaint.completionPhoto && (
                                      <div className="flex items-center space-x-1 text-success">
                                        <Camera className="w-3 h-3" />
                                        <span>Photo attached</span>
                                      </div>
                                    )}
                                  </div>
                                  {complaint.completionPhoto && (
                                    <div className="mt-2">
                                      <img 
                                        src={complaint.completionPhoto} 
                                        alt="Completion photo" 
                                        className="w-16 h-16 object-cover rounded border"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(complaint.id, 'in-progress')}
                                  disabled={complaint.status === 'in-progress' || complaint.status === 'resolved'}
                                >
                                  Mark In Progress
                                </Button>
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleStatusUpdate(complaint.id, 'resolved')}
                                  disabled={complaint.status === 'resolved'}
                                  className="flex items-center space-x-1"
                                >
                                  <Camera className="w-3 h-3" />
                                  <span>Complete Work</span>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No complaints found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Quick Stats Sidebar */}
              <div className="space-y-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                      Department Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {departmentStats.map((dept) => (
                        <div key={dept.name} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{dept.name}</span>
                          <Badge variant="outline">{dept.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Department Specific Tabs */}
          {['Road & Transport', 'Sanitation & Drainage', 'Electricity & Lighting', 'Environment'].map((dept) => (
            <TabsContent key={dept} value={dept}>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getDepartmentIcon(dept)}
                    <span className="ml-2">{dept} Complaints</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {getComplaintsByDepartment(dept).map((complaint) => (
                      <Card key={complaint.id} className="border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-foreground">{complaint.title}</h4>
                              <p className="text-sm text-muted-foreground">ID: {complaint.id}</p>
                            </div>
                            <Badge variant={getStatusVariant(complaint.status)} className="flex items-center space-x-1">
                              {getStatusIcon(complaint.status)}
                              <span className="capitalize">{complaint.status.replace('-', ' ')}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(complaint.id, 'in-progress')}
                              disabled={complaint.status === 'in-progress' || complaint.status === 'resolved'}
                            >
                              Mark In Progress
                            </Button>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleStatusUpdate(complaint.id, 'resolved')}
                              disabled={complaint.status === 'resolved'}
                              className="flex items-center space-x-1"
                            >
                              <Camera className="w-3 h-3" />
                              <span>Complete Work</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
        </Tabs>
      </div>

      {/* Completion Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>Complete Work</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="completion-photo" className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>Upload Completion Photo (Optional)</span>
              </Label>
              <Input
                id="completion-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="cursor-pointer"
              />
              {completionPhoto && (
                <p className="text-sm text-muted-foreground">
                  Selected: {completionPhoto.name}
                </p>
              )}
            </div>
            
            <div className="bg-accent/20 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="font-medium">SMS will be sent to citizen upon completion</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Notification will include completion details and photo (if uploaded)
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleResolveWithPhoto} className="flex-1">
              Complete & Notify
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};