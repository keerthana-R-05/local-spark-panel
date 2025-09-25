export const assignDepartment = (description: string): string => {
  const keywords = {
    'Road & Transport': ['pothole', 'traffic', 'accident', 'road', 'street', 'sidewalk', 'bridge', 'parking', 'signal', 'sign', 'bike lane', 'transport', 'bus'],
    'Sanitation & Drainage': ['trash', 'garbage', 'drainage', 'sewer', 'waste', 'recycling', 'bin', 'cleanup', 'litter', 'water', 'flood'],
    'Electricity & Lighting': ['electricity', 'streetlight', 'outage', 'power', 'lighting', 'bulb', 'cable', 'wire'],
    'Environment': ['tree', 'pollution', 'green', 'park', 'playground', 'grass', 'garden', 'environment', 'air quality'],
    'Others': []
  };

  const lowerDescription = description.toLowerCase();
  
  for (const [department, words] of Object.entries(keywords)) {
    if (words.some(word => lowerDescription.includes(word))) {
      return department;
    }
  }
  
  return 'Others';
};