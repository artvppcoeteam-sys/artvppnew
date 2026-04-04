import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Construction, Activity, Users, ShoppingCart, Zap } from 'lucide-react';

export function AdminReports() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">System Reports & Analytics</h2>

            {/* Coming Soon Notice */}
            <Card className="border-dashed border-2 border-yellow-400 bg-yellow-50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Construction className="w-16 h-16 text-yellow-600 mb-4" />
                    <h3 className="text-xl font-semibold text-yellow-800">Coming Soon</h3>
                    <p className="text-yellow-700 text-center mt-2 max-w-md">
                        Advanced analytics and reporting features are under development.
                        This will include user analytics, sales reports, vendor performance metrics, and more.
                    </p>
                </CardContent>
            </Card>

            {/* Placeholder Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 opacity-50">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">--</div>
                        <p className="text-xs text-muted-foreground">Data not available</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Signups</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Data not available</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Data not available</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                        <Zap className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Data not available</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
