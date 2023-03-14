using System.ComponentModel;

namespace Setup.Models
{
    public class DatabaseProvider : NotifyPropertyObject, IDataErrorInfo
    {
        private string _value;
        public string Value
        {
            get
            {
                return _value;
            }
            set
            {
                _value = value;
                OnPropertyChanged("Value");
            }
        }

        public string Error { get { return null; } }

        public string this[string columnName]
        {
            get
            {
                if (columnName == "Value")
                {
                    if (string.IsNullOrEmpty(Value))
                        return "Database Provider is Required";
                }

                return null;
            }
        }
    }
}
