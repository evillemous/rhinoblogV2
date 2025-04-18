import SuperuserLayout from "@/components/superuser/SuperuserLayout";
import SuperAdminGuard from "@/lib/guards/SuperAdminGuard";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  Bug, 
  Code, 
  Database, 
  RefreshCw, 
  Terminal, 
  Trash2, 
  Upload,
  Download,
  HardDrive,
  Cpu
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const DevTools = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("console");
  const [consoleOutput, setConsoleOutput] = useState("Welcome to the Developer Console\n> ");
  
  const handleCommand = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const command = (form.elements.namedItem('command') as HTMLInputElement).value;
    
    setConsoleOutput(prev => `${prev}${command}\n> Command not implemented in demo\n> `);
    form.reset();
  };
  
  const runBackup = () => {
    toast({
      title: "Backup Started",
      description: "Database backup initiated. You will be notified when complete.",
    });
    
    setTimeout(() => {
      toast({
        title: "Backup Complete",
        description: "Database backup completed successfully.",
      });
    }, 3000);
  };
  
  return (
    <SuperAdminGuard>
      <SuperuserLayout title="Developer Tools">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Developer Tools</h2>
            <div className="flex items-center space-x-2">
              <div className="flex h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-green-600">All Systems Operational</span>
            </div>
          </div>
          
          <Tabs defaultValue="console" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="console">
                <Terminal className="mr-2 h-4 w-4" />
                Console
              </TabsTrigger>
              <TabsTrigger value="database">
                <Database className="mr-2 h-4 w-4" />
                Database
              </TabsTrigger>
              <TabsTrigger value="logs">
                <Bug className="mr-2 h-4 w-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="system">
                <HardDrive className="mr-2 h-4 w-4" />
                System
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="console" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Developer Console</CardTitle>
                  <CardDescription>
                    Execute commands directly on the server
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md bg-gray-900 text-white p-4 font-mono text-sm h-96 overflow-y-auto mb-4">
                    <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
                  </div>
                  
                  <form onSubmit={handleCommand} className="flex gap-2">
                    <Input 
                      name="command"
                      placeholder="Enter command..."
                      className="font-mono"
                      autoComplete="off"
                    />
                    <Button type="submit">
                      <Terminal className="mr-2 h-4 w-4" />
                      Execute
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="database" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Database Management</CardTitle>
                  <CardDescription>
                    Manage database operations and backups
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Database Status</h3>
                          <p className="text-sm text-gray-500">Current state of database</p>
                        </div>
                        <div className="flex h-3 w-3 rounded-full bg-green-500" />
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Type:</span>
                          <span className="font-medium">Memory Storage</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Size:</span>
                          <span className="font-medium">142 KB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Records:</span>
                          <span className="font-medium">178</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-medium">Backup & Restore</h3>
                      <p className="text-sm text-gray-500">Create and restore database backups</p>
                      <div className="mt-4 space-y-3">
                        <Button className="w-full" onClick={runBackup}>
                          <Download className="mr-2 h-4 w-4" />
                          Backup Database
                        </Button>
                        <div className="relative">
                          <Button variant="outline" className="w-full">
                            <Upload className="mr-2 h-4 w-4" />
                            Restore from Backup
                          </Button>
                          <input
                            type="file"
                            className="absolute inset-0 cursor-pointer opacity-0"
                            accept=".json"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">SQL Console</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Enter SQL query..."
                        className="font-mono h-32"
                      />
                    </CardContent>
                    <CardFooter className="justify-between border-t bg-gray-50 px-6 py-3">
                      <div className="text-xs text-gray-500">Use with caution!</div>
                      <Button>
                        <Code className="mr-2 h-4 w-4" />
                        Run Query
                      </Button>
                    </CardFooter>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Error Logs</CardTitle>
                  <CardDescription>
                    View and manage application error logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Logs
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="auto-refresh">Auto-refresh</Label>
                      <Switch id="auto-refresh" />
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-gray-50 border p-4 font-mono text-sm h-96 overflow-y-auto">
                    <div className="text-center py-8 text-gray-500">
                      No error logs found
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>
                    View current system resource usage and status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center">
                        <Cpu className="mr-2 h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-medium">CPU Usage</h3>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">23%</div>
                        <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                          <div className="h-2 rounded-full bg-blue-500" style={{ width: '23%' }} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center">
                        <HardDrive className="mr-2 h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-medium">Memory Usage</h3>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">512 MB</div>
                        <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                          <div className="h-2 rounded-full bg-green-500" style={{ width: '40%' }} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center">
                        <Database className="mr-2 h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-medium">Storage</h3>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">2.1 GB Free</div>
                        <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                          <div className="h-2 rounded-full bg-orange-500" style={{ width: '65%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="mb-3 text-lg font-medium">Environment Information</h3>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-2 gap-4 p-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Node.js Version</div>
                          <div className="mt-1">v18.19.0</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Server Uptime</div>
                          <div className="mt-1">2d 14h 32m</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Environment</div>
                          <div className="mt-1">Production</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Last Deployment</div>
                          <div className="mt-1">Apr 18, 2025 at 10:15 AM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SuperuserLayout>
    </SuperAdminGuard>
  );
};

export default DevTools;