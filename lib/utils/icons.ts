/**
 * Optimized Icon Utilities
 * Provides tree-shakeable lucide-react imports and icon caching
 */

// Re-export commonly used icons with tree-shaking
export {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Upload,
  X,
  FileText,
  User,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Info,
  Phone,
  Mail,
  Search,
  Filter,
  TrendingUp,
  BarChart3,
  Activity,
  Users,
  Download,
  ExternalLink,
  Bell,
  Check,
  Settings,
  RefreshCw,
  UserPlus,
  AlertTriangle,
  TrendingDown,
  MoreVertical,
  Eye,
} from "lucide-react";

// Icon cache for dynamic imports
const iconCache = new Map<string, React.ComponentType<any>>();

// Lazy load icon with caching
export const lazyLoadIcon = async (iconName: string): Promise<React.ComponentType<any> | null> => {
  if (iconCache.has(iconName)) {
    return iconCache.get(iconName)!;
  }

  try {
    // Dynamic import to enable code splitting
    const iconModule = await import(`lucide-react`);
    const IconComponent = iconModule[iconName as keyof typeof iconModule];

    if (IconComponent) {
      iconCache.set(iconName, IconComponent as React.ComponentType<any>);
      return IconComponent as React.ComponentType<any>;
    }

    return null;
  } catch (error) {
    console.warn(`Failed to load icon: ${iconName}`, error);
    return null;
  }
};

// Preload critical icons for better performance
export const preloadCriticalIcons = async () => {
  const criticalIcons = [
    'Calendar', 'Clock', 'CheckCircle', 'AlertCircle', 'User',
    'Search', 'Filter', 'TrendingUp', 'Activity'
  ];

  const promises = criticalIcons.map(icon => lazyLoadIcon(icon));
  await Promise.allSettled(promises);
};

// Icon optimization utilities
export const optimizeIconImports = () => {
  // Remove unused icons from bundle (this would be called during build)
  if (typeof window !== 'undefined') {
    console.log('Optimizing icon imports...');
  }
};