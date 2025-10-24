import { createClient } from "@/lib/supabase/client";

export interface MFAEnrollmentData {
  factors: Array<{
    id: string;
    friendly_name: string;
    factor_type: string;
    status: string;
  }>;
  next: string;
  qrCode?: string;
  secret?: string;
}

export class MFAService {
  private getSupabase() {
    return createClient();
  }

  /**
   * Enroll a new TOTP (Time-based One-Time Password) factor
   */
  async enrollTOTP(factorName: string): Promise<MFAEnrollmentData> {
    const { data, error } = await this.getSupabase().auth.mfa.enroll({
      factorType: "totp",
      friendlyName: factorName,
    });

    if (error) throw error;

    // Transform Supabase response to match our interface
    return {
      factors: [
        {
          id: data.id,
          friendly_name: data.friendly_name || factorName,
          factor_type: data.type,
          status: "unverified",
        },
      ],
      next: "verify",
      qrCode: data.totp?.qr_code,
      secret: data.totp?.secret,
    } as MFAEnrollmentData;
  }

  /**
   * Verify and activate a TOTP factor
   */
  async verifyTOTPChallenge(factorId: string, code: string) {
    const challengeResult = await this.getSupabase().auth.mfa.challenge({
      factorId,
    });
    if (challengeResult.error) throw challengeResult.error;

    const { data, error } = await this.getSupabase().auth.mfa.verify({
      factorId,
      challengeId: challengeResult.data?.id || "",
      code,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Challenge a TOTP factor
   */
  async challengeTOTP(factorId: string) {
    const { data, error } = await this.getSupabase().auth.mfa.challenge({
      factorId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * List all MFA factors for the current user
   */
  async listFactors() {
    const { data, error } = await this.getSupabase().auth.mfa.listFactors();

    if (error) throw error;
    return data;
  }

  /**
   * Unenroll (remove) an MFA factor
   */
  async unenrollFactor(factorId: string) {
    const { data, error } = await this.getSupabase().auth.mfa.unenroll({
      factorId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get Authenticator Assurance Level (AAL)
   */
  async getAAL() {
    const { data, error } =
      await this.getSupabase().auth.mfa.getAuthenticatorAssuranceLevel();

    if (error) throw error;
    return data;
  }

  /**
   * Check if user has MFA enabled
   */
  async hasMFAEnabled(): Promise<boolean> {
    const factors = await this.listFactors();
    const totpFactors = factors.totp || [];
    const phoneFactors = factors.phone || [];

    return (
      totpFactors.some((f) => f.status === "verified") ||
      phoneFactors.some((f) => f.status === "verified")
    );
  }

  /**
   * Get current user's MFA status
   */
  async getMFAStatus() {
    const [factors, aal] = await Promise.all([
      this.listFactors(),
      this.getAAL(),
    ]);

    const enabled = await this.hasMFAEnabled();
    const verifiedFactors = [
      ...(factors.totp || []).filter((f) => f.status === "verified"),
      ...(factors.phone || []).filter((f) => f.status === "verified"),
    ];

    return {
      enabled,
      currentLevel: aal.currentLevel,
      nextLevel: aal.nextLevel,
      factors: verifiedFactors,
      hasAnyFactor: verifiedFactors.length > 0,
    };
  }
}
