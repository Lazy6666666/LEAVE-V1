"use client";

import { useState } from "react";
// import { QRCodeSVG } from "qrcode.react"; // Commented out - package not installed
import { MFAService } from "@/lib/services/mfa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function MFASetup() {
  const [step, setStep] = useState<"setup" | "verify" | "complete">("setup");
  const [factorName, setFactorName] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState("");

  const mfaService = new MFAService();

  const handleEnroll = async () => {
    if (!factorName.trim()) {
      setError("Please enter a name for this authenticator");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const enrollment = await mfaService.enrollTOTP(factorName);

      if (enrollment.qrCode) {
        setQrCode(enrollment.qrCode);
        setSecret(enrollment.secret || "");
        setFactorId(enrollment.factors[0]?.id || "");
        setStep("verify");
      }
    } catch (err: any) {
      setError(err.message || "Failed to enroll MFA factor");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await mfaService.verifyTOTPChallenge(factorId, verificationCode);
      setStep("complete");
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  if (step === "complete") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary" className="text-green-600">
              Success
            </Badge>
            MFA Enabled
          </CardTitle>
          <CardDescription>
            Your account is now protected with multi-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Make sure to save your backup codes in a secure location. You can
              use them to access your account if you lose your device.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Up Multi-Factor Authentication</CardTitle>
        <CardDescription>
          Enhance your account security by adding an authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "setup" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="factor-name">Authenticator Name</Label>
              <Input
                id="factor-name"
                placeholder="e.g., My Phone"
                value={factorName}
                onChange={(e) => setFactorName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleEnroll}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate QR Code"}
            </Button>
          </>
        )}

        {step === "verify" && (
          <>
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.)
              </p>
              <div className="bg-white p-4 rounded-lg">
                {qrCode && (
                  <div className="w-[200px] h-[200px] bg-gray-200 flex items-center justify-center text-gray-600">
                    QR Code (Install qrcode.react package)
                  </div>
                )}
              </div>
              {secret && (
                <div className="space-y-2">
                  <Label>Or enter this code manually:</Label>
                  <code className="block p-2 bg-muted rounded text-sm">
                    {secret}
                  </code>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <Button
              onClick={handleVerify}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify & Enable"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
