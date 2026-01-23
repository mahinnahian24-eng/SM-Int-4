
using System;
using System.Linq;
using System.Threading.Tasks;
using CloudTally.Core.Models;
using CloudTally.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudTally.Services
{
    public class AuthService
    {
        public static User CurrentUser { get; private set; }

        public async Task<bool> LoginAsync(string username, string password)
        {
            using var db = new TallyDbContext();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username && u.IsActive);
            
            // Note: Use proper password hashing like BCrypt.Net-Next in production
            if (user != null && user.PasswordHash == password)
            {
                CurrentUser = user;
                return true;
            }
            return false;
        }

        public bool CheckPermission(UserRole requiredRole)
        {
            if (CurrentUser == null) return false;
            if (CurrentUser.Role == UserRole.Admin) return true;
            return CurrentUser.Role == requiredRole;
        }
    }
}
