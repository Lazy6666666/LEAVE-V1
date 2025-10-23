"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Database, Wifi, Server, CheckCircle, RefreshCw } from "lucide-react";

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const generalSettings = {
    companyName: "TechCorp Solutions",
    companyEmail: "hr@techcorp.com",
    supportPhone: "+1-555-0123",
    address: "123 Business Ave, Tech City, TC 12345",
    website: "https://techcorp.com",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    language: "English",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    workingHours: "9:00 AM - 6:00 PM",
  };

  const notificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    slackNotifications: true,
    leaveApprovalAlerts: true,
    leaveRejectionAlerts: true,
    leaveCancellationAlerts: true,
    documentExpiryAlerts: true,
    systemMaintenanceAlerts: true,
    securityAlerts: true,
    weeklyReports: false,
    monthlyReports: true,
  };

  const securitySettings = {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorAuth: true,
    ipWhitelist: false,
    auditLogging: true,
    dataEncryption: true,
  };

  const systemSettings = {
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: 30,
    dataRetentionPeriod: 2555,
    maxFileSize: 10,
    allowedFileTypes: ["PDF", "DOC", "DOCX", "XLS", "XLSX", "PNG", "JPG"],
    maintenanceMode: false,
    maintenanceMessage:
      "System is currently under maintenance. Please try again later.",
    apiRateLimit: 1000,
    cacheTimeout: 3600,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={() => setIsSaveDialogOpen(true)}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">System Status</h3>
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium">Database</p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Server className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium">API Server</p>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Wifi className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium">External Services</p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  defaultValue={generalSettings.companyName}
                />
              </div>
              <div>
                <Label htmlFor="companyEmail">Company Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  defaultValue={generalSettings.companyEmail}
                />
              </div>
              <div>
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input
                  id="supportPhone"
                  defaultValue={generalSettings.supportPhone}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" defaultValue={generalSettings.website} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue={generalSettings.address} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Localization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue={generalSettings.timezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">
                      Eastern Time (ET)
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time (CT)
                    </SelectItem>
                    <SelectItem value="America/Denver">
                      Mountain Time (MT)
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time (PT)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select defaultValue={generalSettings.dateFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select defaultValue={generalSettings.language}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="workingHours">Working Hours</Label>
                <Input
                  id="workingHours"
                  defaultValue={generalSettings.workingHours}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">
              Notification Channels
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via email
                  </p>
                </div>
                <Switch
                  defaultChecked={notificationSettings.emailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Browser push notifications
                  </p>
                </div>
                <Switch
                  defaultChecked={notificationSettings.pushNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Send SMS alerts
                  </p>
                </div>
                <Switch
                  defaultChecked={notificationSettings.smsNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Slack Integration</p>
                  <p className="text-sm text-muted-foreground">
                    Post notifications to Slack
                  </p>
                </div>
                <Switch
                  defaultChecked={notificationSettings.slackNotifications}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Notification Types</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Leave Approval Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Notify managers of pending approvals
                  </p>
                </div>
                <Switch
                  defaultChecked={notificationSettings.leaveApprovalAlerts}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Leave Rejection Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Notify employees of rejected requests
                  </p>
                </div>
                <Switch
                  defaultChecked={notificationSettings.leaveRejectionAlerts}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Document Expiry Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Alert for expiring documents
                  </p>
                </div>
                <Switch
                  defaultChecked={notificationSettings.documentExpiryAlerts}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Maintenance Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Notify about scheduled maintenance
                  </p>
                </div>
                <Switch
                  defaultChecked={notificationSettings.systemMaintenanceAlerts}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Password Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="minLength">Minimum Length</Label>
                <Input
                  id="minLength"
                  type="number"
                  defaultValue={securitySettings.passwordMinLength}
                />
              </div>
              <div>
                <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  defaultValue={securitySettings.maxLoginAttempts}
                />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Uppercase</p>
                  <p className="text-sm text-muted-foreground">
                    Passwords must contain uppercase letters
                  </p>
                </div>
                <Switch
                  defaultChecked={securitySettings.passwordRequireUppercase}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Numbers</p>
                  <p className="text-sm text-muted-foreground">
                    Passwords must contain numbers
                  </p>
                </div>
                <Switch
                  defaultChecked={securitySettings.passwordRequireNumbers}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Symbols</p>
                  <p className="text-sm text-muted-foreground">
                    Passwords must contain special characters
                  </p>
                </div>
                <Switch
                  defaultChecked={securitySettings.passwordRequireSymbols}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Enable 2FA for enhanced security
                  </p>
                </div>
                <Switch defaultChecked={securitySettings.twoFactorAuth} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Session Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="sessionTimeout">
                  Session Timeout (minutes)
                </Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  defaultValue={securitySettings.sessionTimeout}
                />
              </div>
              <div>
                <Label htmlFor="lockoutDuration">
                  Lockout Duration (minutes)
                </Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  defaultValue={securitySettings.lockoutDuration}
                />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">IP Whitelist</p>
                  <p className="text-sm text-muted-foreground">
                    Restrict access to specific IP addresses
                  </p>
                </div>
                <Switch defaultChecked={securitySettings.ipWhitelist} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit Logging</p>
                  <p className="text-sm text-muted-foreground">
                    Log all system activities
                  </p>
                </div>
                <Switch defaultChecked={securitySettings.auditLogging} />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Backup Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Automatic Backup</p>
                  <p className="text-sm text-muted-foreground">
                    Enable automatic data backups
                  </p>
                </div>
                <Switch defaultChecked={systemSettings.autoBackup} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select defaultValue={systemSettings.backupFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="backupRetention">
                    Retention Period (days)
                  </Label>
                  <Input
                    id="backupRetention"
                    type="number"
                    defaultValue={systemSettings.backupRetention}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Data Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dataRetention">
                  Data Retention Period (days)
                </Label>
                <Input
                  id="dataRetention"
                  type="number"
                  defaultValue={systemSettings.dataRetentionPeriod}
                />
              </div>
              <div>
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  defaultValue={systemSettings.maxFileSize}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="apiRateLimit">
                  API Rate Limit (requests/hour)
                </Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  defaultValue={systemSettings.apiRateLimit}
                />
              </div>
              <div>
                <Label htmlFor="cacheTimeout">Cache Timeout (seconds)</Label>
                <Input
                  id="cacheTimeout"
                  type="number"
                  defaultValue={systemSettings.cacheTimeout}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Confirmation Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Settings</DialogTitle>
            <DialogDescription>
              Are you sure you want to save all changes? This will update
              system-wide settings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsSaveDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
