
using System;
using System.Linq;
using System.Threading.Tasks;
using CloudTally.Core.Models;
using CloudTally.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudTally.Services
{
    public class ReminderService
    {
        private readonly TallyDbContext _db;
        private readonly SmsSenderService _smsService;

        public ReminderService()
        {
            _db = new TallyDbContext();
            _smsService = new SmsSenderService();
        }

        public async Task<decimal> GetOutstandingBalanceAsync(int ledgerId)
        {
            var entries = await _db.LedgerEntries
                .Where(e => e.LedgerId == ledgerId)
                .ToListAsync();
            
            return entries.Sum(e => e.Debit) - entries.Sum(e => e.Credit);
        }

        public string DraftReminder(string customerName, decimal amount, string currency)
        {
            return $"Dear {customerName}, this is a friendly reminder from SM INTERNATIONAL. Your outstanding due amount is {currency} {amount:N2}. Please pay at your earliest convenience. Thank you.";
        }

        public async Task<bool> SendAndLogReminderAsync(int ledgerId, string phone, string message)
        {
            var profile = await _db.CompanyProfiles.FirstOrDefaultAsync();
            if (profile == null || string.IsNullOrEmpty(profile.TwilioSid))
                throw new Exception("Twilio is not configured in Settings.");

            var result = await _smsService.SendSmsAsync(
                profile.TwilioSid, profile.TwilioTokenEncrypted, 
                profile.TwilioFromNumber, phone, message);

            var history = new MessageHistory
            {
                LedgerId = ledgerId,
                Phone = phone,
                MessageText = message,
                Status = result.success ? "Sent" : "Failed",
                ProviderMessageId = result.messageId,
                ErrorMessage = result.error
            };

            _db.MessageHistories.Add(history);
            await _db.SaveChangesAsync();

            return result.success;
        }
    }
}
