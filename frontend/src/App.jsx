import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { ArrowRight, ArrowUpDown, Clock, DollarSign, Shield, Zap, TrendingUp, Activity } from 'lucide-react'
import './App.css'

// Components
import Header from './components/Header'
import BridgeInterface from './components/BridgeInterface'
import RouteComparison from './components/RouteComparison'
import TransactionHistory from './components/TransactionHistory'
import Analytics from './components/Analytics'

function App() {
  const [connectedWallet, setConnectedWallet] = useState(null)
  const [bridgeRoutes, setBridgeRoutes] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock data for development
  const mockRoutes = [
    {
      protocol: 'stargate',
      name: 'Stargate Finance',
      fee: '0.06%',
      estimatedTime: '5 min',
      gasEstimate: '$12.50',
      confidence: 95,
      totalFee: '$6.50',
      amountOut: '993.50',
      score: 92.5
    },
    {
      protocol: 'hop',
      name: 'Hop Protocol',
      fee: '0.04%',
      estimatedTime: '4 min',
      gasEstimate: '$8.20',
      confidence: 92,
      totalFee: '$4.80',
      amountOut: '995.20',
      score: 94.2
    },
    {
      protocol: 'across',
      name: 'Across Protocol',
      fee: '0.03%',
      estimatedTime: '3 min',
      gasEstimate: '$6.80',
      confidence: 88,
      totalFee: '$3.80',
      amountOut: '996.20',
      score: 96.1
    }
  ]

  const connectWallet = async () => {
    // Mock wallet connection
    setConnectedWallet('0x1234...5678')
  }

  const disconnectWallet = () => {
    setConnectedWallet(null)
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header 
          connectedWallet={connectedWallet}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Bridge Aggregator
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Find the best routes across all major bridges. Save on fees, reduce time, maximize security.
                  </p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">$12.5M</div>
                        <div className="text-sm text-muted-foreground">Total Volume</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">2,847</div>
                        <div className="text-sm text-muted-foreground">Active Users</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">5</div>
                        <div className="text-sm text-muted-foreground">Bridge Protocols</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">0.05%</div>
                        <div className="text-sm text-muted-foreground">Platform Fee</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Main Bridge Interface */}
                <BridgeInterface 
                  connectedWallet={connectedWallet}
                  onConnect={connectWallet}
                  routes={mockRoutes}
                />

                {/* Features Section */}
                <div className="grid md:grid-cols-3 gap-6 mt-16">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Best Rates
                      </CardTitle>
                      <CardDescription>
                        Compare rates across all major bridges to find the most cost-effective route
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        Fastest Routes
                      </CardTitle>
                      <CardDescription>
                        Optimize for speed with real-time bridge performance monitoring
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Maximum Security
                      </CardTitle>
                      <CardDescription>
                        Choose the most secure bridges with confidence scores and risk assessment
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            } />
            
            <Route path="/history" element={
              <TransactionHistory connectedWallet={connectedWallet} />
            } />
            
            <Route path="/analytics" element={
              <Analytics />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

