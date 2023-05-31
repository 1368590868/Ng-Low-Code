using System.ComponentModel;

namespace Setup.Models
{
    public class DatabaseConnection : NotifyPropertyObject, IDataErrorInfo
    {
        private string _connectionName;
        public string ConnectionName
        {
            get { return _connectionName; }
            set
            {
                _connectionName = value;
                OnPropertyChanged("ConnectionName");
            }
        }

        private string _connectionString;
        public string ConnectionString
        {
            get { return _connectionString; }
            set
            {
                _connectionString = value;
                OnPropertyChanged("ConnectionString");
            }
        }

        private string _serverName;
        public string ServerName
        {
            get { return _serverName; }
            set
            {
                _serverName = value;
                OnPropertyChanged("ServerName");
            }
        }

        private string _authentication;
        public string Authentication
        {
            get { return _authentication; }
            set
            {
                _authentication = value;
                OnPropertyChanged("Authentication");
                OnPropertyChanged("IsNotWindowsAuth");
            }
        }

        private string _username;
        public string Username
        {
            get { return _username; }
            set
            {
                _username = value;
                OnPropertyChanged("Username");
            }
        }

        private string _password;
        public string Password
        {
            get { return _password; }
            set
            {
                _password = value;
                OnPropertyChanged("Password");
            }
        }

        private string _databaseName;
        public string DatabaseName
        {
            get { return _databaseName; }
            set
            {
                _databaseName = value;
                OnPropertyChanged("DatabaseName");
            }
        }

        public bool IsConnectionNameEnabled
        {
            get { return _connectionName != "Default"; }
        }

        public bool IsNotWindowsAuth
        {
            get { return _authentication != "Windows Authentication" && _authentication != "OS Authentication"; }
        }

        public string Error { get { return null; } }

        public string this[string columnName]
        {
            get
            {
                if (columnName == "ConnectionName")
                {
                    if (string.IsNullOrEmpty(ConnectionName))
                        return "Name is required";
                }
                if (columnName == "ConnectionString")
                {
                    if (string.IsNullOrEmpty(ConnectionString))
                        return "Connection string is required";
                }
                if (columnName == "ServerName")
                {
                    if (string.IsNullOrEmpty(ServerName))
                        return "Server name is required";
                }
                if (columnName == "Authentication")
                {
                    if (string.IsNullOrEmpty(Authentication))
                        return "Authentication is required";
                }
                if (columnName == "Username")
                {
                    if (string.IsNullOrEmpty(Username) && IsNotWindowsAuth)
                        return "Username is required";
                }
                if (columnName == "Password")
                {
                    if (string.IsNullOrEmpty(Password) && IsNotWindowsAuth)
                        return "Password is required";
                }
                if (columnName == "DatabaseName")
                {
                    if (string.IsNullOrEmpty(DatabaseName))
                        return "Database name is required";
                }

                return null;
            }
        }
    }

}
