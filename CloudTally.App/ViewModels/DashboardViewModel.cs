
using System;
using System.Threading.Tasks;
using CloudTally.App.ViewModels;
using CommunityToolkit.Mvvm.Input;
using Serilog;

namespace CloudTally.App.ViewModels
{
    public class DashboardViewModel : BaseViewModel
    {
        public IAsyncRelayCommand NewSaleCommand { get; }
        public IAsyncRelayCommand NewLedgerCommand { get; }

        public DashboardViewModel()
        {
            NewSaleCommand = new AsyncRelayCommand(OnNewSale);
            NewLedgerCommand = new AsyncRelayCommand(OnNewLedger);
        }

        private async Task OnNewSale()
        {
            Log.Information("Dashboard Quick Action: New Sale clicked");
            // Navigation logic to Vouchers page in New mode
            await Task.CompletedTask;
        }

        private async Task OnNewLedger()
        {
            Log.Information("Dashboard Quick Action: New Ledger clicked");
            // Navigation logic to Masters page / open Add Ledger dialog
            await Task.CompletedTask;
        }
    }
}
