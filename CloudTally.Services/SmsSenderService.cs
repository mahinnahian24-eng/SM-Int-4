
using System;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Serilog;

namespace CloudTally.Services
{
    public class SmsSenderService
    {
        public async Task<(bool success, string messageId, string error)> SendSmsAsync(
            string sid, string tokenEncrypted, string from, string to, string message)
        {
            try
            {
                string token = CredentialStorage.Unprotect(tokenEncrypted);
                TwilioClient.Init(sid, token);

                var msg = await MessageResource.CreateAsync(
                    body: message,
                    from: new Twilio.Types.PhoneNumber(from),
                    to: new Twilio.Types.PhoneNumber(to)
                );

                Log.Information("SMS sent to {To}, ID: {Id}", to, msg.Sid);
                return (true, msg.Sid, null);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Failed to send SMS to {To}", to);
                return (false, null, ex.Message);
            }
        }
    }
}
