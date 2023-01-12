using DocumentFormat.OpenXml;
using System;
using System.Collections.Generic;

namespace DataEditorPortal.ExcelExport
{
    /// <summary>
    /// Data Parameters: Column, Row, Celltype, CellValue
    /// </summary>
    public class DataParam
    {
        public DataParam()
        {
            FormatCell = new FormatOptions();
        }
        public uint C { get; set; }
        public uint R { get; set; }

        public int C2 { get; set; }
        public int R2 { get; set; }
        public string Column { get; set; }
        /// <summary>
        /// Boolean, Date, Error, InlineString, Number, SharedString, String
        /// </summary>
        public string Type { get; set; }
        public string Text { get; set; }

        public bool Flag { get; set; } = false;
        public FormatOptions FormatCell { get; set; }
        public string FormulaStr { get; set; }
        public UInt32Value FormatIndex { get; set; }
    }

    public class SheetParam
    {
        public string Name { get; set; }
        public UInt32Value ID { get; set; }
        public FreezePaneOptions FreezePane { get; set; }
        public IList<ColumnOptions> ColumnParams { get; set; }
        public IList<RowOptions> RowParams { get; set; }
        public IList<ConditionalFormattingOptions> ConditionalFormattingParam { get; set; }
        public IList<MergedRegionOptions> MergeRegions { get; set; }
        public IList<PictureOptions> PicturesParam { get; set; }
        public IList<AutoFilterOptions> FilterParam { get; set; }
        public TabColorOptions TabColorParam { get; set; }
        ///
        /// That is saved for hyperlinks
        ///
        public List<HyperlinkOptions> HyperlinkParam { get; set; }
    }

    public class HyperlinkOptions
    {
        public int RowNum { get; set; }
        public int ColNum { get; set; }
        /// <summary>
        /// Examples of the type of Source:
        /// URL:http://poi.apache.org/
        ///File:link1.xls, should be in the same directory
        ///EMAIL:mailto:poi@apache.org?subject=Hyperlinks Note, if subject contains white spaces, make sure they are url-encoded
        ///DOCUMENT: 'Target Sheet'!A1
        /// </summary>
        public string Source { get; set; }
        public string Location { get; set; }
        public enumHyperlinkTypeOptions Type { get; set; }
    }

    public class PictureOptions
    {
        //public int FromRow { get; set; }
        //public int ToRow { get; set; }
        //public int FromColumn { get; set; }
        //public int ToColumn { get; set; }
        public int Px { get; set; }
        public int Py { get; set; }
        public string ImagePath { get; set; }

    }

    public class TabColorOptions
    {
        /// <summary>
        /// HexString Color
        /// </summary>
        public string Color { get; set; }
    }

    public class AutoFilterOptions
    {
        public int FromRow { get; set; }
        public int ToRow { get; set; }
        public int FromColumn { get; set; }
        public int ToColumn { get; set; }
    }
    public class ColumnOptions
    {
        public int Index2 { get; set; }
        public uint Index { get; set; }
        public double Width { get; set; }
    }

    public class RowOptions
    {
        public uint Index { get; set; }
        public Double Height { get; set; }
    }

    public class FreezePaneOptions
    {
        public bool Enable { get; set; }
        public int RowNumber { get; set; }
        public int ColumnNumber { get; set; }
    }

    public class MergedRegionOptions
    {
        public int FromRow { get; set; }
        public int ToRow { get; set; }
        public int FromColumn { get; set; }
        public int ToColumn { get; set; }

    }

    public class ConditionalFormattingOptions
    {
        public ConditionalFormattingOptions()
        {
            FormatValueType = "CellIs";
            Operator = "Equal";
        }
        public int FromRow { get; set; }
        public int ToRow { get; set; }
        public int FromColumn { get; set; }
        public int ToColumn { get; set; }
        public string FormatValueType { get; set; }
        public string Operator { get; set; }
        public string CriteriaText { get; set; }
        public string FontColor { get; set; }
        public string FillColor { get; set; }
    }
    public class FormatOptions
    {

        public FormatOptions()
        {
            //Internal defaults
            FontName = "Calibri";
            FontSize = 11;
            FontStyle = enumFontStyleOptions.None;
            HasBorder = true;
            WrapText = false;
            HorizontalAlignment = enumHorizontalAlignmentOptions.Center;
            VerticalAlignment = enumVerticalAlignmentOptions.Center;
        }
        public string FontName { get; set; }
        public double FontSize { get; set; }
        public string FontColor { get; set; }
        public enumFontStyleOptions FontStyle { get; set; }
        public uint Rotate { get; set; }
        public bool HasBorder { get; set; }
        public enumHorizontalAlignmentOptions HorizontalAlignment { get; set; }
        public enumVerticalAlignmentOptions VerticalAlignment { get; set; }
        public enumPatternType PatternType { get; set; }
        public string BackGroundColor { get; set; }
        public string ForeGroundColor { get; set; }
        public bool WrapText { get; set; }
        public UInt32 NumberFormatId { get; set; }
        public bool NumberFormat { get; set; }
        public string NumberFormatcode { get; set; }
    }

    [Flags]
    public enum enumFontStyleOptions
    {
        None = 0,
        Bold = 1,
        Italic = 2,
        Underline = 4
    }
    public enum enumHorizontalAlignmentOptions
    {
        Left,
        Center,
        Right
    }


    public enum enumVerticalAlignmentOptions
    {
        Top,
        Center,
        Bottom
    }
    public enum enumPatternType
    {
        None,
        Solid
    }

    public enum enumHyperlinkTypeOptions
    {
        URL,
        EMAIL,
        FILE,
        DOCUMENT
    }

}
