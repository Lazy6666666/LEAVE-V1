"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Clock,
  Briefcase,
  Heart,
  Home,
  Plane,
  Users,
  Settings,
} from "lucide-react";

export default function LeaveTypeConfiguration() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const leaveTypes = [
    {
      id: 1,
      name: "Annual Leave",
      code: "AL",
      description: "Paid annual leave for all employees",
      category: "Paid",
      defaultDays: 21,
      isEncashable: true,
      requiresApproval: true,
      minNoticeDays: 3,
      maxConsecutiveDays: 15,
      isPaid: true,
      isActive: true,
      color: "#3B82F6",
      icon: "Calendar",
    },
    {
      id: 2,
      name: "Sick Leave",
      code: "SL",
      description: "Medical leave with doctor's certificate required",
      category: "Paid",
      defaultDays: 10,
      isEncashable: false,
      requiresApproval: true,
      minNoticeDays: 0,
      maxConsecutiveDays: 5,
      isPaid: true,
      isActive: true,
      color: "#10B981",
      icon: "Heart",
    },
    {
      id: 3,
      name: "Maternity Leave",
      code: "ML",
      description: "Maternity leave for female employees",
      category: "Paid",
      defaultDays: 90,
      isEncashable: false,
      requiresApproval: true,
      minNoticeDays: 30,
      maxConsecutiveDays: 90,
      isPaid: true,
      isActive: true,
      color: "#EC4899",
      icon: "Users",
    },
    {
      id: 4,
      name: "Unpaid Leave",
      code: "UL",
      description: "Unpaid leave for personal reasons",
      category: "Unpaid",
      defaultDays: 30,
      isEncashable: false,
      requiresApproval: true,
      minNoticeDays: 7,
      maxConsecutiveDays: 30,
      isPaid: false,
      isActive: true,
      color: "#6B7280",
      icon: "Clock",
    },
    {
      id: 5,
      name: "Compassionate Leave",
      code: "CL",
      description: "Leave for family emergencies",
      category: "Paid",
      defaultDays: 3,
      isEncashable: false,
      requiresApproval: false,
      minNoticeDays: 0,
      maxConsecutiveDays: 3,
      isPaid: true,
      isActive: true,
      color: "#F59E0B",
      icon: "Home",
    },
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Calendar":
        return <Calendar className="w-4 h-4" />;
      case "Heart":
        return <Heart className="w-4 h-4" />;
      case "Users":
        return <Users className="w-4 h-4" />;
      case "Clock":
        return <Clock className="w-4 h-4" />;
      case "Home":
        return <Home className="w-4 h-4" />;
      case "Plane":
        return <Plane className="w-4 h-4" />;
      case "Briefcase":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Unpaid":
        return "bg-red-100 text-red-800";
      case "Half-Paid":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Leave Type Configuration</h2>
          <p className="text-muted-foreground">
            Manage leave types, policies, and accrual rules
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Leave Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Leave Type</DialogTitle>
              <DialogDescription>
                Define a new leave type with its policies and rules.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Leave Type Name</Label>
                  <Input id="name" placeholder="e.g., Annual Leave" />
                </div>
                <div>
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" placeholder="e.g., AL" maxLength={3} />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and usage of this leave type..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="half-paid">Half-Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="defaultDays">Default Days (per year)</Label>
                  <Input id="defaultDays" type="number" placeholder="21" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minNotice">Minimum Notice (days)</Label>
                  <Input id="minNotice" type="number" placeholder="3" />
                </div>
                <div>
                  <Label htmlFor="maxConsecutive">
                    Maximum Consecutive Days
                  </Label>
                  <Input id="maxConsecutive" type="number" placeholder="15" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requiresApproval">Requires Approval</Label>
                  <Switch id="requiresApproval" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isEncashable">Allow Encashment</Label>
                  <Switch id="isEncashable" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch id="isActive" defaultChecked />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Leave Type
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Type Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{leaveTypes.length}</p>
              <p className="text-sm text-muted-foreground">Total Types</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {leaveTypes.filter((t) => t.category === "Paid").length}
              </p>
              <p className="text-sm text-muted-foreground">Paid Types</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">
                {leaveTypes.filter((t) => t.requiresApproval).length}
              </p>
              <p className="text-sm text-muted-foreground">Require Approval</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">
                {leaveTypes.filter((t) => t.isEncashable).length}
              </p>
              <p className="text-sm text-muted-foreground">Encashable</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Leave Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaveTypes.map((leaveType) => (
          <Card key={leaveType.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${leaveType.color}20` }}
                >
                  <div style={{ color: leaveType.color }}>
                    {getIconComponent(leaveType.icon)}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">{leaveType.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {leaveType.code}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {leaveType.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span>Category:</span>
                <Badge className={getCategoryBadgeColor(leaveType.category)}>
                  {leaveType.category}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Default Days:</span>
                <span className="font-medium">
                  {leaveType.defaultDays} days
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Min Notice:</span>
                <span className="font-medium">
                  {leaveType.minNoticeDays} days
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Max Consecutive:</span>
                <span className="font-medium">
                  {leaveType.maxConsecutiveDays} days
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Badge variant={leaveType.isActive ? "default" : "secondary"}>
                  {leaveType.isActive ? "Active" : "Inactive"}
                </Badge>
                {leaveType.isEncashable && (
                  <Badge variant="outline">Encashable</Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {leaveType.requiresApproval && (
                  <div title="Requires Approval">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                {leaveType.isPaid && (
                  <div title="Paid Leave">
                    <Briefcase className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Leave Types Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Leave Type Summary</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Default Days</TableHead>
                <TableHead>Min Notice</TableHead>
                <TableHead>Max Consecutive</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveTypes.map((leaveType) => (
                <TableRow key={leaveType.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div
                        className="p-1 rounded"
                        style={{ backgroundColor: `${leaveType.color}20` }}
                      >
                        <div style={{ color: leaveType.color }}>
                          {getIconComponent(leaveType.icon)}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{leaveType.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {leaveType.code}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getCategoryBadgeColor(leaveType.category)}
                    >
                      {leaveType.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{leaveType.defaultDays} days</TableCell>
                  <TableCell>{leaveType.minNoticeDays} days</TableCell>
                  <TableCell>{leaveType.maxConsecutiveDays} days</TableCell>
                  <TableCell>
                    {leaveType.requiresApproval ? (
                      <Badge variant="default">Required</Badge>
                    ) : (
                      <Badge variant="secondary">Not Required</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={leaveType.isActive ? "default" : "secondary"}
                    >
                      {leaveType.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {leaveType.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
