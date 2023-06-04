using System.Collections.Generic;

namespace Setup.Models
{
    public class ComboBoxModel : NotifyPropertyObject
    {
        private List<string> _siteNames;
        public List<string> SiteNames
        {
            get { return _siteNames; }
            set
            {
                _siteNames = value;
                OnPropertyChanged("SiteNames");
            }
        }

        private string _selectedSiteName;
        public string SelectedSiteName
        {
            get { return _selectedSiteName; }
            set
            {
                _selectedSiteName = value;
                OnPropertyChanged("SelectedSiteName");
            }
        }
    }

}
