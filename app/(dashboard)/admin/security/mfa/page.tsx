"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ShieldCheck, AlertTriangle, Smartphone } from "lucide-react";
import { MFAService } from "@/lib/services/mfa";

export default function MFAPage() {
  const [mfaStatus, setMfaStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [factorName, setFactorName] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const mfaService = new MFAService();

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    try {
      const status = await mfaService.getMFAStatus();
      setMfaStatus(status);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollMFA = async () => {
    if (!factorName.trim()) {
      setError("Please enter a name for this authenticator");
      return;
    }

    setEnrolling(true);
    setError("");
    setSuccess("");

    try {
      const enrollmentData = await mfaService.enrollTOTP(factorName);
      setQrCode(enrollmentData.qrCode || "");
      setSecret(enrollmentData.secret || "");
      setSuccess("Please scan the QR code with your authenticator app");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      // Get the current factor (assuming we're working with the latest)
      const factors = await mfaService.listFactors();
      const totpFactors = factors.totp || [];
      const unverifiedFactor = totpFactors.find(
        (f) => (f.status as string) === "unverified"
      );

      if (!unverifiedFactor) {
        throw new Error("No pending MFA enrollment found");
      }

      await mfaService.verifyTOTPChallenge(
        unverifiedFactor.id,
        verificationCode
      );
      setSuccess("MFA verification successful! Your account is now protected.");

      // Reset form
      setQrCode("");
      setSecret("");
      setVerificationCode("");
      setFactorName("");

      // Refresh status
      await fetchMFAStatus();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleUnenrollMFA = async (factorId: string) => {
    try {
      await mfaService.unenrollFactor(factorId);
      setSuccess("MFA has been removed from your account");
      await fetchMFAStatus();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Multi-Factor Authentication</h1>
          <p className="text-muted-foreground">
            Add an extra layer of security to your admin account
          </p>
        </div>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {mfaStatus?.enabled ? (
              <>
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span>MFA Enabled</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Protected
                </Badge>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>MFA Not Configured</span>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  At Risk
                </Badge>
              </>
            )}
          </CardTitle>
          <CardDescription>
            {mfaStatus?.enabled
              ? "Your account is protected with multi-factor authentication."
              : "We recommend enabling MFA to protect your admin account from unauthorized access."}
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue={mfaStatus?.enabled ? "manage" : "setup"}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="setup">Setup MFA</TabsTrigger>
          <TabsTrigger value="manage">Manage Factors</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Setup TOTP Authenticator</span>
              </CardTitle>
              <CardDescription>
                Use an authenticator app like Google Authenticator, Authy, or
                1Password to setup MFA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Name the authenticator */}
              <div className="space-y-2">
                <Label htmlFor="factorName">Authenticator Name</Label>
                <Input
                  id="factorName"
                  placeholder="e.g., My Phone Authenticator"
                  value={factorName}
                  onChange={(e) => setFactorName(e.target.value)}
                  disabled={qrCode !== ""}
                />
                <p className="text-sm text-muted-foreground">
                  Give this authenticator a recognizable name.
                </p>
              </div>

              {!qrCode ? (
                <Button
                  onClick={handleEnrollMFA}
                  disabled={enrolling}
                  className="w-full"
                >
                  {enrolling ? "Generating QR Code..." : "Setup Authenticator"}
                </Button>
              ) : (
                <div className="space-y-6">
                  {/* Step 2: Show QR code */}
                  <div className="text-center space-y-4">
                    <div className="inline-block p-4 bg-white rounded-lg border">
                      {qrCode ? (
                        <img
                          src={qrCode}
                          alt="QR Code for MFA setup"
                          className="w-48 h-48"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-muted-foreground">
                          QR Code not available
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Scan this QR code with your authenticator app
                      </p>
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer">
                          Can&apos;t scan? Use this secret key
                        </summary>
                        <code className="block p-2 bg-muted rounded text-center select-all">
                          {secret}
                        </code>
                      </details>
                    </div>
                  </div>

                  {/* Step 3: Verify code */}
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) =>
                        setVerificationCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      maxLength={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code from your authenticator app.
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleVerifyMFA}
                      disabled={verifying}
                      className="flex-1"
                    >
                      {verifying ? "Verifying..." : "Verify & Enable MFA"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQrCode("");
                        setSecret("");
                        setVerificationCode("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Authenticators</CardTitle>
              <CardDescription>
                Manage your configured multi-factor authentication factors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mfaStatus?.factors && mfaStatus.factors.length > 0 ? (
                <div className="space-y-4">
                  {mfaStatus.factors.map((factor: any) => (
                    <div
                      key={factor.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {factor.friendly_name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {factor.factor_type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Status: {factor.status} • Created:{" "}
                          {new Date(factor.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUnenrollMFA(factor.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No authenticators configured</p>
                  <p className="text-sm">
                    Switch to the Setup tab to add your first authenticator.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Information</CardTitle>
              <CardDescription>
                Important information about your MFA setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Current Assurance Level</h4>
                  <p className="text-sm text-muted-foreground">
                    Level: {mfaStatus?.currentLevel || "aal1"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Recommended Actions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Keep backup codes safe</li>
                    <li>• Test your authenticator regularly</li>
                    <li>• Enable MFA on all admin accounts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
