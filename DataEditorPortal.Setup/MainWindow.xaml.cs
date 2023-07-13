using Microsoft.Web.Administration;
using Setup.Models;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.AccessControl;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace Setup
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public SetupOptionModel SetupOption { get; set; } = new SetupOptionModel() { IsSetupNew = true };
        public DatabaseProvider DatabaseProvider { get; set; } = new DatabaseProvider() { Value = "SqlConnection" };

        public ObservableCollection<DatabaseConnection> ConnectionList =
            new ObservableCollection<DatabaseConnection>() {
                new DatabaseConnection() { ConnectionName = "Default" }
            };

        public UserModel Administrator { get; set; } = new UserModel();
        public SitePublishModel SitePublishModel { get; set; } = new SitePublishModel();
        public ConsoleOutputModel ConsoleOutput { get; set; } = new ConsoleOutputModel();
        public ComboBoxModel SiteNamesModel { get; set; } = new ComboBoxModel();
        public ComboBoxModel SiteApplicationsModel { get; set; } = new ComboBoxModel();

        public MainWindow()
        {
            InitializeComponent();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            if (!IsIISInstalled())
            {
                this.Close();
            }

            dataGridConnection.DataContext = ConnectionList;

            SitePublishModel.TargetFolder = $@"C:\inetpub\DataEditorPortal";
            SitePublishModel.AppPath = "DataEditorPortal";
            SitePublishModel.DefaultSchema = "DATA_EDITOR_PORTAL";

            SiteNamesModel.Items = GetAllSitesInIIS();
        }

        #region Setup Options

        private async void btnGoNext_Click(object sender, RoutedEventArgs e)
        {
            if (SetupOption.IsSetupNew)
            {
                containerInstall.Visibility = Visibility.Hidden;
                containerConnection.Visibility = Visibility.Visible;
            }
            if (SetupOption.IsUpgrade)
            {
                using (ServerManager serverManager = new ServerManager())
                {
                    var site = serverManager.Sites.FirstOrDefault(s => s.Name.Equals(SetupOption.SiteName, StringComparison.OrdinalIgnoreCase));
                    if (site == null) return;

                    var app = site.Applications.FirstOrDefault(a => a.Path.Equals(SetupOption.Application, StringComparison.OrdinalIgnoreCase));
                    if (app == null) return;

                    var appPool = serverManager.ApplicationPools.FirstOrDefault(p => p.Name.Equals(app.ApplicationPoolName, StringComparison.OrdinalIgnoreCase));
                    if (appPool == null) return;

                    var targetPath = app.VirtualDirectories["/"].PhysicalPath;
                    var indexFilePath = Path.Combine(targetPath, @"ClientApp\dist\index.html");
                    //if (!File.Exists(indexFilePath))
                    //{
                    //    MessageBox.Show("Website files were not detected. Please confirm if the website installation directory is correct.");
                    //}

                    containerInstall.Visibility = Visibility.Hidden;
                    containerOutput.Visibility = Visibility.Visible;

                    using (StreamWriter sw = File.AppendText("info.log"))
                    {
                        if (site.State != ObjectState.Stopped)
                        {
                            LogInfo($"Stop site: {SetupOption.SiteName}", sw);
                            site.Stop();
                        }

                        if (appPool.State != ObjectState.Stopped)
                        {
                            LogInfo($"Stop application pool: {SetupOption.Application}", sw);
                            appPool.Stop();
                        }
                        serverManager.CommitChanges();

                        if (Directory.Exists(Path.Combine(targetPath, "ClientApp")))
                        {
                            Directory.Delete(Path.Combine(targetPath, "ClientApp"), true);
                            LogInfo($"Remove ClientApp at: {Path.Combine(targetPath, "ClientApp")}", sw);
                        }
                    }

                    var sourcePath = AppDomain.CurrentDomain.BaseDirectory;

                    await Task.Run(async () =>
                    {
                        var retryTimes = 0;
                        while (true)
                        {
                            try
                            {
                                using (StreamWriter sw = File.AppendText("info.log"))
                                {
                                    var pattern = @"^(?!.*\\(?:appsettings(?:\.Development)?\.json|web(?:\.Development|\.Production)?\.config)$).+$";
                                    CopyFiles($"{sourcePath}\\web", targetPath, sw, pattern);
                                }
                                break;
                            }
                            catch (Exception ex)
                            {
                                //MessageBox.Show(ex.Message);
                                using (StreamWriter sw = File.AppendText("error.log"))
                                {
                                    sw.WriteLine(ex.Message);
                                }
                            }

                            retryTimes++;
                            if (retryTimes > 10) break;

                            using (StreamWriter sw = File.AppendText("info.log"))
                            {
                                LogInfo($"Could not copy files. Beginning retry {retryTimes} in 2000ms.", sw);
                            }
                            await Task.Delay(2000);
                        }
                    });

                    try
                    {
                        using (StreamWriter sw = File.AppendText("info.log"))
                        {
                            // set the base url
                            LogInfo($"Set the base url: {SetupOption.Application}", sw);
                            SetBaseElementValue(indexFilePath, $"{SetupOption.Application}/");

                            // start the website
                            LogInfo($"Start site: {SetupOption.SiteName}", sw);
                            site.Start();

                            LogInfo($"Start application pool: {SetupOption.Application}", sw);
                            appPool.Start();

                            serverManager.CommitChanges();

                            LogInfo("Upgrade Complete.", sw);
                            MessageBox.Show("Upgrade Complete.");

                            StartWebsite(SetupOption.SiteName, SetupOption.Application);
                        }
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show(ex.Message);

                        using (StreamWriter sw = File.AppendText("error.log"))
                        {
                            sw.WriteLine(ex.Message);
                        }
                    }
                }
            }
        }

        private void cmbSiteName_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            SiteApplicationsModel.Items = GetSiteApplicationsInIIS(SetupOption.SiteName);
        }

        #endregion

        #region Connections

        private void btnAddConnection_Click(object sender, RoutedEventArgs e)
        {
            var connectionWindow = new Connection();
            connectionWindow.Owner = this;
            connectionWindow.DatabaseProvider = DatabaseProvider.Value;
            connectionWindow.DatabaseConnection = new DatabaseConnection()
            {
                ConnectionName = ("New Connection " + ConnectionList.Count(c => c.ConnectionName.StartsWith("New Connection"))).Replace(" 0", ""),
                Authentication = DatabaseProvider.Value == "SqlConnection" ? "Sql Server Authentication" : "Oracle Database Native"
            };
            connectionWindow.ShowDialog();
            if (connectionWindow.DialogResult.HasValue && connectionWindow.DialogResult.Value)
            {
                var result = connectionWindow.DatabaseConnection;
                if (ConnectionList.Any(c => c.ConnectionName == result.ConnectionName))
                {
                    MessageBox.Show($"Connection {result.ConnectionName} has already exist.");
                    return;
                }
                else
                {
                    ConnectionList.Add(result);
                }
            }
        }

        private void btnConnectionBack_Click(object sender, RoutedEventArgs e)
        {
            containerInstall.Visibility = Visibility.Visible;
            containerConnection.Visibility = Visibility.Hidden;
        }

        private void btnConnectionNext_Click(object sender, RoutedEventArgs e)
        {
            foreach (var con in ConnectionList)
            {
                if (string.IsNullOrEmpty(con.ConnectionName) || string.IsNullOrEmpty(con.ConnectionString))
                {
                    MessageBox.Show(this, "Connection Name and Connection String can not be empty.");
                    return;
                }
            }

            if (DatabaseProvider.Value == "Oracle")
                SitePublishModel.DefaultSchema = ConnectionList.FirstOrDefault(c => c.ConnectionName == "Default").Username.ToUpper();

            containerPublish.Visibility = Visibility.Visible;
            containerConnection.Visibility = Visibility.Hidden;
        }

        private void dataGridRow_MouseDoubleClick(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            var row = sender as DataGridRow;
            if (row != null)
            {
                var data = row.Item as DatabaseConnection;

                var connectionWindow = new Connection();
                connectionWindow.Owner = this;
                connectionWindow.DatabaseProvider = DatabaseProvider.Value;
                connectionWindow.DatabaseConnection = new DatabaseConnection()
                {
                    ConnectionName = data.ConnectionName,
                    ConnectionString = data.ConnectionString,
                    Authentication = DatabaseProvider.Value == "SqlConnection" ? "Sql Server Authentication" : "Oracle Database Native",
                    ServerName = data.ServerName,
                    Username = data.Username,
                    Password = data.Password,
                    DatabaseName = data.DatabaseName
                };
                connectionWindow.ShowDialog();
                if (connectionWindow.DialogResult.HasValue && connectionWindow.DialogResult.Value)
                {
                    var item = ConnectionList.FirstOrDefault(c => c.ConnectionName == data.ConnectionName);
                    if (item != null)
                    {
                        var result = connectionWindow.DatabaseConnection;
                        item.ConnectionName = result.ConnectionName;
                        item.ConnectionString = result.ConnectionString;
                        item.Authentication = result.Authentication;
                        item.ServerName = result.ServerName;
                        item.Username = result.Username;
                        item.Password = result.Password;
                        item.DatabaseName = result.DatabaseName;
                    }
                }
            }
        }

        private void comboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            ConnectionList.Clear();
            ConnectionList.Add(new DatabaseConnection() { ConnectionName = "Default" });
        }

        #endregion

        #region publish setting

        private void btnBrowse_Click(object sender, RoutedEventArgs e)
        {
            using (var dialog = new System.Windows.Forms.FolderBrowserDialog())
            {
                System.Windows.Forms.DialogResult result = dialog.ShowDialog();
                if (result == System.Windows.Forms.DialogResult.OK)
                {
                    SitePublishModel.TargetFolder = dialog.SelectedPath;
                }
            }
        }

        private async void btnInstall_Click(object sender, RoutedEventArgs e)
        {
            var sourcePath = AppDomain.CurrentDomain.BaseDirectory;
            var targetPath = SitePublishModel.TargetFolder;
            var siteName = SitePublishModel.SiteName;
            var appPath = SitePublishModel.AppPath;
            string appPathWithSlash = appPath.StartsWith("/") ? appPath : $"/{appPath}";

            if (!IsValidApplicationPath(appPathWithSlash))
            {
                MessageBox.Show("The application path can not contain the following character:\n\\ ? ; : @ & = + $ , | ' < > *");
                return;
            }

            if (IsIisApplicationExists(siteName, appPathWithSlash))
            {
                MessageBox.Show("The Application Alias exists.");
                return;
            }

            containerPublish.Visibility = Visibility.Hidden;
            containerOutput.Visibility = Visibility.Visible;

            await Task.Run(() =>
            {
                using (StreamWriter sw = File.AppendText("info.log"))
                {
                    try
                    {
                        var pattern = @"^(?!.*\\(?:appsettings\.Development\.json|web(?:\.Development|\.Production){1}\.config)$).+$";
                        CopyFiles($"{sourcePath}\\web", targetPath, sw, pattern);
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show(ex.Message);
                        sw.WriteLine(ex.Message);
                    }
                }
            });

            try
            {
                using (StreamWriter sw = File.AppendText("info.log"))
                {
                    // update connection string.
                    LogInfo("Update connection string", sw);

                    var filePath = Path.Combine(targetPath, "appSettings.json");
                    string json = File.ReadAllText(filePath);
                    var resultJson = "";
                    using (MemoryStream memoryStream1 = new MemoryStream())
                    {
                        using (Utf8JsonWriter utf8JsonWriter1 = new Utf8JsonWriter(memoryStream1, new JsonWriterOptions() { Indented = true }))
                        {
                            using (JsonDocument jsonDocument = JsonDocument.Parse(json))
                            {
                                utf8JsonWriter1.WriteStartObject();

                                foreach (var element in jsonDocument.RootElement.EnumerateObject())
                                {
                                    if (element.Name == "ConnectionStrings")
                                    {
                                        utf8JsonWriter1.WritePropertyName(element.Name);

                                        // Staring new object
                                        utf8JsonWriter1.WriteStartObject();

                                        foreach (var con in ConnectionList)
                                        {
                                            utf8JsonWriter1.WritePropertyName(con.ConnectionName);
                                            utf8JsonWriter1.WriteStringValue(con.ConnectionString);
                                        }

                                        utf8JsonWriter1.WriteEndObject();
                                    }
                                    else if (element.Name == "DatabaseProvider")
                                    {
                                        utf8JsonWriter1.WritePropertyName(element.Name);
                                        utf8JsonWriter1.WriteStringValue(DatabaseProvider.Value);
                                    }
                                    else if (element.Name == "DefaultSchema")
                                    {
                                        utf8JsonWriter1.WritePropertyName(element.Name);
                                        utf8JsonWriter1.WriteStringValue(SitePublishModel.DefaultSchema);
                                    }
                                    else
                                    {
                                        element.WriteTo(utf8JsonWriter1);
                                    }
                                }

                                utf8JsonWriter1.WriteEndObject();
                            }
                        }

                        resultJson = Encoding.UTF8.GetString(memoryStream1.ToArray());
                    }
                    File.WriteAllText(filePath, resultJson);

                    // set the base url
                    LogInfo($"Set the base url: {appPathWithSlash}/", sw);
                    filePath = Path.Combine(targetPath, "ClientApp/dist/index.html");
                    SetBaseElementValue(filePath, $"{appPathWithSlash}/");

                    //CreateIISApplication
                    LogInfo($"Create IIS Application: {siteName}, {appPathWithSlash}, {targetPath}", sw);
                    CreateIISApplication(siteName, appPathWithSlash, targetPath);

                    // Grant IIS_IUSER permissions
                    LogInfo($"Grant Folder Permissions", sw);
                    GrantFolderPermissions(targetPath);

                    LogInfo($"Publish Complete.", sw);
                    MessageBox.Show("Publish Complete.");

                    // start the website
                    StartWebsite(siteName, appPathWithSlash);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);

                using (StreamWriter sw = File.AppendText("info.log"))
                {
                    sw.WriteLine(ex.Message);
                }
            }
        }

        private void btnPublishBack_Click(object sender, RoutedEventArgs e)
        {
            containerConnection.Visibility = Visibility.Visible;
            containerPublish.Visibility = Visibility.Hidden;
        }

        private List<string> GetAllSitesInIIS()
        {
            List<string> siteNames = new List<string>();

            using (ServerManager serverManager = new ServerManager())
            {
                SiteCollection sites = serverManager.Sites;

                foreach (Site site in sites)
                {
                    siteNames.Add(site.Name);
                }
            }

            return siteNames;
        }

        private List<string> GetSiteApplicationsInIIS(string siteName)
        {
            List<string> apps = new List<string>();

            using (ServerManager serverManager = new ServerManager())
            {
                Site site = serverManager.Sites.FirstOrDefault(s => s.Name.Equals(siteName, StringComparison.OrdinalIgnoreCase));

                if (site != null)
                {
                    foreach (var app in site.Applications)
                    {
                        apps.Add(app.Path);
                    }
                }
            }

            return apps;
        }

        private bool IsIisApplicationExists(string siteName, string applicationPath)
        {
            string appPathWithSlash = applicationPath.StartsWith("/") ? applicationPath : $"/{applicationPath}";

            using (ServerManager serverManager = new ServerManager())
            {
                Site site = serverManager.Sites.FirstOrDefault(s => s.Name.Equals(siteName, StringComparison.OrdinalIgnoreCase));

                if (site != null)
                {
                    ApplicationCollection applications = site.Applications;

                    foreach (Microsoft.Web.Administration.Application application in applications)
                    {
                        if (string.Equals(application.Path, appPathWithSlash, StringComparison.OrdinalIgnoreCase))
                        {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        private bool IsValidApplicationPath(string applicationPath)
        {
            // Basic validation: Check if the application path starts with a forward slash '/'
            // and does not contain any invalid characters
            if (!applicationPath.StartsWith("/") || !Regex.IsMatch(applicationPath, @"^/[\w\s\-.]*$"))
            {
                return false;
            }

            return true;
        }

        private void StartWebsite(string siteName, string appPath)
        {
            using (ServerManager serverManager = new ServerManager())
            {
                Site site = serverManager.Sites.FirstOrDefault(s => s.Name == siteName);
                if (site != null)
                {
                    Microsoft.Web.Administration.Application application = site.Applications.FirstOrDefault(a => a.Path == appPath);
                    if (application != null)
                    {
                        Binding binding = site.Bindings.FirstOrDefault();
                        if (binding != null)
                        {
                            string protocol = binding.Protocol;
                            string host = string.IsNullOrEmpty(binding.Host) ? "localhost" : binding.Host;
                            string port = binding.EndPoint.Port.ToString();

                            string encodedAppPath = Uri.EscapeDataString(appPath.Trim('/'));
                            string url = $"{protocol}://{host}:{port}/{encodedAppPath}";

                            // Start a new browser window that opens the URL
                            Process.Start(new ProcessStartInfo("cmd.exe", $"/c start {url}") { CreateNoWindow = true });
                        }
                        else
                        {
                            Console.WriteLine($"No binding found for site '{siteName}'.");
                        }
                    }
                    else
                    {
                        Console.WriteLine($"Application '{appPath}' not found in site '{siteName}'.");
                    }
                }
                else
                {
                    Console.WriteLine($"Site '{siteName}' not found.");
                }
            }
        }

        private void SetBaseElementValue(string filePath, string baseValue)
        {
            // Read the contents of the HTML file
            string html = File.ReadAllText(filePath);

            // Find the start and end positions of the <base> tag
            int startIndex = html.IndexOf("<base");
            int endIndex = html.IndexOf(">", startIndex);

            if (startIndex != -1 && endIndex != -1)
            {
                // Extract the existing base tag content
                string baseTag = html.Substring(startIndex, endIndex - startIndex + 1);

                // Replace the href attribute value
                baseTag = Regex.Replace(baseTag, @"href\s*=\s*""([^""]*)""", $"href=\"{baseValue}\"");

                // Replace the original base tag with the updated one
                html = html.Remove(startIndex, endIndex - startIndex + 1).Insert(startIndex, baseTag);
            }
            else
            {
                // If the <base> tag doesn't exist, create a new one
                string newBaseTag = $"<base href=\"{baseValue}\">";
                html = html.Insert(html.IndexOf("<head>") + 6, newBaseTag);
            }

            // Save the modified HTML back to the file
            File.WriteAllText(filePath, html);
        }

        public void CopyFiles(string sourceFolder, string destinationFolder, StreamWriter sw, string filePattern = null)
        {
            DirectoryInfo sourceDir = new DirectoryInfo(sourceFolder);
            DirectoryInfo destinationDir = new DirectoryInfo(destinationFolder);

            if (!sourceDir.Exists)
            {
                throw new DirectoryNotFoundException($"Source folder '{sourceFolder}' does not exist.");
            }

            if (!destinationDir.Exists)
            {
                destinationDir.Create();
            }

            FileInfo[] files = sourceDir.GetFiles();

            foreach (FileInfo file in files)
            {
                if (filePattern != null && !Regex.IsMatch(file.FullName, filePattern, RegexOptions.IgnoreCase)) continue;

                string destinationFilePath = Path.Combine(destinationDir.FullName, file.Name);
                file.CopyTo(destinationFilePath, true);

                LogInfo(destinationFilePath, sw);
            }

            DirectoryInfo[] subDirectories = sourceDir.GetDirectories();

            foreach (DirectoryInfo subDirectory in subDirectories)
            {
                string newDestinationFolder = Path.Combine(destinationDir.FullName, subDirectory.Name);
                CopyFiles(subDirectory.FullName, newDestinationFolder, sw);
            }
        }

        private void CreateIISApplication(string siteName, string appPath, string targetPath)
        {
            using (ServerManager serverManager = new ServerManager())
            {
                Site site = serverManager.Sites.FirstOrDefault(s => s.Name.Equals(siteName, StringComparison.OrdinalIgnoreCase));

                if (site != null)
                {
                    string appPathWithSlash = appPath.StartsWith("/") ? appPath : $"/{appPath}";
                    string physicalPath = targetPath.TrimEnd('\\');

                    var applicationPoolName = $"{site.Applications["/"].ApplicationPoolName}_{appPathWithSlash.Trim('/')}";
                    var applicationPool = serverManager.ApplicationPools.Add(applicationPoolName);
                    applicationPool.ManagedRuntimeVersion = "";
                    TimeSpan timeout = TimeSpan.FromMinutes(1740);
                    applicationPool.ProcessModel.IdleTimeout = timeout;
                    applicationPool.Recycling.PeriodicRestart.Time = timeout;

                    Microsoft.Web.Administration.Application application = site.Applications.Add(appPathWithSlash, physicalPath);
                    application.ApplicationPoolName = applicationPool.Name;

                    serverManager.CommitChanges();
                }
            }
        }

        private bool IsIISInstalled()
        {
            try
            {
                using (ServerManager serverManager = new ServerManager())
                {
                    // Accessing the Sites collection to check if IIS is installed
                    // If IIS is installed, accessing the Sites collection should succeed
                    SiteCollection sites = serverManager.Sites;

                    // If the Sites collection is accessible, IIS is installed
                    return true;
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                MessageBox.Show("Please run with administrative privileges.");
                return false;
            }
            catch (Exception ex)
            {
                using (StreamWriter sw = File.AppendText("error.log"))
                {
                    sw.WriteLine("IIS is not installed. Please install it first.");
                    sw.WriteLine(ex.Message);
                }
                // If an exception occurs while accessing the Sites collection, IIS is not installed

                MessageBox.Show("IIS is not installed. Please install it first.");

                return false;
            }
        }

        private void LogInfo(string msg, StreamWriter sw)
        {
            sw.WriteLine(msg);
            ConsoleOutput.Text += $"{msg}\r\n";
            scrollViewerOutput.Dispatcher.Invoke(new Action(() => { scrollViewerOutput.ScrollToBottom(); }));
        }

        public void GrantFolderPermissions(string folderPath)
        {
            // Get the DirectoryInfo object for the folder
            DirectoryInfo directoryInfo = new DirectoryInfo(folderPath);

            // Get the existing access control for the folder
            DirectorySecurity directorySecurity = directoryInfo.GetAccessControl();

            // Create a rule to grant full control permission to the "Everyone" group
            FileSystemAccessRule accessRule = new FileSystemAccessRule("IIS_IUSRS",
                FileSystemRights.FullControl,
                InheritanceFlags.ContainerInherit | InheritanceFlags.ObjectInherit,
                PropagationFlags.None,
                AccessControlType.Allow);

            // Add the access rule to the access control list
            directorySecurity.AddAccessRule(accessRule);

            // Set the modified access control list back to the folder
            directoryInfo.SetAccessControl(directorySecurity);
        }

        #endregion
    }

    public class ConsoleOutputModel : NotifyPropertyObject
    {
        private string _text;
        public string Text
        {
            get { return _text; }
            set
            {
                _text = value;
                OnPropertyChanged("Text");
            }
        }
    }

}
