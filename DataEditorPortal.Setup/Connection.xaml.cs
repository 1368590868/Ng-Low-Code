using Oracle.ManagedDataAccess.Client;
using Setup.Models;
using System;
using System.Data.Common;
using System.Data.SqlClient;
using System.Security.Principal;
using System.Windows;
using System.Windows.Controls;

namespace Setup
{
    /// <summary>
    /// Interaction logic for Connection.xaml
    /// </summary>
    public partial class Connection : Window
    {
        public Connection()
        {
            InitializeComponent();
        }

        public string DatabaseProvider { get; set; }
        public DatabaseConnection DatabaseConnection { get; set; } = new DatabaseConnection() { };

        private void btnSave_Click(object sender, RoutedEventArgs e)
        {
            if (!IsModelValid())
                return;

            try
            {
                DatabaseConnection.ConnectionString = GetConnectionString();

                using (DbConnection con = DatabaseProvider == "SqlConnection" ? new SqlConnection() : new OracleConnection())
                {
                    con.ConnectionString = DatabaseConnection.ConnectionString;
                    con.Open();
                    con.Close();
                }

                this.DialogResult = true;
                this.Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
                return;
            }
        }

        private bool IsModelValid()
        {
            textName.GetBindingExpression(TextBox.TextProperty).UpdateSource();
            textHost.GetBindingExpression(TextBox.TextProperty).UpdateSource();
            textUsername.GetBindingExpression(TextBox.TextProperty).UpdateSource();
            textPassword.GetBindingExpression(PasswordHelper.PasswordProperty).UpdateSource();
            cmbDataBaseName.GetBindingExpression(ComboBoxHelper.SelectedValueAndTextProperty).UpdateSource();
            return !Validation.GetHasError(textName)
                && !Validation.GetHasError(textHost)
                && !Validation.GetHasError(textUsername)
                && !Validation.GetHasError(textPassword)
                && !Validation.GetHasError(cmbDataBaseName);
        }

        private string GetConnectionString()
        {
            var con = DatabaseConnection;

            if (DatabaseProvider == "SqlConnection")
            {
                var builder = new SqlConnectionStringBuilder();
                builder.DataSource = con.ServerName;

                if (con.Authentication == "WindowsAuthentication")
                {
                    builder.IntegratedSecurity = true;
                }
                else
                {
                    builder.UserID = con.Username;
                    builder.Password = con.Password;
                }
                builder.InitialCatalog = con.DatabaseName;

                return builder.ToString();
            }
            else
            {
                var host = con.ServerName;
                var port = "1521";

                var strArray = con.ServerName.Split(':');
                if (strArray.Length == 2)
                {
                    host = strArray[0];
                    port = strArray[1];
                }

                var builder = new OracleConnectionStringBuilder();

                builder.DataSource = $"(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST={host})(PORT={port})))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME={con.DatabaseName})));";

                if (con.Authentication == "OS Authentication")
                {
                    // get from current server.
                    builder.UserID = con.Username;
                    builder.Password = con.Password;
                }
                else
                {
                    builder.UserID = con.Username;
                    builder.Password = con.Password;
                }

                return builder.ToString();
            }
        }

        private void comboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (DatabaseConnection.IsNotWindowsAuth)
            {
                DatabaseConnection.Username = string.Empty;
                DatabaseConnection.Password = string.Empty;
            }
            else
            {
                WindowsIdentity identity = WindowsIdentity.GetCurrent();
                DatabaseConnection.Username = identity.Name;
                DatabaseConnection.Password = string.Empty;
            }
        }
    }
}
