export const formatSalary = (salary: any): string => {
  if (!salary) return 'Not specified';
  
  if (typeof salary === 'string') return salary;
  
  if (typeof salary === 'object' && 'min' in salary && 'max' in salary) {
    // Handle min and max being zero
    if (salary.min === 0 && salary.max === 0) return 'Not specified';
    
    // Handle only min being specified
    if (salary.min > 0 && salary.max === 0) 
      return `${salary.min.toLocaleString()} ${salary.currency || ''}`.trim();
    
    // Handle only max being specified
    if (salary.min === 0 && salary.max > 0) 
      return `Up to ${salary.max.toLocaleString()} ${salary.currency || ''}`.trim();
    
    // Handle both specified
    return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency || ''}`.trim();
  }
  
  return 'Not specified';
};