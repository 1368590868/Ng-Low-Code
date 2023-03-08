namespace Setup.Models
{
    public class SitePublishModel : NotifyPropertyObject
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
    }
}
