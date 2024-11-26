import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Bell, Hash, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DiscordIntegration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Discord Integration</h2>
          <p className="text-sm text-muted-foreground">
            Connect your Discord server to receive notifications and updates
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Connect Discord
        </Button>
      </div>

      <div className="grid gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Server Configuration</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select the Discord server and channel for notifications
          </p>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Server</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a server" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="server1">Development Team</SelectItem>
                  <SelectItem value="server2">Project Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Channel</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="channel1"># project-updates</SelectItem>
                  <SelectItem value="channel2"># notifications</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Notification Settings</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure what events trigger Discord notifications
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <Label>New task created</Label>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label>Task status changes</Label>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <Label>Project updates</Label>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Message Preview</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Example of how notifications will appear in Discord
          </p>
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">New Task Created</p>
                <p className="text-xs text-muted-foreground">
                  🎯 Task "Implement Discord Integration" has been created in Project Manager
                  <br />
                  📌 Priority: High
                  <br />
                  👤 Assigned to: John Doe
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}