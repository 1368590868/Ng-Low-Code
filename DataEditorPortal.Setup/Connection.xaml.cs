using Oracle.ManagedDataAccess.Client;
using Setup.Models;
using System;
using System.Data.Common;
using System.Data.SqlClient;
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
        public DatabaseConnection DatabaseConnection { get; set; } = new DatabaseConnection();

        private void btnSave_Click(object sender, RoutedEventArgs e)
        {
            if (!IsModelValid())
                return;

            try
            {
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
            textBox.GetBindingExpression(TextBox.TextProperty).UpdateSource();
            textBox1.GetBindingExpression(TextBox.TextProperty).UpdateSource();
            return !Validation.GetHasError(textBox) && !Validation.GetHasError(textBox1);
        }
    }
}
