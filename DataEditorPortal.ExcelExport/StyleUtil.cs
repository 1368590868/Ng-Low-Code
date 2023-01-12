using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Spreadsheet;
using System;

namespace DataEditorPortal.ExcelExport
{
    public class StyleUtil
    {

        public static Stylesheet InitializeStyleSheet()
        {
            Stylesheet ss = new Stylesheet();

            Fonts fs = new Fonts();
            //Default Font;
            Font f1 = new Font();
            FontSize fsize1 = new FontSize() { Val = 11D };
            FontName fname1 = new FontName() { Val = "Calibri" };

            f1.Append(fsize1);
            f1.Append(fname1);

            Font f2 = new Font();
            FontSize fsize2 = new FontSize() { Val = 11D };
            FontName fname2 = new FontName() { Val = "Calibri" };
            Bold bd = new Bold();

            f2.Append(bd);
            f2.Append(fsize2);
            f2.Append(fname2);

            fs.Append(f1);
            fs.Append(f2);

            fs.Count = (uint)fs.ChildElements.Count;

            //Fill Background;
            Fills fills = new Fills();

            // FillId = 0
            Fill fill1 = new Fill();
            PatternFill patternFill1 = new PatternFill() { PatternType = PatternValues.None };
            BackgroundColor bgC1 = new BackgroundColor() { Rgb = "FF000000" };
            ForegroundColor fgC1 = new ForegroundColor() { Rgb = "FFFFFFFF" };
            patternFill1.Append(fgC1);
            patternFill1.Append(bgC1);
            fill1.Append(patternFill1);

            // FillId = 1
            Fill fill2 = new Fill();
            PatternFill patternFill2 = new PatternFill() { PatternType = PatternValues.Gray125 };
            BackgroundColor bgC2 = new BackgroundColor() { Rgb = "FF000000" };
            ForegroundColor fgC2 = new ForegroundColor() { Rgb = "FFFFFFFF" };

            patternFill2.Append(fgC2);
            patternFill2.Append(bgC2);
            fill2.Append(patternFill2);

            fills.Append(fill1);
            fills.Append(fill2);
            fills.Count = (uint)fills.ChildElements.Count;

            //set the border
            Borders borders = new Borders();

            //Default Boarder;
            Border border1 = new Border();
            LeftBorder leftBorder1 = new LeftBorder();
            RightBorder rightBorder1 = new RightBorder();
            TopBorder topBorder1 = new TopBorder();
            BottomBorder bottomBorder1 = new BottomBorder();
            DiagonalBorder diagonalBorder1 = new DiagonalBorder();

            border1.Append(leftBorder1);
            border1.Append(rightBorder1);
            border1.Append(topBorder1);
            border1.Append(bottomBorder1);
            border1.Append(diagonalBorder1);

            Border border2 = new Border();
            LeftBorder leftBorder2 = new LeftBorder() { Style = BorderStyleValues.Thin };
            Color color1 = new Color() { Auto = true };
            leftBorder2.Append(color1);

            RightBorder rightBorder2 = new RightBorder() { Style = BorderStyleValues.Thin };
            Color color2 = new Color() { Auto = true };
            rightBorder2.Append(color2);

            TopBorder topBorder2 = new TopBorder() { Style = BorderStyleValues.Thin };
            Color color3 = new Color() { Auto = true };
            topBorder2.Append(color3);

            BottomBorder bottomBorder2 = new BottomBorder() { Style = BorderStyleValues.Thin };
            Color color4 = new Color() { Auto = true };
            bottomBorder2.Append(color4);

            DiagonalBorder diagonalBorder2 = new DiagonalBorder();

            border2.Append(leftBorder2);
            border2.Append(rightBorder2);
            border2.Append(topBorder2);
            border2.Append(bottomBorder2);
            border2.Append(diagonalBorder2);

            borders.Append(border1);
            borders.Append(border2);
            borders.Count = (UInt32)borders.ChildElements.Count;

            //set the cellstyleformat

            CellStyleFormats cellStyleFormats = new CellStyleFormats();
            //Default format;
            CellFormat cellFormat1 = new CellFormat();
            cellFormat1.NumberFormatId = 0;
            cellFormat1.FontId = 0;
            cellFormat1.FillId = 0;
            cellFormat1.BorderId = 1;
            cellStyleFormats.Append(cellFormat1);

            cellStyleFormats.Count = (uint)cellStyleFormats.ChildElements.Count;


            //Numbering formats;
            NumberingFormats nfs = new NumberingFormats();
            NumberingFormat nf = new NumberingFormat();
            nf.NumberFormatId = (UInt32Value)0;
            nf.FormatCode = "";
            nfs.Append(nf);

            //create cell formats
            CellFormats cellFormats = new CellFormats();
            CellFormat cellFormat11 = new CellFormat();
            cellFormat11.NumberFormatId = (UInt32Value)0;
            cellFormat11.FontId = 0;
            cellFormat11.FillId = 0;
            cellFormat11.BorderId = 1;
            Alignment alignment11 = new Alignment();
            alignment11.Horizontal = HorizontalAlignmentValues.Center;
            alignment11.Vertical = VerticalAlignmentValues.Center;
            alignment11.WrapText = false;
            cellFormat11.ApplyNumberFormat = false;
            cellFormat11.ApplyAlignment = true;
            cellFormat11.Append(alignment11);
            cellFormats.Append(cellFormat11);

            cellFormats.Count = (uint)cellFormats.ChildElements.Count;


            CellStyles cellStyles = new CellStyles();
            CellStyle cellStyle = new CellStyle() { Name = "Normal", FormatId = 0, BuiltinId = 0 };
            cellStyles.Append(cellStyle);

            DifferentialFormats differentialFormats = new DifferentialFormats();

            ss.Append(nfs);
            ss.Append(fs);
            ss.Append(fills);
            //ss.Append(borders);
            ss.Append(cellStyleFormats);
            ss.Append(cellFormats);
            ss.Append(cellStyles);
            ss.Append(differentialFormats);

            return ss;
        }
    }
}
