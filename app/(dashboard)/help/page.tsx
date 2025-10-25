"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  HelpCircle,
  Book,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Video,
  Send,
  ExternalLink,
  CheckCircle,
} from "lucide-react";


interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "How do I request leave?",
    answer:
      "To request leave, navigate to the 'Leave Management' section in the sidebar, click on 'New Request', fill in the required details including leave type, dates, and reason, then submit. Your manager will be notified and can approve or reject your request.",
    category: "Leave Management",
  },
  {
    id: "2",
    question: "How long does it take for leave requests to be approved?",
    answer:
      "Leave requests are typically reviewed within 24-48 hours. However, this may vary depending on your manager's availability. You'll receive a notification once your request has been processed.",
    category: "Leave Management",
  },
  {
    id: "3",
    question: "Can I cancel a leave request?",
    answer:
      "Yes, you can cancel a leave request as long as it hasn't started yet. Go to 'My Leaves', find the request you want to cancel, and click the 'Cancel Request' button. Cancelled requests can be resubmitted if needed.",
    category: "Leave Management",
  },
  {
    id: "4",
    question: "How do I check my leave balance?",
    answer:
      "Your leave balance is displayed on the dashboard. It shows total days, used days, and remaining days for each leave type (Annual, Sick, Personal, etc.). You can also view detailed balance information in the 'My Leaves' section.",
    category: "Leave Management",
  },
  {
    id: "5",
    question: "What types of leave are available?",
    answer:
      "The system supports multiple leave types including Annual Leave, Sick Leave, Personal Leave, and Maternity/Paternity Leave. Each type has its own quota and approval requirements. Check with HR for specific policies.",
    category: "Leave Management",
  },
  {
    id: "6",
    question: "How do I upload documents?",
    answer:
      "Navigate to the 'Documents' section, click 'Upload Document', select your file, add a title and description, choose the appropriate category and access level, then click 'Upload'. Supported formats include PDF, Word, Excel, and images.",
    category: "Documents",
  },
  {
    id: "7",
    question: "Who can see the documents I upload?",
    answer:
      "Document visibility depends on the access level you set. 'Public' documents are visible to all employees, 'Employee' level restricts to regular staff, 'Manager' level to managers and above, and 'Admin' level to administrators only.",
    category: "Documents",
  },
  {
    id: "8",
    question: "How do I update my profile information?",
    answer:
      "Go to Settings > Profile tab. You can update your name, phone number, department, and profile picture. Note that your email address cannot be changed as it's used for authentication.",
    category: "Account",
  },
  {
    id: "9",
    question: "How do I change my password?",
    answer:
      "Navigate to Settings > Security tab. Enter your current password, then your new password twice for confirmation. Passwords must be at least 8 characters long and include a mix of letters, numbers, and symbols.",
    category: "Account",
  },
  {
    id: "10",
    question: "How do I enable two-factor authentication?",
    answer:
      "Go to Settings > Security tab and toggle on 'Enable 2FA'. You'll be prompted to set up an authenticator app. Scan the QR code with your app and enter the verification code to complete setup.",
    category: "Account",
  },
  {
    id: "11",
    question: "How can I view my team's leave schedule?",
    answer:
      "Use the Calendar view to see all team members' leave schedules. You can filter by department, team, or individual members. The calendar shows approved leaves and helps prevent scheduling conflicts.",
    category: "Team",
  },
  {
    id: "12",
    question: "What should I do if I forgot my password?",
    answer:
      "On the login page, click 'Forgot Password'. Enter your email address and you'll receive a password reset link. Follow the instructions in the email to create a new password.",
    category: "Account",
  },
];

const quickLinks = [
  {
    title: "User Guide",
    description: "Complete guide to using the leave management system",
    icon: Book,
    href: "#",
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step video guides",
    icon: Video,
    href: "#",
  },
  {
    title: "Leave Policy",
    description: "Company leave policies and procedures",
    icon: FileText,
    href: "#",
  },
  {
    title: "System Updates",
    description: "Latest features and improvements",
    icon: CheckCircle,
    href: "#",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [supportForm, setSupportForm] = useState({
    subject: "",
    category: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    "all",
    ...Array.from(new Set(faqs.map((faq) => faq.category))),
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !supportForm.subject ||
      !supportForm.category ||
      !supportForm.description
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/support/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supportForm),
      });

      if (response.ok) {
        alert("Support ticket submitted successfully");
        setSupportForm({ subject: "", category: "", description: "" });
      } else {
        alert("Failed to submit support ticket");
      }
    } catch (error) {
      console("Error: " + "Error submitting support ticket:", error);
      alert("An error occurred while submitting your request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-lg text-muted-foreground">
          Find answers to common questions or get in touch with our support team
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{link.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {link.description}
              </p>
              <Button variant="link" className="px-0 mt-2" asChild>
                <a href={link.href}>
                  Learn more
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Contact Support
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <Book className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === "all" ? "All" : category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* FAQ List */}
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No FAQs found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start gap-3">
                          <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{faq.question}</p>
                            <Badge variant="secondary" className="mt-1">
                              {faq.category}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pl-8">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Support Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Support Form */}
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Submit a ticket and we'll
                  get back to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSupport} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={supportForm.subject}
                      onChange={(e) =>
                        setSupportForm({
                          ...supportForm,
                          subject: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={supportForm.category}
                      onChange={(e) =>
                        setSupportForm({
                          ...supportForm,
                          category: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="leave">Leave Management</option>
                      <option value="documents">Documents</option>
                      <option value="account">Account & Settings</option>
                      <option value="technical">Technical Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed information about your issue"
                      value={supportForm.description}
                      onChange={(e) =>
                        setSupportForm({
                          ...supportForm,
                          description: e.target.value,
                        })
                      }
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Get in touch with our support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-muted-foreground">
                        support@leavehub.com
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Response within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-muted-foreground">
                        +1 (555) 123-4567
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mon-Fri, 9AM-6PM EST
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-sm text-muted-foreground">
                        Available during business hours
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Monday - Friday
                    </span>
                    <span className="font-medium">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Comprehensive guides and documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="#">
                    <Book className="h-4 w-4 mr-2" />
                    Getting Started Guide
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="#">
                    <FileText className="h-4 w-4 mr-2" />
                    User Manual
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="#">
                    <FileText className="h-4 w-4 mr-2" />
                    Leave Policy Document
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="#">
                    <FileText className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>Step-by-step video guides</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="#">
                    <Video className="h-4 w-4 mr-2" />
                    How to Request Leave
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="#">
                    <Video className="h-4 w-4 mr-2" />
                    Managing Your Team
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="#">
                    <Video className="h-4 w-4 mr-2" />
                    Document Management
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="#">
                    <Video className="h-4 w-4 mr-2" />
                    Using the Calendar
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current status of the leave management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="font-medium">All Systems Operational</p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: Just now
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
