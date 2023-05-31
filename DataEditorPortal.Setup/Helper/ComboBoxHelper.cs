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
                bool bindPassword = (bool)e.NewValue;

                if (bindPassword)
                {
                    comboBox.SelectionChanged += ComboBox_SelectionChanged;
                    comboBox.PreviewTextInput += ComboBox_PreviewTextInput;
                }
                else
                {
                    comboBox.SelectionChanged -= ComboBox_SelectionChanged;
                    comboBox.PreviewTextInput -= ComboBox_PreviewTextInput;
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
                    comboBox.PreviewTextInput -= ComboBox_PreviewTextInput;

                    comboBox.SelectedValue = e.NewValue;
                    comboBox.Text = e.NewValue?.ToString();

                    comboBox.SelectionChanged += ComboBox_SelectionChanged;
                    comboBox.PreviewTextInput += ComboBox_PreviewTextInput;
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

        private static void ComboBox_PreviewTextInput(object sender, System.Windows.Input.TextCompositionEventArgs e)
        {
            if (sender is ComboBox comboBox && !GetIsUpdating(comboBox))
            {
                SetIsUpdating(comboBox, true);
                string newText = comboBox.Text + e.Text;
                SetSelectedValueAndText(comboBox, newText);
                SetIsUpdating(comboBox, false);
            }
        }
    }

}