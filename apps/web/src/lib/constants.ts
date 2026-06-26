import {
  BarChart3,
  Coins,
  CreditCard,
  Grid2X2,
  History,
  UserRound,
  Wallet,
} from "lucide-react";

export const appName = "CoinBarrier";

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Grid2X2 },
  { label: "Markets", href: "/markets", icon: BarChart3 },
  { label: "Trade", href: "/trade/btc", icon: Coins },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Transactions", href: "/transactions", icon: CreditCard },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: Grid2X2 },
  { label: "Users", href: "/admin/users", icon: UserRound },
  { label: "Coins", href: "/admin/coins", icon: Coins },
  { label: "Transactions", href: "/admin/transactions", icon: History },
];
