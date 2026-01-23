
using System;

namespace CloudTally.Core.Models
{
    public class BackupSettings
    {
        public bool IsAutoBackupEnabled { get; set; }
        public string Frequency { get; set; } = "Daily"; // Daily, Weekly
        public TimeSpan BackupTime { get; set; } = new TimeSpan(2, 0, 0); // 02:00 AM
        public string PreferredDestination { get; set; } = "GoogleDrive"; // GoogleDrive, FTP
        
        // FTP Settings
        public string FtpHost { get; set; }
        public int FtpPort { get; set; } = 21;
        public string FtpUser { get; set; }
        public string FtpPassword { get; set; } // Encrypted in storage
        public string FtpRemotePath { get; set; } = "/backups/";
        public bool FtpUsePassive { get; set; } = true;

        public DateTime? LastBackupDate { get; set; }
        public string LastBackupStatus { get; set; }
    }

    public class BackupFileEntry
    {
        public string FileName { get; set; }
        public string FileId { get; set; } // For Drive
        public DateTime CreatedDate { get; set; }
        public long Size { get; set; }
    }
}