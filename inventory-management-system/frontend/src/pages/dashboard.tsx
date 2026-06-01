import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useGetDashboardStats();

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center space-y-2">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
          <h3 className="font-semibold text-lg text-foreground">Failed to load dashboard</h3>
          <p className="text-muted-foreground text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Products" 
          value={stats?.totalProducts} 
          icon={Package} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Total Customers" 
          value={stats?.totalCustomers} 
          icon={Users} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.totalOrders} 
          icon={ShoppingCart} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Total Revenue" 
          value={stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : undefined} 
          icon={DollarSign} 
          isLoading={isLoading} 
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Low Stock Alerts */}
        <Card className="col-span-1 border-destructive/20 shadow-sm flex flex-col">
          <CardHeader className="bg-destructive/5 pb-4 border-b border-destructive/10">
            <CardTitle className="text-lg flex items-center text-destructive">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription className="text-destructive/80">Products requiring immediate restock</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <ul className="divide-y divide-border">
                {stats.lowStockProducts.map((product) => (
                  <li key={product.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-destructive/10 text-destructive">
                        {product.stockQuantity} left
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <Package className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">All products are adequately stocked.</p>
              </div>
            )}
          </CardContent>
          <div className="p-3 bg-muted/30 border-t border-border mt-auto">
            <Link href="/products" className="text-xs text-primary flex items-center justify-center font-medium hover:underline">
              Manage Products <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <CardDescription>Latest transactions across all channels</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order ID</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                      <th className="px-4 py-3 font-medium text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{order.id.toString().padStart(5, '0')}</td>
                        <td className="px-4 py-3 font-medium">{order.customerName}</td>
                        <td className="px-4 py-3">
                          <span className="truncate max-w-[150px] inline-block align-bottom">{order.productName}</span>
                          <span className="text-xs text-muted-foreground ml-1">x{order.quantity}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">
                          ${order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), "MMM d, h:mm a")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <ShoppingCart className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">No orders placed yet.</p>
              </div>
            )}
          </CardContent>
          <div className="p-3 bg-muted/30 border-t border-border mt-auto">
            <Link href="/orders" className="text-xs text-primary flex items-center justify-center font-medium hover:underline">
              View All Orders <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  isLoading 
}: { 
  title: string; 
  value?: string | number; 
  icon: any; 
  isLoading: boolean;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{value ?? 0}</h3>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}