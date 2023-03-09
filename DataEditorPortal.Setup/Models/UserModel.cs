using System.ComponentModel;

namespace Setup.Models
{
    public class UserModel : NotifyPropertyObject, IDataErrorInfo
    {
        private string _username;
        public string Username
        {
            get
            {
                return _username;
            }
            set
            {
                _username = value;
                OnPropertyChanged("Username");
            }
        }

        private string _password;
        public string Password
        {
            get
            {
                return _password;
            }
            set
            {
                _password = value;
                OnPropertyChanged("Password");
            }
        }

        public string Error { get { return null; } }

        public string this[string columnName]
        {
            get
            {
                if (columnName == "Username")
                {
                    if (string.IsNullOrEmpty(Username))
                        return "Username is Required";
                }
                if (columnName == "Password")
                {
                    if (string.IsNullOrEmpty(Password))
                        return "Password is Required";
                }

                return null;
            }
        }
    }
}
