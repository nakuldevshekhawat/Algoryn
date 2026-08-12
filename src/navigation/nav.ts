import { Home, Search, BarChart2, Calendar, Map, List, Repeat, Star, FileText, BarChart, Video } from 'lucide-react';

export const globalItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/progress', label: 'Progress', icon: BarChart2 }
];

export const dsaItems = [
  { path: '/dsa/roadmap', label: 'Roadmap', icon: Map },
  { path: '/dsa/problems', label: 'Problems', icon: List },
  { path: '/dsa/revision', label: 'Revision', icon: Repeat },
  { path: '/dsa/favorites', label: 'Favorites', icon: Star },
  { path: '/dsa/notes', label: 'Notes', icon: FileText },
  { path: '/dsa/statistics', label: 'Statistics', icon: BarChart }
];

export const dsItems = [
  { path: '/data-science/lectures', label: 'Lectures', icon: Video }
];
