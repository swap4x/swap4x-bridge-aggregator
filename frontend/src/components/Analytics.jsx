import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  ArrowUpDown,
  Clock,
  Shield
} from 'lucide-react'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d')

  // Mock analytics data
  const volumeData = [
    { date: '2024-01-09', volume: 1200000, transactions: 45 },
    { date: '2024-01-10', volume: 1800000, transactions: 67 },
    { date: '2024-01-11', volume: 2100000, transactions: 78 },
    { date: '2024-01-12', volume: 1600000, transactions: 56 },
    { date: '2024-01-13', volume: 2400000, transactions: 89 },
    { date: '2024-01-14', volume: 2800000, transactions: 102 },
    { date: '2024-01-15', volume: 3200000, transactions: 118 }
  ]

  const protocolData = [
    { name: 'Stargate', volume: 4200000, share: 35, color: '#3B82F6' },
    { name: 'Hop Protocol', volume: 3600000, share: 30, color: '#10B981' },
    { name: 'Across', volume: 2400000, share: 20, color: '#F59E0B' },
    { name: 'Synapse', volume: 1200000, share: 10, color: '#EF4444' },
    { name: 'Multichain', volume: 600000, share: 5, color: '#8B5CF6' }
  ]

  const chainData = [
    { name: 'Ethereum', volume: 5400000, transactions: 198 },
    { name: 'Polygon', volume: 3200000, transactions: 145 },
    { name: 'Arbitrum', volume: 2100000, transactions: 89 },
    { name: 'Optimism', volume: 1300000, transactions: 67 }
  ]

  const performanceData = [
    { protocol: 'Across', avgTime: 180, avgFee: 0.03, reliability: 98 },
    { protocol: 'Hop', avgTime: 240, avgFee: 0.04, reliability: 96 },
    { protocol: 'Stargate', avgTime: 300, avgFee: 0.06, reliability: 99 },
    { protocol: 'Synapse', avgTime: 360, avgFee: 0.05, reliability: 94 },
    { protocol: 'Multichain', avgTime: 600, avgFee: 0.08, reliability: 92 }
  ]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    return `${Math.round(seconds / 60)}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Platform Analytics
          </CardTitle>
          <CardDescription>
            Real-time insights into bridge performance and usage
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Volume</span>
            </div>
            <div className="text-2xl font-bold">$12.5M</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +23.5% vs last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Active Users</span>
            </div>
            <div className="text-2xl font-bold">2,847</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.3% vs last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Transactions</span>
            </div>
            <div className="text-2xl font-bold">8,456</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +18.7% vs last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Avg Time</span>
            </div>
            <div className="text-2xl font-bold">4.2m</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              -8.5% vs last week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="volume" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="chains">Chains</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Volume & Transactions</CardTitle>
              <CardDescription>
                Bridge volume and transaction count over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      yAxisId="volume"
                      orientation="left"
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    />
                    <YAxis 
                      yAxisId="transactions"
                      orientation="right"
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'volume' ? formatCurrency(value) : value,
                        name === 'volume' ? 'Volume' : 'Transactions'
                      ]}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Bar yAxisId="volume" dataKey="volume" fill="#3B82F6" />
                    <Bar yAxisId="transactions" dataKey="transactions" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Protocol Market Share</CardTitle>
                <CardDescription>
                  Volume distribution across bridge protocols
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={protocolData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="share"
                        label={({ name, share }) => `${name} ${share}%`}
                      >
                        {protocolData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Market Share']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Protocol Volume</CardTitle>
                <CardDescription>
                  Total volume by protocol (7 days)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {protocolData.map((protocol) => (
                    <div key={protocol.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: protocol.color }}
                        />
                        <span className="font-medium">{protocol.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(protocol.volume)}</div>
                        <div className="text-sm text-muted-foreground">{protocol.share}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chain Activity</CardTitle>
              <CardDescription>
                Volume and transaction count by blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chainData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'volume' ? formatCurrency(value) : value,
                        name === 'volume' ? 'Volume' : 'Transactions'
                      ]}
                    />
                    <Bar dataKey="volume" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Protocol Performance</CardTitle>
              <CardDescription>
                Average completion time, fees, and reliability by protocol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((protocol) => (
                  <div key={protocol.protocol} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{protocol.protocol}</h4>
                      <Badge 
                        variant={protocol.reliability >= 95 ? "default" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        <Shield className="h-3 w-3" />
                        {protocol.reliability}% Reliable
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Avg Time</div>
                        <div className="font-medium">{formatTime(protocol.avgTime)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Fee</div>
                        <div className="font-medium">{protocol.avgFee}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Success Rate</div>
                        <div className="font-medium">{protocol.reliability}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Analytics

