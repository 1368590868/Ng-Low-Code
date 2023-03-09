using System.ComponentModel;

namespace Setup.Models
{
    public class DatabaseConnection : NotifyPropertyObject, IDataErrorInfo
    {
        private string _connectionName;
        public string ConnectionName
        {
            get
            {
                return _connectionName;
            }
            set
            {
                _connectionName = value;
                OnPropertyChanged("ConnectionName");
            }
        }

        private string _connectionString;
        public string ConnectionString
        {
            get
            {
                return _connectionString;
            }
            set
            {
                _connectionString = value;
                OnPropertyChanged("ConnectionString");
            }
        }

        public bool IsConnectionNameEnabled
        {
            get { return _connectionName != "Default"; }
        }

        public string Error { get { return null; } }

        public string this[string columnName]
        {
            get
            {
                if (columnName == "ConnectionName")
                {
                    if (string.IsNullOrEmpty(ConnectionName))
                        return "Name is Required";
                }
                if (columnName == "ConnectionString")
                {
                    if (string.IsNullOrEmpty(ConnectionString))
                        return "Connection string is Required";
                }

                return null;
            }
        }
    }
}
