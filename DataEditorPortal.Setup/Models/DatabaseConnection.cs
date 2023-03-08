namespace Setup.Models
{
    public class DatabaseConnection : NotifyPropertyObject
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
    }
}
