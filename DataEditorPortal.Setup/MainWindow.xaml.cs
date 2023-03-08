using Setup.Models;
using System;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;

namespace Setup
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {

        public ObservableCollection<DatabaseConnection> ConnectionList =
            new ObservableCollection<DatabaseConnection>() {
                new DatabaseConnection() { ConnectionName = "Default" }
            };

        public UserModel Administrator { get; set; } = new UserModel();
        public SitePublishModel SitePublishModel { get; set; } = new SitePublishModel();
        public ConsoleOutputModel ConsoleOutput { get; set; } = new ConsoleOutputModel();

        public MainWindow()
        {
            InitializeComponent();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            dataGridConnection.DataContext = ConnectionList;

            SitePublishModel.TargetFolder = $@"C:\inetpub\DataEditorPortal";
            SitePublishModel.SiteName = "Data Editor Portal";
            SitePublishModel.SitePort = "80";
            SitePublishModel.SiteDomain = "example.com";
        }

        #region Connections

        private void btnAddConnection_Click(object sender, RoutedEventArgs e)
        {
            var connectionWindow = new Connection();
            connectionWindow.Owner = this;
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
                connectionWindow.DatabaseConnection = new DatabaseConnection()
                {
                    ConnectionName = data.ConnectionName,
                    ConnectionString = data.ConnectionString
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
                    }
                }
            }
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
            containerPublish.Visibility = Visibility.Hidden;
            containerOutput.Visibility = Visibility.Visible;

            var sourcePath = @"C:\Users\Administrator\source\repos\DataEditorPortal";
            var siteName = SitePublishModel.SiteName;
            var sitePort = SitePublishModel.SitePort;
            var targetPath = SitePublishModel.TargetFolder;

            var process = new Process();
            process.StartInfo.WorkingDirectory = Path.Combine(sourcePath, "DataEditorPortal");
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
                    sw.WriteLine($@"dotnet publish ""DataEditorPortal.Web.csproj"" --configuration Release /p:PublishProfile=Production --output ""{targetPath}""");
                    sw.WriteLine(@"cd c:\Windows\System32\inetsrv");
                    sw.WriteLine($@"appcmd add apppool /name:""{siteName}""");
                    sw.WriteLine($@"appcmd add site /name:""{siteName}"" /physicalPath:""{targetPath}"" /bindings:http://*:{sitePort}");
                    sw.WriteLine($@"appcmd set site ""{siteName}"" /[path='/'].applicationPool:""{siteName}""");
                    sw.WriteLine($@"appcmd set config ""{siteName}"" /section:windowsAuthentication /enabled:true /commit:apphost");
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

            MessageBox.Show("Publish Complete.");

            Process.Start(new ProcessStartInfo("cmd.exe", $"/c start http://localhost:{SitePublishModel.SitePort}") { CreateNoWindow = true });
        }

        private void Process_ErrorDataReceived(object sender, DataReceivedEventArgs e)
        {
            if (e.Data != null)
            {
                ConsoleOutput.Text += $"{e.Data}\r\n";
                scrollViewerOutput.Dispatcher.Invoke(new Action(() => { scrollViewerOutput.ScrollToBottom(); }));
            }
        }

        private void Process_OutputDataReceived(object sender, DataReceivedEventArgs e)
        {
            if (e.Data != null)
            {
                ConsoleOutput.Text += $"{e.Data}\r\n";
                scrollViewerOutput.Dispatcher.Invoke(new Action(() => { scrollViewerOutput.ScrollToBottom(); }));
            }
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
