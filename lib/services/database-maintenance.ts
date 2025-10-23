import { createClient } from "@/lib/supabase/server";

export interface MaintenanceSchedule {
  lastVacuum: Date | null;
  lastAnalyze: Date | null;
  lastReindex: Date | null;
  needsVacuum: boolean;
  needsAnalyze: boolean;
  needsReindex: boolean;
}

export class DatabaseMaintenanceService {
  private supabase = createClient();

  /**
   * Get maintenance status for tables
   */
  async getMaintenanceStatus(): Promise<MaintenanceSchedule> {
    const { data, error } = await this.supabase
      .from("maintenance_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    const lastVacuum =
      data?.find((log) => log.operation === "VACUUM")?.created_at || null;
    const lastAnalyze =
      data?.find((log) => log.operation === "ANALYZE")?.created_at || null;
    const lastReindex =
      data?.find((log) => log.operation === "REINDEX")?.created_at || null;

    // Check if maintenance is needed (run weekly)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const needsVacuum = !lastVacuum || new Date(lastVacuum) < oneWeekAgo;
    const needsAnalyze = !lastAnalyze || new Date(lastAnalyze) < oneWeekAgo;
    const needsReindex = !lastReindex || new Date(lastReindex) < oneWeekAgo;

    return {
      lastVacuum,
      lastAnalyze,
      lastReindex,
      needsVacuum,
      needsAnalyze,
      needsReindex,
    };
  }

  /**
   * Run VACUUM on specific table
   */
  async runVacuum(tableName?: string) {
    const { data, error } = await this.supabase.rpc("run_vacuum", {
      table_name: tableName || null,
    });

    if (error) throw error;

    // Log the maintenance
    await this.supabase.from("maintenance_logs").insert({
      operation: "VACUUM",
      table_name: tableName,
      status: "completed",
      created_at: new Date().toISOString(),
    });

    return data;
  }

  /**
   * Run ANALYZE on specific table
   */
  async runAnalyze(tableName?: string) {
    const { data, error } = await this.supabase.rpc("run_analyze", {
      table_name: tableName || null,
    });

    if (error) throw error;

    // Log the maintenance
    await this.supabase.from("maintenance_logs").insert({
      operation: "ANALYZE",
      table_name: tableName,
      status: "completed",
      created_at: new Date().toISOString(),
    });

    return data;
  }

  /**
   * Run REINDEX on specific table or index
   */
  async runReindex(objectName: string) {
    const { data, error } = await this.supabase.rpc("run_reindex", {
      object_name: objectName,
    });

    if (error) throw error;

    // Log the maintenance
    await this.supabase.from("maintenance_logs").insert({
      operation: "REINDEX",
      table_name: objectName,
      status: "completed",
      created_at: new Date().toISOString(),
    });

    return data;
  }

  /**
   * Get table statistics
   */
  async getTableStats() {
    const { data, error } = await this.supabase.rpc("get_table_statistics");

    if (error) throw error;
    return data;
  }

  /**
   * Schedule automatic maintenance
   */
  async scheduleMaintenance() {
    const status = await this.getMaintenanceStatus();
    const results = [];

    if (status.needsVacuum) {
      try {
        await this.runVacuum();
        results.push({ operation: "VACUUM", status: "success" });
      } catch (error) {
        results.push({ operation: "VACUUM", status: "failed", error });
      }
    }

    if (status.needsAnalyze) {
      try {
        await this.runAnalyze();
        results.push({ operation: "ANALYZE", status: "success" });
      } catch (error) {
        results.push({ operation: "ANALYZE", status: "failed", error });
      }
    }

    if (status.needsReindex) {
      // Get list of tables that might need reindexing
      const tables = await this.getTableStats();
      const largeTables = tables
        .filter((t: any) => t.total_size_mb > 100)
        .map((t: any) => t.table_name);

      for (const table of largeTables) {
        try {
          await this.runReindex(table);
          results.push({ operation: "REINDEX", status: "success", table });
        } catch (error) {
          results.push({
            operation: "REINDEX",
            status: "failed",
            table,
            error,
          });
        }
      }
    }

    return results;
  }
}
