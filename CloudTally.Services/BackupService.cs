
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;
using CloudTally.Core.Models;
using FluentFTP;
using Serilog;
using Microsoft.Data.Sqlite;

namespace CloudTally.Services
{
    public class BackupService
    {
        private readonly string _dbPath = "cloudtally.db";

        public async Task<string> CreateLocalZipAsync()
        {
            // 1. Flush SQLite connections
            SqliteConnection.ClearAllPools();

            string tempDir = Path.Combine(Path.GetTempPath(), "CloudTallyBackups");
            if (!Directory.Exists(tempDir)) Directory.CreateDirectory(tempDir);

            string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            string zipName = $"InventoryBackup_{timestamp}.zip";
            string zipPath = Path.Combine(tempDir, zipName);

            await Task.Run(() => {
                using (var archive = ZipFile.Open(zipPath, ZipArchiveMode.Create))
                {
                    // Copy DB file
                    archive.CreateEntryFromFile(_dbPath, "cloudtally.db");
                    // Copy config if exists
                    if (File.Exists("appsettings.json"))
                        archive.CreateEntryFromFile("appsettings.json", "appsettings.json");
                }
            });

            Log.Information("Local backup zip created: {ZipPath}", zipPath);
            return zipPath;
        }

        public async Task<bool> BackupToFtpAsync(BackupSettings settings, string zipPath)
        {
            try
            {
                using var client = new AsyncFtpClient(settings.FtpHost, settings.FtpUser, CredentialStorage.Unprotect(settings.FtpPassword), settings.FtpPort);
                await client.Connect();
                
                string remoteFile = Path.Combine(settings.FtpRemotePath, Path.GetFileName(zipPath));
                var status = await client.UploadFile(zipPath, remoteFile, FtpRemoteExists.Overwrite, true);
                
                return status == FtpStatus.Success;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "FTP Backup failed");
                return false;
            }
        }

        public async Task<List<BackupFileEntry>> ListFtpBackupsAsync(BackupSettings settings)
        {
            var list = new List<BackupFileEntry>();
            try {
                using var client = new AsyncFtpClient(settings.FtpHost, settings.FtpUser, CredentialStorage.Unprotect(settings.FtpPassword), settings.FtpPort);
                await client.Connect();
                var items = await client.GetListing(settings.FtpRemotePath);
                foreach (var item in items) {
                    if (item.Type == FtpObjectType.File && item.Name.EndsWith(".zip")) {
                        list.Add(new BackupFileEntry { FileName = item.Name, CreatedDate = item.Modified, Size = item.Size });
                    }
                }
            } catch (Exception ex) { Log.Error(ex, "Failed to list FTP backups"); }
            return list;
        }

        public async Task RestoreBackupAsync(string zipPath)
        {
            Log.Warning("Starting Restore from {ZipPath}", zipPath);
            
            // 1. Pre-restore safety copy
            await CreateLocalZipAsync();

            // 2. Close connections
            SqliteConnection.ClearAllPools();

            // 3. Extract and replace
            await Task.Run(() => {
                using var archive = ZipFile.OpenRead(zipPath);
                foreach (var entry in archive.Entries)
                {
                    if (entry.FullName == "cloudtally.db")
                        entry.ExtractToFile("cloudtally.db", true);
                }
            });

            Log.Information("Restore completed successfully.");
        }
    }
}