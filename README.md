
# SM INTERNATIONAL - Inventory & Accounting System

Professional WPF application built with .NET 8 and MVVM.

## Prerequisites
- **IDE**: Microsoft Visual Studio 2022 (v17.8 or newer)
- **Workload**: ".NET Desktop Development"
- **Runtime**: .NET 8.0 SDK

## How to Build & Run
1. Clone the repository.
2. Open `SMInternational.sln` in Visual Studio.
3. Right-click the Solution in Solution Explorer -> **Restore NuGet Packages**.
4. Set `SMInternational` as the Startup Project.
5. Press `F5` to build and run.

## Database Management
- The app uses **SQLite**. On the first run, `cloudtally.db` will be created automatically in the bin folder.
- If you change the Models in `Entities.cs`, run the following in **Package Manager Console**:
  ```powershell
  Add-Migration <Description>
  Update-Database
  ```

## SMS Integration (Twilio)
1. Go to **Settings** -> **Company Profile**.
2. Enter your Twilio SID and From Number.
3. The Auth Token is stored securely using **Windows DPAPI**.

## Exporting Reports
Reports can be exported to Excel using the **ClosedXML** library integrated into the Reports view.
