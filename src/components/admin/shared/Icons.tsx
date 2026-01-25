import React from 'react';
import {
  Network,
  Zap,
  Cpu,
  Headset,
  Globe,
  Shield,
  Activity,
  Wifi,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  ChevronRight,
  Menu,
  X,
  Lock,
  ArrowRight,
  Linkedin,
  Facebook,
  Twitter,
  TowerControl,
  Construction,
  Signal,
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<IconProps> = ({ name, className, size = 24 }) => {
  switch (name) {
    case 'Engineering':
      return <Cpu className={className} size={size} />;
    case 'Networking':
      return <Network className={className} size={size} />;
    case 'Energy':
      return <Zap className={className} size={size} />;
    case 'Assistance':
      return <Headset className={className} size={size} />;
    case 'Vision':
      return <Globe className={className} size={size} />;
    case 'Mission':
      return <Activity className={className} size={size} />;
    case 'Values':
      return <Shield className={className} size={size} />;
    case 'Wifi':
      return <Wifi className={className} size={size} />;
    case 'Signal':
      return <Signal className={className} size={size} />;
    case 'Tower':
      return <TowerControl className={className} size={size} />;
    case 'Construction':
      return <Construction className={className} size={size} />;
    default:
      return <Wifi className={className} size={size} />;
  }
};

export * from 'lucide-react';
