
using System;
using System.IO;
using System.IO.Compression;
using System.Threading;
using System.Threading.Tasks;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Google.Apis.Util.Store;

namespace CloudTally.Services
{
    public class GoogleDriveService
    {
        private readonly string[] Scopes = { DriveService.Scope.DriveFile };
        private readonly string ApplicationName = "CloudTally";

        public async Task<bool> BackupDatabaseAsync(string dbPath)
        {
            try
            {
                UserCredential credential;
                using (var stream = new FileStream("client_secrets.json", FileMode.Open, FileAccess.Read))
                {
                    string credPath = "token.json";
                    credential = await GoogleWebAuthorizationBroker.AuthorizeAsync(
                        GoogleClientSecrets.FromStream(stream).Secrets,
                        Scopes,
                        "user",
                        CancellationToken.None,
                        new FileDataStore(credPath, true));
                }

                var service = new DriveService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = ApplicationName,
                });

                string zipPath = $"Backup_{DateTime.Now:yyyyMMdd_HHmm}.zip";
                using (var archive = ZipFile.Open(zipPath, ZipArchiveMode.Create))
                {
                    archive.CreateEntryFromFile(dbPath, "cloudtally.db");
                }

                var fileMetadata = new Google.Apis.Drive.v3.Data.File()
                {
                    Name = zipPath,
                    Parents = new[] { "root" }
                };

                FilesResource.CreateMediaUpload request;
                using (var stream = new FileStream(zipPath, FileMode.Open))
                {
                    request = service.Files.Create(fileMetadata, stream, "application/zip");
                    request.Fields = "id";
                    await request.UploadAsync();
                }

                File.Delete(zipPath); // Cleanup local zip
                return true;
            }
            catch (Exception ex)
            {
                // Log via Serilog: Log.Error(ex, "Backup failed");
                return false;
            }
        }
    }
}
