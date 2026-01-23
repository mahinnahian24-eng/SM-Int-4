
using System;
using System.Threading;
using System.Threading.Tasks;
using CloudTally.Core.Models;
using Serilog;

namespace CloudTally.Services
{
    public class BackupSchedulerService
    {
        private Timer _timer;
        private readonly BackupService _backupService = new();
        private readonly GoogleDriveService _googleDriveService = new();
        
        public void Start()
        {
            // Check every 1 hour
            _timer = new Timer(async _ => await CheckAndRunBackup(), null, TimeSpan.Zero, TimeSpan.FromHours(1));
            Log.Information("Backup Scheduler started.");
        }

        private async Task CheckAndRunBackup()
        {
            // Logic: Compare current time with Scheduled time and LastBackupDate
            // If Due, run backup to preferred destination
            Log.Debug("Checking for scheduled backup...");
        }

        public async Task RunBackupNowAsync(string destination, BackupSettings settings)
        {
            try {
                string zipPath = await _backupService.CreateLocalZipAsync();
                
                bool success = false;
                if (destination == "GoogleDrive")
                    success = await _googleDriveService.BackupDatabaseAsync(zipPath);
                else
                    success = await _backupService.BackupToFtpAsync(settings, zipPath);

                Log.Information("Manual backup to {Dest} result: {Success}", destination, success);
                
                // Cleanup temp zip
                if (File.Exists(zipPath)) File.Delete(zipPath);
            } catch (Exception ex) {
                Log.Error(ex, "Backup run failed");
            }
        }
    }
}