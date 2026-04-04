import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Construction, Image, FileText, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

export function AdminContent() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Content Management</h2>
                    <p className="text-muted-foreground">Manage homepage banners, featured sections, and announcements.</p>
                </div>
            </div>

            {/* Coming Soon Notice */}
            <Card className="border-dashed border-2 border-yellow-400 bg-yellow-50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Construction className="w-16 h-16 text-yellow-600 mb-4" />
                    <h3 className="text-xl font-semibold text-yellow-800">Coming Soon</h3>
                    <p className="text-yellow-700 text-center mt-2 max-w-md">
                        Content management features are under development.
                        This will include banner management, featured sections, and site-wide announcements.
                    </p>
                </CardContent>
            </Card>

            <Tabs defaultValue="banners" className="w-full">
                <TabsList>
                    <TabsTrigger value="banners">Banners</TabsTrigger>
                    <TabsTrigger value="featured">Featured Section</TabsTrigger>
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                </TabsList>

                <TabsContent value="banners" className="mt-4">
                    <Card className="opacity-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Image className="w-5 h-5" />
                                Homepage Banners
                            </CardTitle>
                            <CardDescription>Manage the main carousel images on the homepage.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground py-8">
                                Banner management coming soon...
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="featured" className="mt-4">
                    <Card className="opacity-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Featured Collections
                            </CardTitle>
                            <CardDescription>Select which collections appear on the home page.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground py-8">
                                Featured sections management coming soon...
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="announcements" className="mt-4">
                    <Card className="opacity-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Site Announcements
                            </CardTitle>
                            <CardDescription>Create announcements that appear across the site.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground py-8">
                                Announcements management coming soon...
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
