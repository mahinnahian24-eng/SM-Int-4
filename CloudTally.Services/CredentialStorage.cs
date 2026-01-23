
using System;
using System.Security.Cryptography;
using System.Text;

namespace CloudTally.Services
{
    public static class CredentialStorage
    {
        private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("CloudTally-Backup-Entropy");

        public static string Protect(string clearText)
        {
            if (string.IsNullOrEmpty(clearText)) return null;
            byte[] clearBytes = Encoding.UTF8.GetBytes(clearText);
            byte[] protectedBytes = ProtectedData.Protect(clearBytes, Entropy, DataProtectionScope.CurrentUser);
            return Convert.ToBase64String(protectedBytes);
        }

        public static string Unprotect(string protectedText)
        {
            if (string.IsNullOrEmpty(protectedText)) return null;
            try {
                byte[] protectedBytes = Convert.FromBase64String(protectedText);
                byte[] clearBytes = ProtectedData.Unprotect(protectedBytes, Entropy, DataProtectionScope.CurrentUser);
                return Encoding.UTF8.GetString(clearBytes);
            } catch { return null; }
        }
    }
}