
using System;
using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;
using CloudTally.Core.Models;
using CloudTally.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace CloudTally.Services
{
    public class BackupOrchestrator
    {
        private static readonly Lazy<BackupOrchestrator> _instance = new(() => new BackupOrchestrator());
        public static BackupOrchestrator Instance => _instance.Value;

        private readonly string _dbPath = "cloudtally.db";
        private readonly FtpBackupService _ftpService = new();
        private readonly GoogleDriveService _driveService = new();

        public async Task RunBackup(BackupDestination destination, bool isAuto = false)
        {
            using var db = new TallyDbContext();
            var settings = await db.BackupSettings.FirstOrDefaultAsync();
            
            string zipPath = "";
            try
            {
                Log.Information("Starting {Type} backup to {Dest}", isAuto ? "Auto" : "Manual", destination);
                zipPath = await CreateZipBackup();

                bool success = false;
                if (destination == BackupDestination.GoogleDrive)
                    success = await _driveService.BackupDatabaseAsync(zipPath);
                else
                    success = await _ftpService.UploadAsync(settings, zipPath);

                // Update settings & history
                if (settings != null)
                {
                    settings.LastBackupTime = DateTime.Now;
                    settings.LastBackupResult = success ? "Success" : "Failed";
                    db.BackupLogs.Add(new BackupLog { 
                        Destination = destination.ToString(), 
                        Status = success ? "Success" : "Failed",
                        FileName = Path.GetFileName(zipPath)
                    });
                    await db.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Backup Orchestration Error");
            }
            finally
            {
                if (!string.IsNullOrEmpty(zipPath) && File.Exists(zipPath))
                    File.Delete(zipPath);
            }
        }

        private async Task<string> CreateZipBackup()
        {
            // Close pool to allow file copying
            SqliteConnection.ClearAllPools();

            string tempDir = Path.Combine(Path.GetTempPath(), "CloudTally_SafeCopy");
            if (!Directory.Exists(tempDir)) Directory.CreateDirectory(tempDir);

            string tempDb = Path.Combine(tempDir, "temp_cloudtally.db");
            string zipPath = Path.Combine(tempDir, $"InventoryBackup_{DateTime.Now:yyyyMMdd_HHmmss}.zip");

            // Safe Copy
            File.Copy(_dbPath, tempDb, true);

            await Task.Run(() => {
                using var archive = ZipFile.Open(zipPath, ZipArchiveMode.Create);
                archive.CreateEntryFromFile(tempDb, "cloudtally.db");
            });

            File.Delete(tempDb);
            return zipPath;
        }
    }
}
