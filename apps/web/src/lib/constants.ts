import {
  BarChart3,
  Coins,
  CreditCard,
  Grid2X2,
  History,
  Settings,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";

export const appName = "CoinBarrier";

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Grid2X2 },
  { label: "Markets", href: "/markets", icon: BarChart3 },
  { label: "Trade", href: "/trade/BTC-USDT", icon: Coins },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Transactions", href: "/transactions", icon: CreditCard },
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Settings", href: "/profile", icon: Settings },
];

export const adminNavItems = [
  { label: "Dashboard", href: "/admin/users", icon: Grid2X2 },
  { label: "Users", href: "/admin/users", icon: UserRound },
  { label: "Coins", href: "/admin/coins", icon: Coins },
  { label: "Transactions", href: "/admin/transactions", icon: History },
  { label: "KYC", href: "/admin/users", icon: ShieldCheck },
];
