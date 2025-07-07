import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  Clock, 
  DollarSign, 
  Shield, 
  Zap, 
  ArrowRight, 
  Star, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const RouteComparison = ({ 
  routes, 
  fromChain, 
  toChain, 
  token, 
  amount, 
  preference, 
  onExecute, 
  connectedWallet 
}) => {
  const [selectedRoute, setSelectedRoute] = useState(null)

  const getPreferenceIcon = (pref) => {
    switch (pref) {
      case 'cheapest': return DollarSign
      case 'fastest': return Zap
      case 'safest': return Shield
      default: return TrendingUp
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 90) return { variant: 'default', text: 'High Confidence' }
    if (confidence >= 80) return { variant: 'secondary', text: 'Medium Confidence' }
    return { variant: 'destructive', text: 'Low Confidence' }
  }

  const formatChainName = (chain) => {
    return chain.charAt(0).toUpperCase() + chain.slice(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Route Comparison
          </CardTitle>
          <CardDescription>
            Bridging {amount} {token} from {formatChainName(fromChain)} to {formatChainName(toChain)}
            {preference !== 'balanced' && (
              <span className="ml-2">
                • Optimized for <strong>{preference}</strong>
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Routes Grid */}
      <div className="grid gap-4">
        {routes.map((route, index) => {
          const confidenceBadge = getConfidenceBadge(route.confidence)
          const isRecommended = index === 0
          const isSelected = selectedRoute === route.protocol

          return (
            <Card 
              key={route.protocol}
              className={`relative transition-all cursor-pointer ${
                isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
              } ${isRecommended ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' : ''}`}
              onClick={() => setSelectedRoute(route.protocol)}
            >
              {isRecommended && (
                <div className="absolute -top-2 left-4">
                  <Badge className="bg-green-600 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  {/* Protocol Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {route.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{route.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={confidenceBadge.variant} className="text-xs">
                            {confidenceBadge.text}
                          </Badge>
                          <span className={`text-sm font-medium ${getConfidenceColor(route.confidence)}`}>
                            {route.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                        <DollarSign className="h-3 w-3" />
                        Fee
                      </div>
                      <div className="font-semibold">{route.fee}</div>
                      <div className="text-xs text-muted-foreground">{route.totalFee}</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        Time
                      </div>
                      <div className="font-semibold">{route.estimatedTime}</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                        <Zap className="h-3 w-3" />
                        Gas
                      </div>
                      <div className="font-semibold">{route.gasEstimate}</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="h-3 w-3" />
                        You Get
                      </div>
                      <div className="font-semibold text-green-600">{route.amountOut} {token}</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="md:col-span-1">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation()
                        onExecute(route)
                      }}
                      className="w-full"
                      variant={isRecommended ? "default" : "outline"}
                    >
                      {connectedWallet ? (
                        <>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Bridge
                        </>
                      ) : (
                        'Connect Wallet'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Route Score</span>
                    <span className="font-medium">{route.score}/100</span>
                  </div>
                  <Progress value={route.score} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Route Details */}
      {selectedRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Route Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Transaction Steps */}
              <div>
                <h4 className="font-semibold mb-3">Transaction Steps</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</div>
                    <span className="text-sm">Approve token spending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</div>
                    <span className="text-sm">Initiate bridge transaction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</div>
                    <span className="text-sm">Wait for cross-chain confirmation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">4</div>
                    <span className="text-sm">Receive tokens on destination</span>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h4 className="font-semibold mb-3">Risk Assessment</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span>Smart contract risk</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span>Bridge validator risk</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span>Network congestion delays</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Audited smart contracts</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RouteComparison

