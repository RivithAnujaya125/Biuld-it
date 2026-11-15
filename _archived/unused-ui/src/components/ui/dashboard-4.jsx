import { CategoryRankChart } from './dashboard-4-utils/category-rank-chart'
import { QuickActions } from './dashboard-4-utils/quick-actions'
import { RefundReturnRateChart } from './dashboard-4-utils/refund-return-rate-chart'
import { RevenueChart } from './dashboard-4-utils/revenue-chart'
import { DashboardStats } from './dashboard-4-utils/stats'

export function AnalyticsDashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardStats />
      <RevenueChart />
      <RefundReturnRateChart />
      <CategoryRankChart />
      <QuickActions />
    </div>
  )
}

export default AnalyticsDashboard
