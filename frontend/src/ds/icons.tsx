import type { CSSProperties } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  Activity01Icon,
  BookOpen01Icon,
  PaintBoardIcon,
  Add01Icon,
  Alert02Icon,
  AlertCircleIcon,
  AnalyticsUpIcon,
  ArrowDown01Icon,
  ArrowDown02Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  Briefcase01Icon,
  Building03Icon,
  Building06Icon,
  CalculatorIcon,
  Calendar03Icon,
  Cancel01Icon,
  CancelCircleIcon,
  Certificate01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  ComputerIcon,
  Copy01Icon,
  DashboardSquare01Icon,
  Database01Icon,
  Delete02Icon,
  Download04Icon,
  File02Icon,
  FileValidationIcon,
  FileVerifiedIcon,
  FilterHorizontalIcon,
  FilterIcon,
  FlashIcon,
  FolderAddIcon,
  FolderOpenIcon,
  InboxIcon,
  InformationCircleIcon,
  Layers01Icon,
  LegalDocument01Icon,
  Loading03Icon,
  Logout03Icon,
  Mail01Icon,
  Menu01Icon,
  Moon02Icon,
  Notification03Icon,
  PencilEdit02Icon,
  PowerServiceIcon,
  PrinterIcon,
  QrCodeIcon,
  RefreshIcon,
  Search01Icon,
  SecurityBlockIcon,
  SecurityCheckIcon,
  SentIcon,
  Settings01Icon,
  Shield01Icon,
  SidebarRight01Icon,
  SidebarRightIcon,
  SquareLock02Icon,
  Sun03Icon,
  TaskDone01Icon,
  Tick02Icon,
  UserIcon,
  UserMultipleIcon,
  ViewIcon,
  ViewOffSlashIcon,
  WorkHistoryIcon,
  Wrench01Icon,
  Xls02Icon,
} from '@hugeicons/core-free-icons';

/*
 * Ícones do NeoFluxo: Hugeicons (traço arredondado, versão gratuita, MIT), escolhido por Mateus em 23/10.
 * Os nomes são os mesmos que o app já usava (vindos do Lucide), pra troca ser só a linha do import.
 * Ícone novo entra AQUI, com nome do papel dele; nenhuma tela importa de biblioteca de ícone direto.
 * Tamanho pelo className (h-4 w-4 = 16 px, h-5 w-5 = 20 px); traço 1,75; cor = currentColor.
 */

export interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  style?: CSSProperties;
  /** herdado do Lucide; o Hugeicons gratuito é só traço, então é ignorado */
  fill?: string;
}

function cria(icon: IconSvgElement) {
  return function Icone({ className, size = 24, strokeWidth = 1.75, style }: IconProps) {
    return <HugeiconsIcon icon={icon} size={size} strokeWidth={strokeWidth} color="currentColor" className={className} style={style} aria-hidden />;
  };
}

export const Activity = cria(Activity01Icon);
export const AlertCircle = cria(AlertCircleIcon);
export const AlertTriangle = cria(Alert02Icon);
export const ArrowDown = cria(ArrowDown02Icon);
export const ArrowLeft = cria(ArrowLeft02Icon);
export const ArrowRight = cria(ArrowRight02Icon);
export const ArrowUpRight = cria(ArrowUpRight01Icon);
export const Bell = cria(Notification03Icon);
export const Briefcase = cria(Briefcase01Icon);
export const Building = cria(Building03Icon);
export const Building2 = cria(Building06Icon);
export const Calculator = cria(CalculatorIcon);
export const Calendar = cria(Calendar03Icon);
export const Check = cria(Tick02Icon);
export const CheckCircle2 = cria(CheckmarkCircle02Icon);
export const ChevronDown = cria(ArrowDown01Icon);
export const ChevronRight = cria(ArrowRight01Icon);
export const ChevronUp = cria(ArrowUp01Icon);
export const ClipboardCheck = cria(TaskDone01Icon);
export const Clock = cria(Clock01Icon);
export const Copy = cria(Copy01Icon);
export const Database = cria(Database01Icon);
export const Download = cria(Download04Icon);
export const Edit2 = cria(PencilEdit02Icon);
export const FileBadge = cria(Certificate01Icon);
export const FileCheck = cria(FileValidationIcon);
export const FileCheck2 = cria(FileVerifiedIcon);
export const FileSpreadsheet = cria(Xls02Icon);
export const FileText = cria(File02Icon);
export const Filter = cria(FilterIcon);
export const FolderOpen = cria(FolderOpenIcon);
export const FolderPlus = cria(FolderAddIcon);
export const History = cria(WorkHistoryIcon);
export const Inbox = cria(InboxIcon);
export const Info = cria(InformationCircleIcon);
export const Layers = cria(Layers01Icon);
export const LayoutDashboard = cria(DashboardSquare01Icon);
export const Loader2 = cria(Loading03Icon);
export const Lock = cria(SquareLock02Icon);
export const LogOut = cria(Logout03Icon);
export const Mail = cria(Mail01Icon);
export const Menu = cria(Menu01Icon);
export const Monitor = cria(ComputerIcon);
export const Moon = cria(Moon02Icon);
export const PanelRightClose = cria(SidebarRight01Icon);
export const PanelRightOpen = cria(SidebarRightIcon);
export const Plus = cria(Add01Icon);
export const Power = cria(PowerServiceIcon);
export const Printer = cria(PrinterIcon);
export const QrCode = cria(QrCodeIcon);
export const RefreshCw = cria(RefreshIcon);
export const ScrollText = cria(LegalDocument01Icon);
export const Search = cria(Search01Icon);
export const Send = cria(SentIcon);
export const Settings = cria(Settings01Icon);
export const Settings2 = cria(FilterHorizontalIcon);
export const Shield = cria(Shield01Icon);
export const ShieldAlert = cria(SecurityBlockIcon);
export const ShieldCheck = cria(SecurityCheckIcon);
export const Sun = cria(Sun03Icon);
export const Trash2 = cria(Delete02Icon);
export const TrendingUp = cria(AnalyticsUpIcon);
export const User = cria(UserIcon);
export const Users = cria(UserMultipleIcon);
export const Wrench = cria(Wrench01Icon);
export const X = cria(Cancel01Icon);
export const XCircle = cria(CancelCircleIcon);
export const Zap = cria(FlashIcon);
export const Eye = cria(ViewIcon);
export const EyeOff = cria(ViewOffSlashIcon);
export const Palette = cria(PaintBoardIcon);
export const BookOpen = cria(BookOpen01Icon);
