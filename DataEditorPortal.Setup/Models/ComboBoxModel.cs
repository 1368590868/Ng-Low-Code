using System.Collections.Generic;

namespace Setup.Models
{
    public class ComboBoxModel : NotifyPropertyObject
    {
        private List<string> _items;
        public List<string> Items
        {
            get { return _items; }
            set
            {
                _items = value;
                OnPropertyChanged("Items");
            }
        }
    }
}
