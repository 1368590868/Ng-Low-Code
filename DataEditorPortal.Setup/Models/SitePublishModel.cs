using System.ComponentModel;

namespace Setup.Models
{
    public class SitePublishModel : NotifyPropertyObject, IDataErrorInfo
    {
        private string _targetFolder;
        public string TargetFolder
        {
            get
            {
                return _targetFolder;
            }
            set
            {
                _targetFolder = value;
                OnPropertyChanged("TargetFolder");
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

        private string _sitePort;
        public string SitePort
        {
            get
            {
                return _sitePort;
            }
            set
            {
                _sitePort = value;
                OnPropertyChanged("SitePort");
            }
        }

        private string _siteDomain;
        public string SiteDomain
        {
            get
            {
                return _siteDomain;
            }
            set
            {
                _siteDomain = value;
                OnPropertyChanged("SiteDomain");
            }
        }

        private string _appPath;
        public string AppPath
        {
            get
            {
                return _appPath;
            }
            set
            {
                _appPath = value;
                OnPropertyChanged("AppPath");
            }
        }


        public string Error { get { return null; } }

        public string this[string columnName]
        {
            get
            {
                if (columnName == "SiteDomain")
                {
                    if (string.IsNullOrEmpty(SiteDomain))
                        return "Site domain is Required";
                }
                if (columnName == "TargetFolder")
                {
                    if (string.IsNullOrEmpty(TargetFolder))
                        return "Target folder is Required";
                }
                if (columnName == "SiteName")
                {
                    if (string.IsNullOrEmpty(SiteName))
                        return "Site name is Required";
                }
                if (columnName == "SitePort")
                {
                    if (string.IsNullOrEmpty(SitePort))
                        return "Site port is Required";
                }
                if (columnName == "AppPath")
                {
                    if (string.IsNullOrEmpty(AppPath))
                        return "Application Path is Required";
                }


                return null;
            }
        }
    }
}
