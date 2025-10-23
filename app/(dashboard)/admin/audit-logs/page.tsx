"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Download, Eye, Activity } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user: {
    full_name: string;
    email: string;
  } | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const actions = [
    "LEAVE_SUBMITTED",
    "LEAVE_APPROVED",
    "LEAVE_REJECTED",
    "LEAVE_CANCELLED",
    "ROLE_ASSIGNED",
    "DOCUMENT_UPLOADED",
    "DOCUMENT_ACCESSED",
    "DOCUMENT_DELETED",
    "LOGIN_SUCCESS",
    "LOGIN_FAILED",
  ];

  const entities = ["leave", "user", "profile", "document"];

  useEffect(() => {
    fetchAuditLogs();
  }, [page, searchTerm, actionFilter, entityFilter, dateFilter]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would have an API endpoint to fetch audit logs
      // For now, we'll simulate with the existing function
      const response = await fetch("/api/admin/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          limit: 20,
          searchTerm,
          actionFilter,
          entityFilter,
          dateFilter,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      } else {
        // Fallback to empty state if API not available
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchTerm ||
      log.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity =
      entityFilter === "all" || log.entity_type === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "LEAVE_APPROVED":
        return "bg-green-100 text-green-800";
      case "LEAVE_REJECTED":
        return "bg-red-100 text-red-800";
      case "LEAVE_SUBMITTED":
        return "bg-blue-100 text-blue-800";
      case "LEAVE_CANCELLED":
        return "bg-yellow-100 text-yellow-800";
      case "ROLE_ASSIGNED":
        return "bg-purple-100 text-purple-800";
      case "DOCUMENT_DELETED":
        return "bg-red-100 text-red-800";
      case "DOCUMENT_ACCESSED":
        return "bg-gray-100 text-gray-800";
      case "LOGIN_FAILED":
        return "bg-red-100 text-red-800";
      case "LOGIN_SUCCESS":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const downloadLogs = () => {
    const csvContent = [
      ["Date", "User", "Action", "Entity", "Details", "IP Address"].join(","),
      ...filteredLogs.map((log) =>
        [
          formatDate(log.created_at),
          log.user?.full_name || "Unknown",
          log.action,
          `${log.entity_type}:${log.entity_id}`,
          JSON.stringify(log.new_values || {}),
          log.ip_address || "Unknown",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">
              Monitor and review system activities and security events
            </p>
          </div>
        </div>
        <Button onClick={downloadLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="leaves">Leave Management</TabsTrigger>
          <TabsTrigger value="documents">Document Access</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {actions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Entity Type</Label>
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All entities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      {entities.map((entity) => (
                        <SelectItem key={entity} value={entity}>
                          {entity.charAt(0).toUpperCase() + entity.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="quarter">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Log Entries</CardTitle>
              <CardDescription>
                {filteredLogs.length} entries found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No audit logs found matching your criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-sm">
                              {formatDate(log.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {log.user?.full_name || "Unknown"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {log.user?.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getActionColor(log.action)}>
                                {log.action.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {log.entity_type}:{log.entity_id}
                              </code>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {log.ip_address || "Unknown"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedLog(log);
                                  setShowDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPage(Math.min(totalPages, page + 1))
                          }
                          disabled={page === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Login attempts, role changes, and security-related activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Security events will be displayed here when the API is fully
                implemented.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves">
          <Card>
            <CardHeader>
              <CardTitle>Leave Management Activities</CardTitle>
              <CardDescription>
                Leave submissions, approvals, rejections, and cancellations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Leave management activities will be displayed here when the API
                is fully implemented.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Access Log</CardTitle>
              <CardDescription>
                Document uploads, downloads, views, and deletions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Document access logs will be displayed here when the API is
                fully implemented.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle>Audit Log Details</CardTitle>
              <CardDescription>
                Detailed information for log entry {selectedLog.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Date & Time</Label>
                  <p className="font-mono text-sm">
                    {formatDate(selectedLog.created_at)}
                  </p>
                </div>
                <div>
                  <Label>Action</Label>
                  <Badge className={getActionColor(selectedLog.action)}>
                    {selectedLog.action.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label>User</Label>
                  <p>{selectedLog.user?.full_name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLog.user?.email}
                  </p>
                </div>
                <div>
                  <Label>Entity</Label>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {selectedLog.entity_type}:{selectedLog.entity_id}
                  </code>
                </div>
                <div>
                  <Label>IP Address</Label>
                  <p className="font-mono text-sm">
                    {selectedLog.ip_address || "Unknown"}
                  </p>
                </div>
                <div>
                  <Label>User Agent</Label>
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedLog.user_agent || "Unknown"}
                  </p>
                </div>
              </div>

              {selectedLog.old_values && (
                <div>
                  <Label>Previous Values</Label>
                  <pre className="mt-1 p-3 bg-muted rounded text-sm overflow-auto">
                    {JSON.stringify(
                      JSON.parse(selectedLog.old_values),
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <Label>New Values</Label>
                  <pre className="mt-1 p-3 bg-muted rounded text-sm overflow-auto">
                    {JSON.stringify(
                      JSON.parse(selectedLog.new_values),
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setShowDetails(false)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
