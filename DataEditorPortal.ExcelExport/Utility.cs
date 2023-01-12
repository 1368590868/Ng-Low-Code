using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Drawing.Spreadsheet;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;

namespace DataEditorPortal.ExcelExport
{
    public class Utility
    {

        //set column width;
        public static void SetColumnWidth(Worksheet worksheet, uint Index, DoubleValue cwidth)
        {

            DocumentFormat.OpenXml.Spreadsheet.Columns cs = worksheet.GetFirstChild<DocumentFormat.OpenXml.Spreadsheet.Columns>();
            if (cs != null)
            {

                IEnumerable<DocumentFormat.OpenXml.Spreadsheet.Column> ic = cs.Elements<DocumentFormat.OpenXml.Spreadsheet.Column>().Where(r => r.Min == Index).Where(r => r.Max == Index);
                if (ic.Count() > 0)
                {
                    DocumentFormat.OpenXml.Spreadsheet.Column c = ic.First();
                    c.Width = cwidth;
                }
                else
                {
                    DocumentFormat.OpenXml.Spreadsheet.Column c = new DocumentFormat.OpenXml.Spreadsheet.Column() { Min = Index, Max = Index, Width = cwidth, CustomWidth = true };
                    cs.Append(c);
                }
            }
            else //if column doesn't exist, then create one column
            {
                cs = new DocumentFormat.OpenXml.Spreadsheet.Columns();
                DocumentFormat.OpenXml.Spreadsheet.Column c = new DocumentFormat.OpenXml.Spreadsheet.Column() { Min = Index, Max = Index, Width = cwidth, CustomWidth = true };
                cs.Append(c);
                worksheet.InsertAfter(cs, worksheet.GetFirstChild<SheetFormatProperties>());
            }
        }

        //Set Row Height
        public static void SetRowHeight(Worksheet worksheet, uint Index, DoubleValue rheight)
        {
            IEnumerable<Row> rows = worksheet.Descendants<Row>().Where(r => r.RowIndex.Value == Index);
            if (rows.Count() > 0)
            {
                Row row = rows.First();
                row.Height = rheight;
                row.CustomHeight = true;
            }
            else
            {
                Row row = new Row { RowIndex = Index, Height = rheight, CustomHeight = true };
                worksheet.Descendants<SheetData>().First().Append(row);
            }
        }

        // set the freeze pane
        public static void SetFreezePane(Worksheet ws, int rowN, int colN)
        {

            SheetView sheetView = ws.SheetViews.FirstOrDefault() as SheetView;

            string activeCell = GetExcelColumnName(colN) + rowN.ToString();
            Pane pane1 = new Pane() { HorizontalSplit = colN - 1, VerticalSplit = rowN - 1, TopLeftCell = activeCell, ActivePane = PaneValues.BottomRight, State = PaneStateValues.Frozen };

            sheetView.Append(pane1);
        }


        public static string GetExcelColumnName(int colNum)
        {
            int dividend = colNum;
            string columnName = String.Empty;
            int modulo;

            while (dividend > 0)
            {
                modulo = (dividend - 1) % 26;
                columnName = Convert.ToChar(65 + modulo).ToString() + columnName;
                dividend = (int)((dividend - modulo) / 26);
            }

            return columnName;
        }

        //Set the auto filter
        public static string GetRefString(int fR, int tR, int fC, int tC)
        {
            string fcN1 = GetExcelColumnName(fC);
            string tcN1 = GetExcelColumnName(tC);
            string Ref1 = fcN1 + fR.ToString() + ":" + tcN1 + tR.ToString();
            return Ref1;

        }

        //Set Merge Cell
        public static void SetMergeCells(int fR, int tR, int fC, int tC, MergeCells mergeCells1)
        {
            string fcN = GetExcelColumnName(fC);
            string tcN = GetExcelColumnName(tC);
            string Ref = fcN + fR.ToString() + ":" + tcN + tR.ToString();

            MergeCell mergeCell = new MergeCell() { Reference = Ref };

            mergeCells1.Append(mergeCell);
        }

        //Set Conditional Formatting
        public static ConditionalFormatting SetConditionalFormatting(Worksheet ws, int fR, int tR, int fC, int tC, string vType, string op, string text, string fontC, string fillC, Stylesheet ss)
        {
            string fcolName = GetExcelColumnName(fC);
            string tcolName = GetExcelColumnName(tC);
            string regionstring = fcolName + fR.ToString() + ":" + tcolName + tR.ToString();
            IEnumerable<ConditionalFormatting> conditionalFormattings = ws.Descendants<ConditionalFormatting>().Where(r => r.InnerText == regionstring);
            ConditionalFormatting conditionalFormatting;
            if (conditionalFormattings.Count() > 0)
            {
                conditionalFormatting = conditionalFormattings.First();
            }
            else
            {
                conditionalFormatting = new ConditionalFormatting() { SequenceOfReferences = new ListValue<StringValue>() { InnerText = regionstring } };
            }
            ConditionalFormatValues value = (ConditionalFormatValues)Enum.Parse(typeof(ConditionalFormatValues), vType);
            ConditionalFormattingOperatorValues valueCF = (ConditionalFormattingOperatorValues)Enum.Parse(typeof(ConditionalFormattingOperatorValues), op);
            UInt32Value formatId = Utility.GetConditionalFormattId(ss, fontC, fillC);
            ConditionalFormattingRule conditionalFormattingRule = new ConditionalFormattingRule() { Type = value, Priority = 1, FormatId = formatId, Operator = valueCF };
            Formula formula = new Formula();
            formula.Text = text;
            conditionalFormattingRule.Append(formula);
            conditionalFormatting.Append(conditionalFormattingRule);
            return conditionalFormatting;
        }

        private static UInt32Value GetConditionalFormattId(Stylesheet styleS, string fontC, string fillC)
        {
            UInt32Value cFid = 0;
            DifferentialFormats differentialFormats = styleS.DifferentialFormats;
            if (styleS.DifferentialFormats == null)
            {
                differentialFormats = new DifferentialFormats();
            }
            DifferentialFormat differentialFormat = new DifferentialFormat();

            DocumentFormat.OpenXml.Spreadsheet.Font font = new DocumentFormat.OpenXml.Spreadsheet.Font(new DocumentFormat.OpenXml.Spreadsheet.Color() { Rgb = fontC });
            Fill fill = new Fill(new PatternFill(new BackgroundColor() { Rgb = fillC }));

            differentialFormat.Append(font);
            differentialFormat.Append(fill);
            differentialFormats.Append(differentialFormat);
            cFid = (uint)differentialFormats.Count() - 1;
            return cFid;
        }

        public static int FormatCount(Stylesheet stylesheet)
        {
            return stylesheet.CellFormats.Count();
        }
        public static UInt32Value GetCellFormat(Stylesheet stylesheet, FormatOptions format)
        {
            UInt32Value cellIndex = 0;
            UInt32Value borderId = 0;
            UInt32Value fontId = 0;
            UInt32Value fillId = 0;
            UInt32Value nfId = 0;
            bool numberformating = false;

            //Font
            if (format.FontColor == null && format.FontStyle == enumFontStyleOptions.Bold && format.FontStyle != enumFontStyleOptions.Italic && format.FontStyle != enumFontStyleOptions.Underline)
            {
                fontId = 1;
            }
            else if (format.FontColor != null || format.FontStyle != enumFontStyleOptions.None)
            {
                fontId = GetFontIndex(stylesheet, format);
            }
            //Border
            if (format.HasBorder == true)
            {
                borderId = 1;
            }
            //Fill
            if (format.BackGroundColor != null)
            {
                fillId = GetFillIndex(stylesheet, format.PatternType.ToString(), format.BackGroundColor, format.ForeGroundColor);
            }
            if (format.NumberFormat == true)
            {
                ProcessNumberFormatID(stylesheet, UInt32Value.FromUInt32((UInt32)format.NumberFormatId), format.NumberFormatcode);
                nfId = UInt32Value.FromUInt32((UInt32)format.NumberFormatId);
                numberformating = true;
            }

            //Alignment
            Alignment alignment = new Alignment();
            if (format.HorizontalAlignment == enumHorizontalAlignmentOptions.Center)
                alignment.Horizontal = HorizontalAlignmentValues.Center;
            if (format.HorizontalAlignment == enumHorizontalAlignmentOptions.Left)
                alignment.Horizontal = HorizontalAlignmentValues.Left;
            if (format.HorizontalAlignment == enumHorizontalAlignmentOptions.Right)
                alignment.Horizontal = HorizontalAlignmentValues.Right;
            if (format.VerticalAlignment == enumVerticalAlignmentOptions.Center)
                alignment.Vertical = VerticalAlignmentValues.Center;
            if (format.VerticalAlignment == enumVerticalAlignmentOptions.Bottom)
                alignment.Vertical = VerticalAlignmentValues.Bottom;
            if (format.VerticalAlignment == enumVerticalAlignmentOptions.Top)
                alignment.Vertical = VerticalAlignmentValues.Top;
            if (format.Rotate > 0)
                alignment.TextRotation = format.Rotate;
            if (format.WrapText == true)
                alignment.WrapText = true;
            else
                alignment.WrapText = false;


            CellFormat cellformat = new CellFormat() { NumberFormatId = nfId, FontId = fontId, FillId = fillId, BorderId = borderId, Alignment = alignment, ApplyAlignment = true, ApplyNumberFormat = numberformating };
            foreach (var existcF in stylesheet.CellFormats.Descendants<CellFormat>())
            {
                if (cellformat.OuterXml.Equals(existcF.OuterXml))
                { return cellIndex; }
                else
                {
                    cellIndex++;
                }
            }
            stylesheet.CellFormats.Append(cellformat);
            cellIndex = (uint)stylesheet.CellFormats.Count() - 1;
            return cellIndex;
        }

        private static UInt32Value GetFontIndex(Stylesheet stylesheet, FormatOptions format)
        {
            UInt32Value fontIndex = 0;

            // The Order is Bold, Italic, Underline, FontSize, Color, FontName;
            Bold bold = null;
            Italic italic = null;
            Underline underline = null;


            if (format.FontStyle.HasFlag(enumFontStyleOptions.Bold))
            {
                bold = new Bold();
            }
            if (format.FontStyle.HasFlag(enumFontStyleOptions.Italic))
            {
                italic = new Italic();
            }
            if (format.FontStyle.HasFlag(enumFontStyleOptions.Underline))
            {
                underline = new Underline() { Val = UnderlineValues.Single };
            }

            FontSize fsize = new FontSize() { Val = format.FontSize };

            DocumentFormat.OpenXml.Spreadsheet.Color col = null;

            if (format.FontColor != null)
            {
                col = new DocumentFormat.OpenXml.Spreadsheet.Color() { Rgb = format.FontColor };
            }

            FontName fname = new FontName() { Val = format.FontName };

            DocumentFormat.OpenXml.Spreadsheet.Font ft = new DocumentFormat.OpenXml.Spreadsheet.Font() { FontSize = fsize, FontName = fname, Color = col, Bold = bold, Italic = italic, Underline = underline };

            foreach (var existingfont in stylesheet.Fonts.Descendants<DocumentFormat.OpenXml.Spreadsheet.Font>())
            {
                if (ft.OuterXml.Equals(existingfont.OuterXml))
                {
                    return fontIndex;
                }
                fontIndex++;
            }
            DocumentFormat.OpenXml.Spreadsheet.Font font1 = new DocumentFormat.OpenXml.Spreadsheet.Font();

            if (bold != null)
            {
                font1.Append(bold);
            }
            if (italic != null)
            {
                font1.Append(italic);
            }
            if (underline != null)
            {
                font1.Append(underline);
            }

            font1.Append(fsize);

            if (col != null)
            {
                font1.Append(col);
            }
            font1.Append(fname);

            stylesheet.Fonts.Append(font1);
            fontIndex = (uint)stylesheet.Fonts.Count() - 1;

            return fontIndex;
        }

        private static UInt32Value GetFillIndex(Stylesheet stylesheet, string patterntype, string backgroundcolor, string foregroundcolor)
        {
            UInt32Value fillIndex = 0;
            BackgroundColor bCol = new BackgroundColor() { Rgb = backgroundcolor };
            ForegroundColor fCol = new ForegroundColor() { Rgb = foregroundcolor };
            //IEnumerable<Fill> fill = stylesheet.Fills.Descendants<Fill>().Where(r => r.PatternFill.PatternType.ToString() == patterntype && r.PatternFill.BackgroundColor == bCol && r.PatternFill.ForegroundColor == fCol);

            Fill fill2 = new Fill(new PatternFill() { PatternType = PatternValues.Solid, BackgroundColor = bCol, ForegroundColor = fCol });

            foreach (var existingfill in stylesheet.Fills.Descendants<DocumentFormat.OpenXml.Spreadsheet.Fill>())
            {
                if (fill2.OuterXml.Equals(existingfill.OuterXml))
                {
                    return fillIndex;
                }
                fillIndex++;
            }

            stylesheet.Fills.Append(fill2);
            fillIndex = (uint)stylesheet.Fills.Count() - 1;

            return fillIndex;
        }



        private static void ProcessNumberFormatID(Stylesheet stylesheet, UInt32Value formatidOrig, string formatcode)
        {
            UInt32Value formatIndex = 0;
            //IEnumerable<NumberingFormat> format = stylesheet.NumberingFormats.Descendants<NumberingFormat>().Where(r => r.NumberFormatId == formatidOrig && r.FormatCode == formatcode);

            NumberingFormat nft = new NumberingFormat() { NumberFormatId = formatidOrig, FormatCode = formatcode };
            foreach (var existFormat in stylesheet.NumberingFormats.Descendants<DocumentFormat.OpenXml.Spreadsheet.NumberingFormat>())
            {
                if (nft.OuterXml.Equals(existFormat.OuterXml))
                {
                    return;
                }
                formatIndex++;
            }

            stylesheet.NumberingFormats.Append(nft);
            formatIndex = (uint)stylesheet.Fills.Count() - 1;
            return;
        }

        //Insert Pictures in the excel file
        public static void InsertPicutres(WorksheetPart wsp, int x, int y, string sImagePath)
        {
            DrawingsPart dp;
            ImagePart imgp;
            WorksheetDrawing wsd;
            ImagePartType ipt;

            switch (sImagePath.Substring(sImagePath.LastIndexOf('.') + 1).ToLower())
            {
                case "png":
                    ipt = ImagePartType.Png;
                    break;
                case "jpg":
                    ipt = ImagePartType.Jpeg;
                    break;
                case "jpeg":
                    ipt = ImagePartType.Jpeg;
                    break;
                case "gif":
                    ipt = ImagePartType.Gif;
                    break;
                default:
                    return;
            }

            if (wsp.DrawingsPart == null)
            {
                //----- no drawing part exists, add a new one
                dp = wsp.AddNewPart<DrawingsPart>();
                imgp = dp.AddImagePart(ipt, wsp.GetIdOfPart(dp));
                wsd = new WorksheetDrawing();
            }
            else
            {
                //----- use existing drawing part
                dp = wsp.DrawingsPart;
                imgp = dp.AddImagePart(ipt);
                dp.CreateRelationshipToPart(imgp);
                wsd = dp.WorksheetDrawing;
            }

            using (FileStream fs = new FileStream(sImagePath, FileMode.Open))
            //using (MemoryStream fs = new MemoryStream(File.ReadAllBytes(sImagePath)))
            {
                imgp.FeedData(fs);
            }

            int imageNumber = dp.ImageParts.Count<ImagePart>();

            if (imageNumber == 1)
            {
                Drawing drawing = new Drawing();
                drawing.Id = dp.GetIdOfPart(imgp);
                wsp.Worksheet.Append(drawing);
            }

            //Set Properties of the picture;
            NonVisualDrawingProperties nvdp = new NonVisualDrawingProperties();
            nvdp.Id = new UInt32Value((uint)(1024 + imageNumber));
            nvdp.Name = "Picture:" + imageNumber.ToString();
            nvdp.Description = "";
            DocumentFormat.OpenXml.Drawing.PictureLocks picLocks = new DocumentFormat.OpenXml.Drawing.PictureLocks();
            picLocks.NoChangeAspect = true;
            picLocks.NoChangeArrowheads = true;
            NonVisualPictureDrawingProperties nvpdp = new NonVisualPictureDrawingProperties();
            nvpdp.PictureLocks = picLocks;
            NonVisualPictureProperties nvpp = new NonVisualPictureProperties();
            nvpp.NonVisualDrawingProperties = nvdp;
            nvpp.NonVisualPictureDrawingProperties = nvpdp;

            DocumentFormat.OpenXml.Drawing.Stretch stretch = new DocumentFormat.OpenXml.Drawing.Stretch();
            stretch.FillRectangle = new DocumentFormat.OpenXml.Drawing.FillRectangle();

            BlipFill blipFill = new BlipFill();
            DocumentFormat.OpenXml.Drawing.Blip blip = new DocumentFormat.OpenXml.Drawing.Blip();
            blip.Embed = dp.GetIdOfPart(imgp);
            blip.CompressionState = DocumentFormat.OpenXml.Drawing.BlipCompressionValues.Print;
            blipFill.Blip = blip;
            blipFill.SourceRectangle = new DocumentFormat.OpenXml.Drawing.SourceRectangle();
            blipFill.Append(stretch);

            DocumentFormat.OpenXml.Drawing.Transform2D t2d = new DocumentFormat.OpenXml.Drawing.Transform2D();
            DocumentFormat.OpenXml.Drawing.Offset offset = new DocumentFormat.OpenXml.Drawing.Offset();
            offset.X = 0;
            offset.Y = 0;
            t2d.Offset = offset;

            Bitmap bm = new Bitmap(sImagePath);

            DocumentFormat.OpenXml.Drawing.Extents extents = new DocumentFormat.OpenXml.Drawing.Extents();
            extents.Cx = (long)bm.Width * (long)((float)914400 / bm.HorizontalResolution);
            extents.Cy = (long)bm.Height * (long)((float)914400 / bm.VerticalResolution);
            bm.Dispose();
            t2d.Extents = extents;

            ShapeProperties sp = new ShapeProperties();
            sp.BlackWhiteMode = DocumentFormat.OpenXml.Drawing.BlackWhiteModeValues.Auto;
            sp.Transform2D = t2d;
            DocumentFormat.OpenXml.Drawing.PresetGeometry prstGeom = new DocumentFormat.OpenXml.Drawing.PresetGeometry();
            prstGeom.Preset = DocumentFormat.OpenXml.Drawing.ShapeTypeValues.Rectangle;
            prstGeom.AdjustValueList = new DocumentFormat.OpenXml.Drawing.AdjustValueList();
            sp.Append(prstGeom);
            sp.Append(new DocumentFormat.OpenXml.Drawing.NoFill());

            DocumentFormat.OpenXml.Drawing.Spreadsheet.Picture picture = new DocumentFormat.OpenXml.Drawing.Spreadsheet.Picture();
            picture.NonVisualPictureProperties = nvpp;
            picture.BlipFill = blipFill;
            picture.ShapeProperties = sp;

            Position pos = new Position();
            pos.X = x * 914400 / 72;
            pos.Y = y * 914400 / 72;
            Extent ext = new Extent();
            ext.Cx = extents.Cx;
            ext.Cy = extents.Cy;

            AbsoluteAnchor anchor = new AbsoluteAnchor();
            anchor.Position = pos;
            anchor.Extent = ext;
            anchor.Append(picture);
            anchor.Append(new ClientData());
            wsd.Append(anchor);

            //TwoCellAnchor twocellAnchor = new TwoCellAnchor();
            //DocumentFormat.OpenXml.Drawing.Spreadsheet.FromMarker fromMarker1 = new DocumentFormat.OpenXml.Drawing.Spreadsheet.FromMarker();
            //ColumnId columnId1 = new ColumnId();
            //columnId1.Text = (fy-1).ToString();
            //ColumnOffset columnOffset1 = new ColumnOffset();
            //columnOffset1.Text = "0";
            //RowId rowId1 = new RowId();
            //rowId1.Text = (fx-1).ToString();
            //RowOffset rowOffset1 = new RowOffset();
            //rowOffset1.Text = "0";

            //fromMarker1.Append(columnId1);
            //fromMarker1.Append(columnOffset1);
            //fromMarker1.Append(rowId1);
            //fromMarker1.Append(rowOffset1);

            //DocumentFormat.OpenXml.Drawing.Spreadsheet.ToMarker toMarker1 = new DocumentFormat.OpenXml.Drawing.Spreadsheet.ToMarker();
            //ColumnId columnId2 = new ColumnId();
            //columnId2.Text = (ty-1).ToString();
            //ColumnOffset columnOffset2 = new ColumnOffset();
            //columnOffset2.Text = extents.Cx.ToString();
            //RowId rowId2 = new RowId();
            //rowId2.Text = (tx-1).ToString();
            //RowOffset rowOffset2 = new RowOffset();
            //rowOffset2.Text = extents.Cy.ToString();

            //toMarker1.Append(columnId2);
            //toMarker1.Append(columnOffset2);
            //toMarker1.Append(rowId2);
            //toMarker1.Append(rowOffset2);

            //twocellAnchor.Append(fromMarker1);
            //twocellAnchor.Append(toMarker1);
            //twocellAnchor.Append(picture);
            //twocellAnchor.Append(new ClientData());

            //wsd.Append(twocellAnchor);

            wsd.Save(dp);
        }

        public static int InsertSharedStringItem(string text, SharedStringTablePart shareStringPart)
        {
            // If the part does not contain a SharedStringTable, create one.
            if (shareStringPart.SharedStringTable == null)
            {
                shareStringPart.SharedStringTable = new SharedStringTable();
            }
            int i = 0;
            // Iterate through all the items in the SharedStringTable. If the text already exists, return its index.
            foreach (SharedStringItem item in shareStringPart.SharedStringTable.Elements<SharedStringItem>())
            {
                if (item.InnerText == text)
                {
                    return i;
                }
                i++;
            }
            // The text does not exist in the part. Create the SharedStringItem and return its index.
            shareStringPart.SharedStringTable.AppendChild(new SharedStringItem(new DocumentFormat.OpenXml.Spreadsheet.Text(text)));
            shareStringPart.SharedStringTable.Save();
            return i;
        }

        public static void Write(string message)
        {

            //try
            //{
            //    string destination = System.IO.Path.Combine(ConfigurationManager.AppSettings["OutputFolder"], "MAOP_Process_" + System.DateTime.Now.ToString("yyyy_MM_dd") + ".txt");
            //    System.IO.File.AppendAllText(destination, System.DateTime.Now.ToString() + ":" + message + "\r\n");
            //}
            //catch (Exception ex)
            //{
            //}


            //// Console.WriteLine(message); 

        }


    }
}
