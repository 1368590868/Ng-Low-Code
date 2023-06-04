using System.Windows;
using System.Windows.Controls;

namespace Setup
{
    public static class ComboBoxHelper
    {
        public static readonly DependencyProperty BindSelectedValueAndText =
            DependencyProperty.RegisterAttached("BindSelectedValueAndText", typeof(bool), typeof(ComboBoxHelper), new PropertyMetadata(false, OnBindSelectedValueAndTextChanged));

        public static readonly DependencyProperty SelectedValueAndTextProperty =
            DependencyProperty.RegisterAttached("SelectedValueAndText", typeof(object), typeof(ComboBoxHelper), new FrameworkPropertyMetadata(null, FrameworkPropertyMetadataOptions.BindsTwoWayByDefault, OnSelectedValueAndTextChanged));

        private static readonly DependencyProperty IsUpdatingProperty =
            DependencyProperty.RegisterAttached("IsUpdating", typeof(bool), typeof(ComboBoxHelper));

        public static bool GetBindSelectedValueAndText(DependencyObject obj)
        {
            return (bool)obj.GetValue(BindSelectedValueAndText);
        }

        public static void SetBindSelectedValueAndText(DependencyObject obj, bool value)
        {
            obj.SetValue(BindSelectedValueAndText, value);
        }

        public static object GetSelectedValueAndText(DependencyObject obj)
        {
            return obj.GetValue(SelectedValueAndTextProperty);
        }

        public static void SetSelectedValueAndText(DependencyObject obj, object value)
        {
            obj.SetValue(SelectedValueAndTextProperty, value);
        }

        private static bool GetIsUpdating(DependencyObject obj)
        {
            return (bool)obj.GetValue(IsUpdatingProperty);
        }

        private static void SetIsUpdating(DependencyObject obj, bool value)
        {
            obj.SetValue(IsUpdatingProperty, value);
        }

        private static void OnBindSelectedValueAndTextChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ComboBox comboBox)
            {
                bool bindSelectedValueAndText = (bool)e.NewValue;

                if (bindSelectedValueAndText)
                {
                    comboBox.Loaded += ComboBox_Loaded;
                    comboBox.Unloaded += ComboBox_Unloaded;
                }
                else
                {
                    comboBox.Loaded -= ComboBox_Loaded;
                    comboBox.Unloaded -= ComboBox_Unloaded;
                }
            }
        }

        private static void ComboBox_Unloaded(object sender, RoutedEventArgs e)
        {
            if (sender is ComboBox comboBox)
            {
                var textBox = GetComboBoxTextBox(comboBox);
                if (textBox != null) textBox.TextChanged -= TextBox_TextChanged;

                comboBox.SelectionChanged -= ComboBox_SelectionChanged;
            }
        }

        private static void ComboBox_Loaded(object sender, RoutedEventArgs e)
        {
            if (sender is ComboBox comboBox)
            {
                var textBox = GetComboBoxTextBox(comboBox);
                if (textBox != null)
                {
                    textBox.Tag = comboBox;
                    textBox.TextChanged += TextBox_TextChanged;
                }

                comboBox.SelectionChanged += ComboBox_SelectionChanged;
            }
        }

        private static void TextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (sender is TextBox textBox)
            {
                if (textBox.Tag is ComboBox comboBox && !GetIsUpdating(comboBox))
                {
                    SetIsUpdating(comboBox, true);
                    SetSelectedValueAndText(comboBox, comboBox.Text);
                    SetIsUpdating(comboBox, false);
                }
            }
        }

        private static void OnSelectedValueAndTextChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ComboBox comboBox && !GetIsUpdating(comboBox))
            {
                if (!comboBox.IsDropDownOpen)
                {
                    comboBox.SelectionChanged -= ComboBox_SelectionChanged;
                    var textBox = GetComboBoxTextBox(comboBox);
                    if (textBox != null) textBox.TextChanged -= TextBox_TextChanged;

                    comboBox.SelectedValue = e.NewValue;
                    comboBox.Text = e.NewValue?.ToString();

                    comboBox.SelectionChanged += ComboBox_SelectionChanged;
                    if (textBox != null) textBox.TextChanged += TextBox_TextChanged;
                }
            }
        }

        private static void ComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (sender is ComboBox comboBox && !GetIsUpdating(comboBox))
            {
                SetIsUpdating(comboBox, true);
                SetSelectedValueAndText(comboBox, comboBox.SelectedValue);
                SetIsUpdating(comboBox, false);
            }
        }

        // Helper method to find the TextBox inside the ComboBox
        private static TextBox GetComboBoxTextBox(ComboBox comboBox)
        {
            var comboBoxTemplate = comboBox.Template;
            if (comboBoxTemplate != null)
            {
                var textBox = (TextBox)comboBoxTemplate.FindName("PART_EditableTextBox", comboBox);
                return textBox;
            }
            return null;
        }
    }
}