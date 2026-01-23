
using System;
using System.IO;
using System.Windows;
using Serilog;
using System.Threading.Tasks;
using CloudTally.Data;

namespace CloudTally.App
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            // Set base directory to ensure relative paths work regardless of launch method
            Directory.SetCurrentDirectory(AppDomain.CurrentDomain.BaseDirectory);

            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .WriteTo.File("logs/sminternational_.txt", rollingInterval: RollingInterval.Day)
                .CreateLogger();

            Log.Information("SM INTERNATIONAL Application Starting...");

            // 1. UI Thread Exceptions
            this.DispatcherUnhandledException += (s, ex) => 
            {
                Log.Fatal(ex.Exception, "Dispatcher Unhandled Exception");
                MessageBox.Show("A UI error occurred. Details logged. \n\n" + ex.Exception.Message, "SM International Error", MessageBoxButton.OK, MessageBoxImage.Error);
                ex.Handled = true;
            };

            // 2. Non-UI Thread Exceptions
            AppDomain.CurrentDomain.UnhandledException += (s, ex) =>
            {
                Log.Fatal((Exception)ex.ExceptionObject, "AppDomain Unhandled Exception");
                MessageBox.Show("A critical system error occurred. The application will close.", "Fatal Error", MessageBoxButton.OK, MessageBoxImage.Stop);
            };

            // 3. Task Exceptions
            TaskScheduler.UnobservedTaskException += (s, ex) =>
            {
                Log.Error(ex.Exception, "Unobserved Task Exception");
                ex.SetObserved();
            };

            base.OnStartup(e);
            
            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            try 
            {
                using var db = new TallyDbContext();
                // Ensure directory exists for SQLite
                var dbFile = new FileInfo("cloudtally.db");
                if (!dbFile.Directory!.Exists) dbFile.Directory.Create();
                
                db.Database.EnsureCreated();
                Log.Information("Database and schema verified.");
            }
            catch(Exception ex)
            {
                Log.Fatal(ex, "Database initialization failed. Possible file lock or permissions issue.");
                MessageBox.Show("Could not initialize database. Ensure you have write permissions to the application folder.", "DB Error", MessageBoxButton.OK, MessageBoxImage.Error);
                Environment.Exit(1);
            }
        }
        
        protected override void OnExit(ExitEventArgs e)
        {
            Log.Information("SM INTERNATIONAL Application Closing Cleanly.");
            Log.CloseAndFlush();
            base.OnExit(e);
        }
    }
}
