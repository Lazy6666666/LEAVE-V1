/**
 * Consolidated Lucide React Icons Component
 * Provides optimized imports for commonly used icons
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';

// Icon interface for consistency
interface IconProps extends React.HTMLAttributes<SVGElement> {
  size?: number | string;
  className?: string;
}

// Create optimized icon components
export const ArrowLeft = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.ArrowLeft {...props} ref={ref} />
));

export const ArrowRight = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.ArrowRight {...props} ref={ref} />
));

export const Calendar = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.Calendar {...props} ref={ref} />
));

export const Check = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.Check {...props} ref={ref} />
));

export const CheckCircle = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.CheckCircle {...props} ref={ref} />
));

export const CheckCircle2 = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.CheckCircle2 {...props} ref={ref} />
));

export const Upload = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.Upload {...props} ref={ref} />
));

export const X = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.X {...props} ref={ref} />
));

export const FileText = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.FileText {...props} ref={ref} />
));

export const User = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.User {...props} ref={ref} />
));

export const AlertCircle = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.AlertCircle {...props} ref={ref} />
));

export const Clock = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.Clock {...props} ref={ref} />
));

export const Loader2 = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.Loader2 {...props} ref={ref} />
));

export const Info = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.Info {...props} ref={ref} />
));

export const Phone = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.Phone {...props} ref={ref} />
));

export const Mail = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.Mail {...props} ref={ref} />
));

export const Search = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.Search {...props} ref={ref} />
));

export const Filter = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.Filter {...props} ref={ref} />
));

export const Bell = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.Bell {...props} ref={ref} />
));

export const Settings = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <LucideIcons.Settings {...props} ref={ref} />
));

// Export display names for convenience
ArrowLeft.displayName = 'ArrowLeft';
ArrowRight.displayName = 'ArrowRight';
Calendar.displayName = 'Calendar';
Check.displayName = 'Check';
CheckCircle.displayName = 'CheckCircle';
CheckCircle2.displayName = 'CheckCircle2';
Upload.displayName = 'Upload';
X.displayName = 'X';
FileText.displayName = 'FileText';
User.displayName = 'User';
AlertCircle.displayName = 'AlertCircle';
Clock.displayName = 'Clock';
Loader2.displayName = 'Loader2';
Info.displayName = 'Info';
Phone.displayName = 'Phone';
Mail.displayName = 'Mail';
Search.displayName = 'Search';
Filter.displayName = 'Filter';
Bell.displayName = 'Bell';
Settings.displayName = 'Settings';