
using System;
using System.IO;
using System.Threading.Tasks;
using CloudTally.Core.Models;
using FluentFTP;
using Serilog;

namespace CloudTally.Services
{
    public class FtpBackupService
    {
        public async Task<bool> UploadAsync(BackupSettings settings, string localPath)
        {
            try
            {
                string pass = CredentialStorage.Unprotect(settings.FtpPasswordEncrypted);
                using var client = new AsyncFtpClient(settings.FtpHost, settings.FtpUser, pass, settings.FtpPort);
                
                if (settings.FtpUseSsl)
                    client.Config.EncryptionMode = FtpEncryptionMode.Explicit;

                await client.Connect();
                
                if (!await client.DirectoryExists(settings.FtpRemoteFolder))
                    await client.CreateDirectory(settings.FtpRemoteFolder);

                string remoteName = Path.Combine(settings.FtpRemoteFolder, Path.GetFileName(localPath));
                var status = await client.UploadFile(localPath, remoteName, FtpRemoteExists.Overwrite, true);

                return status == FtpStatus.Success;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "FTP Upload Failed");
                return false;
            }
        }

        public async Task<bool> TestConnection(string host, int port, string user, string pass)
        {
            try {
                using var client = new AsyncFtpClient(host, user, pass, port);
                await client.Connect();
                return client.IsConnected;
            } catch { return false; }
        }
    }
}
