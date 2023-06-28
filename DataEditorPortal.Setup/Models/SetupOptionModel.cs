using System.ComponentModel;

namespace Setup.Models
{
    public class SetupOptionModel : NotifyPropertyObject, IDataErrorInfo
    {
        private bool _isSetupNew;
        public bool IsSetupNew
        {
            get
            {
                return _isSetupNew;
            }
            set
            {
                _isSetupNew = value;
                OnPropertyChanged("IsSetupNew");
            }
        }

        private bool _isUpgrade;
        public bool IsUpgrade
        {
            get
            {
                return _isUpgrade;
            }
            set
            {
                _isUpgrade = value;
                OnPropertyChanged("IsUpgrade");
            }
        }

        private string _siteName;
        public string SiteName
        {
            get
            {
                return _siteName;
            }
            set
            {
                _siteName = value;
                OnPropertyChanged("SiteName");
            }
        }

        private string _application;
        public string Application
        {
            get
            {
                return _application;
            }
            set
            {
                _application = value;
                OnPropertyChanged("Application");
            }
        }
        public string Error { get { return null; } }

        public string this[string columnName]
        {
            get
            {
                if (columnName == "Application")
                {
                    if (string.IsNullOrEmpty(Application))
                        return "Application is Required";
                }
                if (columnName == "SiteName")
                {
                    if (string.IsNullOrEmpty(SiteName))
                        return "SiteName is Required";
                }

                return null;
            }
        }
    }
}
