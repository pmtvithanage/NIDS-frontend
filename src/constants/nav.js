/**
 * Sidebar navigation items.
 * @module constants/nav
 */

import {
  BarChart3,
  Brain,
  Cpu,
  FileText,
  Filter,
  LayoutDashboard,
  Radio,
  Settings,
  ShieldAlert,
  Tag,
} from 'lucide-react'

/** @type {ReadonlyArray<{to:string, label:string, icon:Function, end?:boolean}>} */
export const NAV_ITEMS = Object.freeze([
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/alerts', label: 'Live alerts', icon: Radio },
  { to: '/incidents', label: 'Incidents', icon: ShieldAlert },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/models', label: 'Model insights', icon: Brain },
  { to: '/labeling', label: 'Labeling queue', icon: Tag },
  { to: '/suppressions', label: 'Suppressions', icon: Filter },
  { to: '/sensors', label: 'Sensors', icon: Cpu },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
])
