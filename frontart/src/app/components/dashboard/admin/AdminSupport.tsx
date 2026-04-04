import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Construction, MessageSquare, HelpCircle, LifeBuoy } from 'lucide-react';

export function AdminSupport() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Support Tickets</h2>
                    <p className="text-muted-foreground">Manage customer inquiries and issues.</p>
                </div>
            </div>

            {/* Coming Soon Notice */}
            <Card className="border-dashed border-2 border-yellow-400 bg-yellow-50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Construction className="w-16 h-16 text-yellow-600 mb-4" />
                    <h3 className="text-xl font-semibold text-yellow-800">Coming Soon</h3>
                    <p className="text-yellow-700 text-center mt-2 max-w-md">
                        Support ticket management features are under development.
                        This will include customer support tickets, live chat, and FAQ management.
                    </p>
                </CardContent>
            </Card>

            {/* Placeholder Cards */}
            <div className="grid gap-4 md:grid-cols-3 opacity-50">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Open Tickets
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Awaiting response</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5" />
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Awaiting customer reply</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LifeBuoy className="w-5 h-5" />
                            Resolved
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
