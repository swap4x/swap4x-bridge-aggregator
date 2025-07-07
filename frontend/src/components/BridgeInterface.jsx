import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { ArrowRight, ArrowUpDown, Clock, DollarSign, Shield, Zap, RefreshCw, AlertTriangle } from 'lucide-react'
import RouteComparison from './RouteComparison'

const BridgeInterface = ({ connectedWallet, onConnect, routes }) => {
  const [fromChain, setFromChain] = useState('ethereum')
  const [toChain, setToChain] = useState('polygon')
  const [token, setToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  const [preference, setPreference] = useState('balanced')
  const [loading, setLoading] = useState(false)
  const [showRoutes, setShowRoutes] = useState(false)

  const chains = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
    { id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH' },
    { id: 'optimism', name: 'Optimism', symbol: 'ETH' }
  ]

  const tokens = [
    { id: 'USDC', name: 'USD Coin', symbol: 'USDC' },
    { id: 'USDT', name: 'Tether', symbol: 'USDT' },
    { id: 'ETH', name: 'Ethereum', symbol: 'ETH' },
    { id: 'WETH', name: 'Wrapped Ethereum', symbol: 'WETH' }
  ]

  const preferences = [
    { id: 'cheapest', name: 'Cheapest', icon: DollarSign, description: 'Minimize fees' },
    { id: 'fastest', name: 'Fastest', icon: Zap, description: 'Minimize time' },
    { id: 'safest', name: 'Safest', icon: Shield, description: 'Maximum security' },
    { id: 'balanced', name: 'Balanced', icon: ArrowUpDown, description: 'Best overall' }
  ]

  const handleSwapChains = () => {
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
  }

  const handleGetRoutes = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setShowRoutes(true)
    }, 1500)
  }

  const handleExecuteBridge = (route) => {
    if (!connectedWallet) {
      onConnect()
      return
    }
    
    // Simulate bridge execution
    alert(`Executing bridge via ${route.name}...`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Bridge Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Bridge Assets
          </CardTitle>
          <CardDescription>
            Compare routes across all major bridges and execute with one click
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Chain */}
          <div className="space-y-2">
            <Label htmlFor="from-chain">From</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={fromChain} onValueChange={setFromChain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={token} onValueChange={setToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      {token.symbol} - {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-right"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwapChains}
              className="rounded-full p-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Chain */}
          <div className="space-y-2">
            <Label htmlFor="to-chain">To</Label>
            <Select value={toChain} onValueChange={setToChain}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination chain" />
              </SelectTrigger>
              <SelectContent>
                {chains.filter(chain => chain.id !== fromChain).map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preference Selection */}
          <div className="space-y-2">
            <Label>Route Preference</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {preferences.map((pref) => {
                const Icon = pref.icon
                return (
                  <Button
                    key={pref.id}
                    variant={preference === pref.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreference(pref.id)}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{pref.name}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Get Routes Button */}
          <Button 
            onClick={handleGetRoutes}
            disabled={loading || !amount}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Finding Best Routes...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Get Routes
              </>
            )}
          </Button>

          {/* Warning for disconnected wallet */}
          {!connectedWallet && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Connect your wallet to execute bridge transactions
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Comparison */}
      {showRoutes && (
        <RouteComparison 
          routes={routes}
          fromChain={fromChain}
          toChain={toChain}
          token={token}
          amount={amount}
          preference={preference}
          onExecute={handleExecuteBridge}
          connectedWallet={connectedWallet}
        />
      )}
    </div>
  )
}

export default BridgeInterface

