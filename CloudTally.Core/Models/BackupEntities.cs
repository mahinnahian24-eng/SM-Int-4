
using System;
using System.ComponentModel.DataAnnotations;

namespace CloudTally.Core.Models
{
    public enum BackupDestination { GoogleDrive, FTP }

    public class BackupSettings
    {
        [Key] public int Id { get; set; } = 1;
        public bool AutoBackupEnabled { get; set; } = false;
        public BackupDestination AutoBackupDestination { get; set; } = BackupDestination.GoogleDrive;
        public int CooldownMinutes { get; set; } = 5;
        public DateTime? LastBackupTime { get; set; }
        public string LastBackupResult { get; set; }

        // FTP Details
        public string FtpHost { get; set; }
        public int FtpPort { get; set; } = 21;
        public string FtpUser { get; set; }
        public string FtpPasswordEncrypted { get; set; }
        public string FtpRemoteFolder { get; set; } = "/InventoryBackups/";
        public bool FtpPassiveMode { get; set; } = true;
        public bool FtpUseSsl { get; set; } = false;
    }

    public class BackupLog
    {
        public int Id { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public string Destination { get; set; }
        public string Status { get; set; }
        public string FileName { get; set; }
        public string ErrorMessage { get; set; }
    }
}
