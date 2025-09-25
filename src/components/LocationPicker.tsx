import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface LocationPickerProps {
  onLocationChange: (location: string, gps?: { lat: number; lng: number }) => void;
}

export const LocationPicker = ({ onLocationChange }: LocationPickerProps) => {
  const [location, setLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Simulate reverse geocoding
          setTimeout(() => {
            const simulatedAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (GPS Location)`;
            setLocation(simulatedAddress);
            onLocationChange(simulatedAddress, { lat: latitude, lng: longitude });
            setIsGettingLocation(false);
            
            toast({
              title: "Location captured",
              description: "GPS coordinates have been recorded.",
            });
          }, 1000);
        },
        (error) => {
          setIsGettingLocation(false);
          toast({
            title: "Location error",
            description: "Unable to get your location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsGettingLocation(false);
      toast({
        title: "Location not supported",
        description: "Please enter your location manually.",
        variant: "destructive",
      });
    }
  };

  const handleManualLocation = (value: string) => {
    setLocation(value);
    onLocationChange(value);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Enter your location or address..."
          value={location}
          onChange={(e) => handleManualLocation(e.target.value)}
          className="pl-10 bg-background border-border/50 focus:border-primary"
        />
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={getCurrentLocation}
        disabled={isGettingLocation}
        className="w-full flex items-center space-x-2"
      >
        <Navigation className={`w-4 h-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
        <span>
          {isGettingLocation ? 'Getting GPS Location...' : 'Use Current Location (GPS)'}
        </span>
      </Button>
      
      {location && (
        <div className="bg-accent/20 p-2 rounded-lg">
          <p className="text-xs text-muted-foreground">Selected location:</p>
          <p className="text-sm font-medium">{location}</p>
        </div>
      )}
    </div>
  );
};