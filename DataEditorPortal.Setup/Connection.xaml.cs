using Setup.Models;
using System;
using System.Data.SqlClient;
using System.Windows;

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

        public DatabaseConnection DatabaseConnection { get; set; }

        private void btnSave_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrEmpty(DatabaseConnection.ConnectionName))
            {
                MessageBox.Show("Please enter the Name.");
                return;
            }
            if (string.IsNullOrEmpty(DatabaseConnection.ConnectionString))
            {
                MessageBox.Show("Please enter the Connection String.");
                return;
            }

            try
            {
                using (var con = new SqlConnection())
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

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            if (DatabaseConnection == null) DatabaseConnection = new DatabaseConnection();
            textBox.DataContext = DatabaseConnection;
            textBox1.DataContext = DatabaseConnection;
        }
    }
}
