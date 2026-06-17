export const chartData = [
  { name: "06:00", value: 68200, volume: 28 },
  { name: "07:30", value: 68480, volume: 42 },
  { name: "09:00", value: 68620, volume: 35 },
  { name: "10:30", value: 69080, volume: 64 },
  { name: "12:00", value: 68690, volume: 31 },
  { name: "13:30", value: 68742, volume: 45 },
];

export const miniChart = [
  { value: 20 },
  { value: 25 },
  { value: 23 },
  { value: 31 },
  { value: 29 },
  { value: 39 },
  { value: 35 },
  { value: 44 },
];

export const assets = [
  { name: "Bitcoin", symbol: "BTC", price: 68742.31, change: 2.45, balance: 26145.28, color: "bg-amber-400" },
  { name: "Ethereum", symbol: "ETH", price: 3721.41, change: 1.86, balance: 13235.48, color: "bg-blue-400" },
  { name: "Tether", symbol: "USDT", price: 1, change: 0.01, balance: 2460.56, color: "bg-teal-400" },
  { name: "BNB", symbol: "BNB", price: 589.27, change: -0.74, balance: 4267.19, color: "bg-yellow-400" },
  { name: "Solana", symbol: "SOL", price: 164.35, change: 4.32, balance: 6637.21, color: "bg-fuchsia-500" },
  { name: "XRP", symbol: "XRP", price: 0.6124, change: -1.23, balance: 1204.2, color: "bg-zinc-200" },
  { name: "USDC", symbol: "USDC", price: 1, change: -0.01, balance: 2460.56, color: "bg-sky-500" },
  { name: "Avalanche", symbol: "AVAX", price: 35.62, change: 2.08, balance: 992.1, color: "bg-red-500" },
];

export const transactions = [
  { type: "Deposit", asset: "Bitcoin", symbol: "BTC", amount: "+0.250000 BTC", usd: "$16,852.75", status: "Completed", date: "May 31, 2025 09:42 AM" },
  { type: "Withdrawal", asset: "Ethereum", symbol: "ETH", amount: "-2.1500 ETH", usd: "$5,132.45", status: "Completed", date: "May 30, 2025 06:21 PM" },
  { type: "Buy", asset: "Solana", symbol: "SOL", amount: "+18.450 SOL", usd: "$2,986.34", status: "Completed", date: "May 30, 2025 01:15 PM" },
  { type: "Sell", asset: "BNB", symbol: "BNB", amount: "-4.250 BNB", usd: "$2,190.82", status: "Completed", date: "May 29, 2025 11:08 AM" },
  { type: "Transfer", asset: "XRP", symbol: "XRP", amount: "-250.00 XRP", usd: "$127.75", status: "Pending", date: "May 27, 2025 05:44 PM" },
];

export const users = [
  { name: "Alex Johnson", email: "alex.johnson@gmail.com", joined: "May 18, 2025", kyc: "Verified", volume: "$24,590.21", status: "Active" },
  { name: "Sarah Williams", email: "sarah.williams@gmail.com", joined: "May 18, 2025", kyc: "Pending", volume: "$8,320.44", status: "Active" },
  { name: "Michael Chen", email: "michael.chen@gmail.com", joined: "May 17, 2025", kyc: "Verified", volume: "$15,710.33", status: "Active" },
  { name: "Emily Davis", email: "emily.davis@gmail.com", joined: "May 17, 2025", kyc: "Rejected", volume: "$2,118.50", status: "Disabled" },
];
