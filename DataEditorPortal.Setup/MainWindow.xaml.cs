using Microsoft.Web.Administration;
using Setup.Models;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;

namespace Setup
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public DatabaseProvider DatabaseProvider { get; set; } = new DatabaseProvider() { Value = "SqlConnection" };

        public ObservableCollection<DatabaseConnection> ConnectionList =
            new ObservableCollection<DatabaseConnection>() {
                new DatabaseConnection() { ConnectionName = "Default" }
            };

        public UserModel Administrator { get; set; } = new UserModel();
        public SitePublishModel SitePublishModel { get; set; } = new SitePublishModel();
        public ConsoleOutputModel ConsoleOutput { get; set; } = new ConsoleOutputModel();

        public ComboBoxModel SiteNamesModel { get; set; } = new ComboBoxModel();

        public MainWindow()
        {
            InitializeComponent();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            dataGridConnection.DataContext = ConnectionList;

            SitePublishModel.TargetFolder = $@"C:\inetpub\DataEditorPortal";
            SitePublishModel.AppPath = "Data Editor Portal";

            SiteNamesModel.SiteNames = GetAllSitesInIIS();
        }

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

            containerAdmin.Visibility = Visibility.Visible;
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

        #region Administrator setting

        [System.Runtime.InteropServices.DllImport("advapi32.dll")]
        private static extern bool LogonUser(string userName, string domainName, string password, int LogonType, int LogonProvider, ref IntPtr phToken);

        private bool IsValidateCredentials(string userName, string password, string domain)
        {
            IntPtr tokenHandler = IntPtr.Zero;
            bool isValid = LogonUser(userName, domain, password, 3, 0, ref tokenHandler);
            return isValid;
        }

        private void btnAdminNext_Click(object sender, RoutedEventArgs e)
        {
            if (!IsAdministratorValid()) return;

            if (!IsValidateCredentials(Administrator.Username, Administrator.Password, ".\\"))
            {
                MessageBox.Show("Username or password is not correct. ");
                return;
            }

            containerAdmin.Visibility = Visibility.Hidden;
            containerPublish.Visibility = Visibility.Visible;
        }

        private void btnAdminBack_Click(object sender, RoutedEventArgs e)
        {
            containerAdmin.Visibility = Visibility.Hidden;
            containerConnection.Visibility = Visibility.Visible;
        }

        private bool IsAdministratorValid()
        {
            textUsername.GetBindingExpression(TextBox.TextProperty).UpdateSource();
            textPassword.GetBindingExpression(PasswordHelper.PasswordProperty).UpdateSource();
            return !Validation.GetHasError(textUsername) && !Validation.GetHasError(textPassword);
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

        private void btnInstall_Click(object sender, RoutedEventArgs e)
        {
            var sourcePath = AppDomain.CurrentDomain.BaseDirectory;
            var targetPath = SitePublishModel.TargetFolder;
            var siteName = SitePublishModel.SiteName;
            var appPath = SitePublishModel.AppPath;

            if (!IsValidApplicationPath($@"/{appPath}"))
            {
                MessageBox.Show("The application path can not contain the following character:\n\\ ? ; : @ & = + $ , | ' < > *");
                return;
            }

            if (IsIisApplicationExists(siteName, $@"/{appPath}"))
            {
                MessageBox.Show("The Application Alias exists.");
                return;
            }

            containerPublish.Visibility = Visibility.Hidden;
            containerOutput.Visibility = Visibility.Visible;

            var process = new Process();
            process.StartInfo.WorkingDirectory = Path.Combine(sourcePath);
            process.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
            process.StartInfo.FileName = "cmd.exe";
            //process.StartInfo.Arguments = $@"/C {cmd} ";
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.CreateNoWindow = true;
            process.StartInfo.RedirectStandardOutput = true;
            process.StartInfo.RedirectStandardInput = true;

            process.EnableRaisingEvents = true;
            process.OutputDataReceived += Process_OutputDataReceived;
            process.ErrorDataReceived += Process_ErrorDataReceived;
            process.Exited += Process_Exited;
            process.Start();
            process.BeginOutputReadLine();

            using (StreamWriter sw = process.StandardInput)
            {
                if (sw.BaseStream.CanWrite)
                {
                    sw.WriteLine($@"xcopy ""{sourcePath}\web"" ""{targetPath}"" /I /R /Y /S /E");
                    sw.WriteLine(@"cd %systemroot%\System32\inetsrv");
                    sw.WriteLine($@"appcmd add app /site.name:""{siteName}"" /path:""/{appPath}"" /physicalPath:""{targetPath}""");
                }
            }
        }

        private void btnPublishBack_Click(object sender, RoutedEventArgs e)
        {
            containerAdmin.Visibility = Visibility.Visible;
            containerPublish.Visibility = Visibility.Hidden;
        }

        private void Process_Exited(object sender, EventArgs e)
        {
            // update connection string.
            var filePath = Path.Combine(SitePublishModel.TargetFolder, "appSettings.json");
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
            filePath = Path.Combine(SitePublishModel.TargetFolder, "ClientApp/dist/index.html");
            SetBaseElementValue(filePath, $"/{SitePublishModel.AppPath}/");

            MessageBox.Show("Publish Complete.");

            // start the website
            StartWebsite(SitePublishModel.SiteName, SitePublishModel.AppPath);
        }

        private void Process_ErrorDataReceived(object sender, DataReceivedEventArgs e)
        {
            if (e.Data != null)
            {
                ConsoleOutput.Text += $"{e.Data}\r\n";
                scrollViewerOutput.Dispatcher.Invoke(new Action(() => { scrollViewerOutput.ScrollToBottom(); }));

                using (StreamWriter sw = File.AppendText("error.log"))
                {
                    sw.WriteLine(e.Data);
                }
            }
        }

        private void Process_OutputDataReceived(object sender, DataReceivedEventArgs e)
        {
            if (e.Data != null)
            {
                ConsoleOutput.Text += $"{e.Data}\r\n";
                scrollViewerOutput.Dispatcher.Invoke(new Action(() => { scrollViewerOutput.ScrollToBottom(); }));

                using (StreamWriter sw = File.AppendText("info.log"))
                {
                    sw.WriteLine(e.Data);
                }
            }
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

        private bool IsIisApplicationExists(string siteName, string applicationPath)
        {
            using (ServerManager serverManager = new ServerManager())
            {
                Site site = serverManager.Sites.FirstOrDefault(s => s.Name.Equals(siteName, StringComparison.OrdinalIgnoreCase));

                if (site != null)
                {
                    ApplicationCollection applications = site.Applications;

                    foreach (Microsoft.Web.Administration.Application application in applications)
                    {
                        if (string.Equals(application.Path, applicationPath, StringComparison.OrdinalIgnoreCase))
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
                    Microsoft.Web.Administration.Application application = site.Applications.FirstOrDefault(a => a.Path.Trim('/') == appPath.Trim('/'));
                    if (application != null)
                    {
                        Binding binding = site.Bindings.FirstOrDefault();
                        if (binding != null)
                        {
                            string protocol = binding.Protocol;
                            string host = string.IsNullOrEmpty(binding.Host) ? "localhost" : binding.Host;
                            string port = binding.EndPoint.Port.ToString();

                            string encodedAppPath = Uri.EscapeDataString(appPath);
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

        public void SetBaseElementValue(string filePath, string baseValue)
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
