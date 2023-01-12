using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Newtonsoft.Json;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace DataEditorPortal.ExcelExport
{
    public class Exporters
    {
        SpreadsheetDocument _wbook = null;
        public WorkbookPart _wbPart = null;
        //SharedStringTablePart _shareStringPart = null;
        WorkbookStylesPart _wbstylePart = null;
        Sheets _sheets = null;
        public Stream _sOutput;
        private void WriteLog(string message)
        {
            //System.IO.File.AppendAllText("E:\\MAOPOutput\\Exporter.txt", message); 
        }
        public void createExcel(string FileName)
        {
            //var fs = System.IO.File.Open(FileName,System.IO.FileMode.OpenOrCreate);
            //_wbook = SpreadsheetDocument.Create(fs, SpreadsheetDocumentType.Workbook);
            _sOutput = new MemoryStream();
            _wbook = SpreadsheetDocument.Create(_sOutput, SpreadsheetDocumentType.Workbook);

            //Add a workbookpart to the document
            _wbPart = _wbook.AddWorkbookPart();
            _wbPart.Workbook = new Workbook();
            //Add ShareString
            //_shareStringPart = _wbPart.AddNewPart<SharedStringTablePart>();
            _wbstylePart = _wbPart.AddNewPart<WorkbookStylesPart>();
            _wbstylePart.Stylesheet = StyleUtil.InitializeStyleSheet();
            _wbstylePart.Stylesheet.Save();
            //Add sheets to the workbook
            _sheets = _wbook.WorkbookPart.Workbook.AppendChild<Sheets>(new Sheets());

        }
        public UInt32Value AddFormatOptions(FormatOptions formatoption)
        {
            UInt32Value index = Utility.GetCellFormat(_wbstylePart.Stylesheet, formatoption);

            return index;
        }

        public void Addsheet(SheetParam sheetParam, IList<DataParam> dataParam, string outputFile)
        {


            FileInfo existingFile = new FileInfo(outputFile);
            //_sOutput = new MemoryStream();

            //var p = new ExcelPackage(existingFile);
            using (var p = new ExcelPackage(existingFile))
            {

                //A workbook must have at least on cell, so lets add one... 
                var ws = p.Workbook.Worksheets.Add(sheetParam.Name);



                //Add Data into the ExcelSheet;
                //var input = dataParam.GroupBy(g => g.R);

                foreach (var item in dataParam)
                {
                    if (item.Type == "numeric")
                    {
                        if (!string.IsNullOrEmpty(item.Text))
                        {
                            try
                            {
                                ws.Cells[item.R2, item.C2].Value = double.Parse(item.Text);
                            }
                            catch (Exception ex)
                            {
                                Utility.Write($"Invalid Number {item.R2}, {item.C2}, {item.Text}");
                            }
                            //ws.Cells[item.R2, item.C2].Style.Numberformat.Format = "##0.00";
                        }
                    }
                    else if (item.Type == "date")
                    {
                        DateTime d;
                        if (DateTime.TryParse(item.Text, out d))
                        {

                            ws.Cells[item.R2, item.C2].Value = d.ToOADate();
                            ws.Cells[item.R2, item.C2].Style.Numberformat.Format = "mm-dd-yy";//or m/d/yy h:mm

                            //ws.Cells[item.R2, item.C2].Value = d.ToShortDateString(); 
                            //ws.Cells[item.R2, item.C2].
                        }
                        else
                        {
                            //Error? 

                        }
                    }
                    else if (item.Type == "Decimal")
                    {
                        if (!string.IsNullOrEmpty(item.Text))
                        {





                            //ws.Cells[item.R2, item.C2].Style.Numberformat.Format = StringValue.ToString("#,##0.0000");//or m/d/yy h:mm




                            var nformat4Decimal = new NumberingFormat
                            {

                                NumberFormatId = UInt32Value.FromUInt32(170),
                                FormatCode = StringValue.FromString("#,##0.0000")
                            };

                            string positiveFormat = "#,##0.00_)";
                            string negativeFormat = "(#,##0.00)";
                            string zeroFormat = "-_)";
                            string numberFormat = positiveFormat + ";" + negativeFormat;
                            string zeroNumberFormat = positiveFormat + ";" + negativeFormat + ";" + zeroFormat;


                            var cellFormat = new CellFormat
                            {

                                NumberFormatId = nformat4Decimal.NumberFormatId,
                                ApplyNumberFormat = BooleanValue.FromBoolean(true)
                            };
                            ws.Cells[item.R2, item.C2].Style.Numberformat.Format = "0.00";
                            ws.Cells[item.R2, item.C2].Value = double.Parse(item.Text);
                            //ws.Cells[item.R2, item.C2].Style.Numberformat.Format = "#,##0.0000";//or m/d/yy h:mm

                        }
                    }
                    else if (item.Type == "Formula")
                    {
                        ws.Cells[item.R2, item.C2].Formula = item.Text;

                        //StringValue.FromString("#,##0.0000")
                        //if (!string.IsNullOrEmpty(item.Text))
                        //{
                        //}
                    }

                    else
                    {
                        ws.Cells[item.R2, item.C2].Value = item.Text;

                    }

                    if (item.FormatCell != null)

                    {
                        if (!string.IsNullOrEmpty(item.FormatCell.BackGroundColor))
                        {
                            System.Drawing.Color colFromHex = System.Drawing.ColorTranslator.FromHtml($"#{item.FormatCell.BackGroundColor}");
                            ws.Cells[item.R2, item.C2].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            ws.Cells[item.R2, item.C2].Style.Fill.BackgroundColor.SetColor(colFromHex);
                        }
                        if (!string.IsNullOrEmpty(item.FormatCell.FontColor))
                        {
                            System.Drawing.Color colFromHex = System.Drawing.ColorTranslator.FromHtml($"#{item.FormatCell.FontColor}");
                            //ws.Cells[item.R2, item.C2].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            ws.Cells[item.R2, item.C2].Style.Font.Color.SetColor(colFromHex);

                        }
                    }



                }

                var filter = sheetParam.FilterParam.First();

                WriteLog(JsonConvert.SerializeObject(filter));

                var headerRange = ws.Cells[1, filter.FromColumn, 1, filter.ToColumn];
                headerRange.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                //headerRange.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Lavender);
                headerRange.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                headerRange.Style.Font.Size = 11;
                headerRange.Style.Font.Bold = true;
                ws.Row(1).Height = 30;

                headerRange.Style.WrapText = true;

                //set default width first 
                for (int i = 1; i <= filter.ToColumn; i++)
                {
                    ws.Column(i).Width = sheetParam.ColumnParams[i - 1].Width;
                }

                //var range = ws.Cells[1, filter.FromColumn, filter.ToRow, filter.ToColumn];
                var range = ws.Cells[filter.FromRow, filter.FromColumn, filter.ToRow, filter.ToColumn];
                range.AutoFitColumns(30);

                //set default width first 
                for (int i = 1; i <= filter.ToColumn; i++)
                {
                    if (sheetParam.ColumnParams[i - 1].Width > 30)
                    {
                        ws.Column(i).Width = sheetParam.ColumnParams[i - 1].Width;
                    }
                }

                range.AutoFilter = true;

                //why false? 
                ws.View.ShowGridLines = new BooleanValue(true);
                //Freeze Pane
                ws.View.FreezePanes(2, 1);
                //ws.Calculate(); 
                //Save the new workbook. We haven't specified the filename so use the Save as method.
                //p.SaveAs(new FileInfo(outputFile));
                p.Save();
                p.Dispose();

            }

        }

        public void Addsheet(SheetParam sheetParam, IList<DataParam> dataParam)
        {
            if (_wbPart == null)
            {
                throw new Exception("Workbook has not been Started");
            }
            //WorkbookStylesPart _wbstylePart = _wbPart.AddNewPart<WorkbookStylesPart>("rId" + sheetParam.ID);
            //Borders borders1 = new Borders() { Count = 1U };
            //Border border1 = new Border();
            //LeftBorder leftBorder1 = new LeftBorder();
            //RightBorder rightBorder1 = new RightBorder();
            //DiagonalBorder diagonalBorder = new DiagonalBorder();
            //TopBorder topBorder = new TopBorder();
            //BottomBorder bottomBorder = new BottomBorder();

            //borders1.Append(leftBorder1);
            //border1.Append(rightBorder1);
            //border1.Append(diagonalBorder);
            //border1.Append(topBorder);
            //border1.Append(bottomBorder);
            //borders1.Append(border1);

            ////Create the new stylesheet

            //_wbstylePart.Stylesheet = StyleUtil.InitializeStyleSheet();
            //_wbstylePart.Stylesheet.Append(borders1);
            //_wbstylePart.Stylesheet.Save();
            //Add worksheetpart to the workbookpart
            WorksheetPart wsPart = _wbPart.AddNewPart<WorksheetPart>("rId" + sheetParam.ID);








            //Append a new worksheet and associate it with the workbook
            Sheet newSheet = new Sheet() { Id = _wbook.WorkbookPart.GetIdOfPart(wsPart), SheetId = sheetParam.ID, Name = sheetParam.Name };
            _sheets.Append(newSheet);

            wsPart.Worksheet = new Worksheet();

            //Set the tab Color
            SheetProperties sheetproperties = new SheetProperties();

            if (sheetParam.TabColorParam != null)
            {

                TabColor tC = new TabColor() { Rgb = sheetParam.TabColorParam.Color };
                sheetproperties.Append(tC);

            }
            wsPart.Worksheet.Append(sheetproperties);

            //set sheetviews
            SheetData sheetData = new SheetData();

            SheetViews sheetViews = new SheetViews();
            SheetView sheetView = new SheetView() { TabSelected = false, WorkbookViewId = (UInt32Value)0U };

            sheetView.ShowGridLines = new BooleanValue(false);
            sheetViews.Append(sheetView);
            wsPart.Worksheet.Append(sheetViews);

            Columns columns = new Columns();
            Column column = new Column() { Min = 1, Max = 1, Width = 18, CustomWidth = true };
            columns.Append(column);

            wsPart.Worksheet.Append(columns);


            //wbstylePart.Stylesheet = new Stylesheet();

            //Add Data into the ExcelSheet;
            var input = dataParam.GroupBy(g => g.R);

            foreach (var item in input)
            {
                #region
                Row row = new Row() { RowIndex = (UInt32Value)item.Key };
                foreach (var citem in item)
                {
                    Cell cell = new Cell();
                    //cell.CellReference = citem.Column + row.RowIndex;
                    if (citem.FormulaStr == null)
                    {
                        if (citem.Type == "Number")
                        {
                            cell.DataType = CellValues.Number;
                            //cell.StyleIndex = 103U;
                            cell.CellValue = new CellValue(citem.Text);


                            //var nformat4Decimal = new NumberingFormat
                            //{

                            //    NumberFormatId = UInt32Value.FromUInt32(165),
                            //    FormatCode = StringValue.FromString("##0.00")
                            //};
                            //var cellFormat = new CellFormat
                            //{

                            //    NumberFormatId = nformat4Decimal.NumberFormatId,
                            //    ApplyNumberFormat = BooleanValue.FromBoolean(true),

                            //};

                            //_wbook.WorkbookPart.WorkbookStylesPart.Stylesheet.Append(cellFormat);
                            //cell.StyleIndex = 165;
                            //cell.CellValue = new CellValue(citem.Text);

                            //ws.Cells[item.R2, item.C2].Style.Numberformat.Format = "##0.00";
                        }
                        else if (citem.Type == "Date")
                        {
                            DateTime dateV;
                            DateTime.TryParse(citem.Text, out dateV);
                            //cell.DataType = CellValues.Date;
                            cell.CellValue = new CellValue(dateV.ToOADate().ToString(CultureInfo.InvariantCulture));
                        }
                        else
                        {
                            cell.DataType = CellValues.String;
                            cell.CellValue = new CellValue(citem.Text);

                            //int index = Utility.InsertSharedStringItem(citem.Text, _shareStringPart);
                            //cell.CellValue = new CellValue(index.ToString());
                            //cell.DataType = new EnumValue<CellValues>(CellValues.SharedString);
                        }

                    }
                    else
                    {
                        CellFormula cellformula = new CellFormula();
                        cellformula.Text = citem.FormulaStr;
                        //CellValue cellvalue = new CellValue();
                        // cellvalue.Text = "0";
                        cell.DataType = CellValues.Number;
                        cell.Append(cellformula);
                        //cell.Append(cellvalue);

                    }
                    //if (citem.Type == "Number")
                    //{
                    //    cell.DataType = CellValues.Number;
                    //    cell.CellValue = new CellValue(citem.Text);
                    //}
                    //else if (citem.Type == "Date")
                    //{
                    //    DateTime dateV;
                    //    DateTime.TryParse(citem.Text, out dateV);
                    //    //cell.DataType = CellValues.Date;
                    //    cell.CellValue = new CellValue(dateV.ToOADate().ToString(CultureInfo.InvariantCulture));
                    //}
                    //else
                    //{
                    //    cell.DataType = CellValues.String;
                    //    cell.CellValue = new CellValue(citem.Text); 
                    //}

                    //if (citem.FormatCell.BackGroundColor != null || citem.FormatCell.Rotate > 0 || citem.FormatCell.FontStyle != enumFontStyleOptions.None|| citem.FormatCell.FontColor!=null||citem.FormatCell.NumberFormat==true || citem.FormatCell.HasBorder!=true)
                    //{
                    // cell.StyleIndex = Utility.GetCellFormat(_wbstylePart.Stylesheet, citem.FormatCell);
                    //}
                    //else
                    //{


                    cell.StyleIndex = 0;

                    if (citem.FormatIndex != null)
                    {
                        cell.StyleIndex = citem.FormatIndex;
                    }

                    //}
                    row.Append(cell);
                }

                sheetData.Append(row);
                #endregion

            }
            wsPart.Worksheet.Append(sheetData);

            //Set Row Height
            if (sheetParam.RowParams != null)
            {
                foreach (var item in sheetParam.RowParams)
                {
                    Utility.SetRowHeight(wsPart.Worksheet, item.Index, item.Height);
                }
            }

            //set the column width
            if (sheetParam.ColumnParams != null)
            {
                foreach (var item in sheetParam.ColumnParams)
                {
                    Utility.SetColumnWidth(wsPart.Worksheet, item.Index, item.Width);

                }
            }

            //set the freeze pane
            if (sheetParam.FreezePane != null && sheetParam.FreezePane.Enable)
            {
                Utility.SetFreezePane(wsPart.Worksheet, sheetParam.FreezePane.RowNumber, sheetParam.FreezePane.ColumnNumber);
            }

            //Set the AutoFilter
            if (sheetParam.FilterParam != null)
            {
                foreach (var item in sheetParam.FilterParam)
                {
                    AutoFilter af = new AutoFilter() { Reference = Utility.GetRefString(item.FromRow, item.ToRow, item.FromColumn, item.ToColumn) };
                    wsPart.Worksheet.Append(af);
                }
            }

            //set the MergeCell
            MergeCells mergeCells = null;
            if (sheetParam.MergeRegions != null)
            {
                UInt32Value countMerge = (uint)sheetParam.MergeRegions.Count();

                mergeCells = new MergeCells() { Count = countMerge };
                foreach (var item in sheetParam.MergeRegions)
                {
                    Utility.SetMergeCells(item.FromRow, item.ToRow, item.FromColumn, item.ToColumn, mergeCells);
                }
            }
            wsPart.Worksheet.Append(mergeCells);

            //Set the conditional formatting
            if (sheetParam.ConditionalFormattingParam != null)
            {
                foreach (var item in sheetParam.ConditionalFormattingParam)
                {
                    ConditionalFormatting cf = Utility.SetConditionalFormatting(wsPart.Worksheet, item.FromRow, item.ToRow, item.FromColumn, item.ToColumn, item.FormatValueType, item.Operator, item.CriteriaText, item.FontColor, item.FillColor, _wbstylePart.Stylesheet);
                    wsPart.Worksheet.Append(cf);
                }
            }

            if (sheetParam.HyperlinkParam != null)
            {
                Hyperlinks hps = new Hyperlinks();
                int id = 1;
                foreach (var item in sheetParam.HyperlinkParam)
                {
                    //Get the hyperlink working
                    string columnName = Utility.GetExcelColumnName(item.ColNum);

                    if (item.Type == enumHyperlinkTypeOptions.DOCUMENT)
                    {
                        HyperlinkRelationship hr = wsPart.AddHyperlinkRelationship(new System.Uri(item.Source, UriKind.RelativeOrAbsolute), true);
                        Hyperlink hp = new Hyperlink() { Reference = columnName + item.RowNum, Id = hr.Id, Location = item.Location };
                        hps.Append(hp);
                    }
                    else
                    {
                        HyperlinkRelationship hr = wsPart.AddHyperlinkRelationship(new System.Uri(item.Source, UriKind.RelativeOrAbsolute), true);
                        Hyperlink hp = new Hyperlink() { Reference = columnName + item.RowNum, Id = hr.Id };
                        hps.Append(hp);
                    }

                    id++;
                }
                PageMargins pageMargins = null;
                if (wsPart.Worksheet.Descendants<PageMargins>().Count() > 0)
                {
                    pageMargins = wsPart.Worksheet.Descendants<PageMargins>().First();
                }
                else
                {
                    pageMargins = new PageMargins() { Left = 0.7D, Right = 0.7D, Top = 0.75D, Bottom = 0.75D, Header = 0.3D, Footer = 0.3D };
                }

                wsPart.Worksheet.Append(hps);
                wsPart.Worksheet.Append(pageMargins);

                //wsPart.Worksheet.InsertBefore<Hyperlinks>(hps, pageMargins);


            }

            //Insert Pictures
            if (sheetParam.PicturesParam != null)
            {
                foreach (var item in sheetParam.PicturesParam)
                {
                    Utility.InsertPicutres(wsPart, item.Px, item.Py, item.ImagePath);
                    // Utility.InsertPicutres(wsPart, item.FromRow, item.FromColumn, item.ToRow, item.ToColumn, item.ImagePath);
                }
            }
            _wbPart.Workbook.Save();

        }

        public void EndSession()
        {
            _wbook.Close();
            _wbook.Dispose();
        }
        public void CloseWorkbook()
        {
            //_wbPart.Workbook.Save();
            _wbook.Close();
            _wbook.Dispose();
        }

        // Given a document name, a worksheet name, and the names of two adjacent cells, merges the two cells.
        // When two cells are merged, only the content from one cell is preserved:
        // the upper-left cell for left-to-right languages or the upper-right cell for right-to-left languages.
        public void MergeTwoCells(WorkbookPart workbookpart, string cell1Name, string cell2Name, string worksheetName)
        {
            IEnumerable<Sheet> sheets = workbookpart.Workbook.Descendants<Sheet>().Where(s => s.Name == worksheetName);
            WorksheetPart worksheetPart = (WorksheetPart)workbookpart.GetPartById(sheets.First().Id);
            Worksheet worksheet = worksheetPart.Worksheet;

            if (worksheet == null || string.IsNullOrEmpty(cell1Name) || string.IsNullOrEmpty(cell2Name))
            {
                return;
            }

            MergeCells mergeCells;
            if (worksheet.Elements<MergeCells>().Count() > 0)
            {
                mergeCells = worksheet.Elements<MergeCells>().First();
            }
            else
            {
                mergeCells = new MergeCells();

                // Insert a MergeCells object into the specified position.
                if (worksheet.Elements<CustomSheetView>().Count() > 0)
                {
                    worksheet.InsertAfter(mergeCells, worksheet.Elements<CustomSheetView>().First());
                }
                else if (worksheet.Elements<DataConsolidate>().Count() > 0)
                {
                    worksheet.InsertAfter(mergeCells, worksheet.Elements<DataConsolidate>().First());
                }
                else if (worksheet.Elements<SortState>().Count() > 0)
                {
                    worksheet.InsertAfter(mergeCells, worksheet.Elements<SortState>().First());
                }
                else if (worksheet.Elements<AutoFilter>().Count() > 0)
                {
                    worksheet.InsertAfter(mergeCells, worksheet.Elements<AutoFilter>().First());
                }
                else if (worksheet.Elements<Scenarios>().Count() > 0)
                {
                    worksheet.InsertAfter(mergeCells, worksheet.Elements<Scenarios>().First());
                }
                else if (worksheet.Elements<ProtectedRanges>().Count() > 0)
                {
                    worksheet.InsertAfter(mergeCells, worksheet.Elements<ProtectedRanges>().First());
                }
                else if (worksheet.Elements<SheetProtection>().Count() > 0)
                {
                    worksheet.InsertAfter(mergeCells, worksheet.Elements<SheetProtection>().First());
                }
                else if (worksheet.Elements<SheetCalculationProperties>().Count() > 0)
                {
                    worksheet.InsertAfter(mergeCells, worksheet.Elements<SheetCalculationProperties>().First());
                }
                else
                {
                    worksheet.InsertAfter(mergeCells, worksheet.Elements<SheetData>().First());
                }
            }

            // Create the merged cell and append it to the MergeCells collection.
            MergeCell mergeCell = new MergeCell() { Reference = new StringValue(cell1Name + ":" + cell2Name) };
            mergeCells.Append(mergeCell);
            worksheet.Save();

        }

        public void CalculateSumOfCellRange(WorkbookPart workbookPart, string worksheetName, string firstCellName, string lastCellName, string resultCell)
        {
            // Open the document for editing.
            IEnumerable<Sheet> sheets = workbookPart.Workbook.Descendants<Sheet>().Where(s => s.Name == worksheetName);
            if (sheets.Count() == 0)
            {
                // The specified worksheet does not exist.
                return;
            }

            WorksheetPart worksheetPart = (WorksheetPart)workbookPart.GetPartById(sheets.First().Id);
            Worksheet worksheet = worksheetPart.Worksheet;

            // Get the row number and column name for the first and last cells in the range.
            uint firstRowNum = GetRowIndex(firstCellName);
            uint lastRowNum = GetRowIndex(lastCellName);
            string firstColumn = GetColumnName(firstCellName);
            string lastColumn = GetColumnName(lastCellName);

            double sum = 0;

            // Iterate through the cells within the range and add their values to the sum.
            foreach (Row row in worksheet.Descendants<Row>().Where(r => r.RowIndex.Value >= firstRowNum && r.RowIndex.Value <= lastRowNum))
            {
                foreach (Cell cell in row)
                {
                    string columnName = GetColumnName(cell.CellReference.Value);
                    if (CompareColumn(columnName, firstColumn) >= 0 && CompareColumn(columnName, lastColumn) <= 0)
                    {
                        sum += double.Parse(cell.CellValue.Text);
                    }
                }
            }

            // Get the SharedStringTablePart and add the result to it.
            // If the SharedStringPart does not exist, create a new one.
            SharedStringTablePart shareStringPart;
            if (workbookPart.GetPartsOfType<SharedStringTablePart>().Count() > 0)
            {
                shareStringPart = workbookPart.GetPartsOfType<SharedStringTablePart>().First();
            }
            else
            {
                shareStringPart = workbookPart.AddNewPart<SharedStringTablePart>();
            }

            // Insert the result into the SharedStringTablePart.
            int index = InsertSharedStringItem("Result: " + sum, shareStringPart);

            Cell result = InsertCellInWorksheet(GetColumnName(resultCell), GetRowIndex(resultCell), worksheetPart);

            // Set the value of the cell.
            result.CellValue = new CellValue(index.ToString());
            result.DataType = new EnumValue<CellValues>(CellValues.SharedString);

            worksheetPart.Worksheet.Save();

        }

        private static uint GetRowIndex(string cellName)
        {
            // Create a regular expression to match the row index portion the cell name.
            Regex regex = new Regex(@"\d+");
            Match match = regex.Match(cellName);

            return uint.Parse(match.Value);
        }
        // Given a cell name, parses the specified cell to get the column name.
        private static string GetColumnName(string cellName)
        {
            // Create a regular expression to match the column name portion of the cell name.
            Regex regex = new Regex("[A-Za-z]+");
            Match match = regex.Match(cellName);

            return match.Value;
        }
        // Given two columns, compares the columns.
        private static int CompareColumn(string column1, string column2)
        {
            if (column1.Length > column2.Length)
            {
                return 1;
            }
            else if (column1.Length < column2.Length)
            {
                return -1;
            }
            else
            {
                return string.Compare(column1, column2, true);
            }
        }
        // Given text and a SharedStringTablePart, creates a SharedStringItem with the specified text 
        // and inserts it into the SharedStringTablePart. If the item already exists, returns its index.
        private static int InsertSharedStringItem(string text, SharedStringTablePart shareStringPart)
        {
            // If the part does not contain a SharedStringTable, create it.
            if (shareStringPart.SharedStringTable == null)
            {
                shareStringPart.SharedStringTable = new SharedStringTable();
            }

            int i = 0;
            foreach (SharedStringItem item in shareStringPart.SharedStringTable.Elements<SharedStringItem>())
            {
                if (item.InnerText == text)
                {
                    // The text already exists in the part. Return its index.
                    return i;
                }

                i++;
            }

            // The text does not exist in the part. Create the SharedStringItem.
            shareStringPart.SharedStringTable.AppendChild(new SharedStringItem(new DocumentFormat.OpenXml.Spreadsheet.Text(text)));
            shareStringPart.SharedStringTable.Save();

            return i;
        }
        // Given a column name, a row index, and a WorksheetPart, inserts a cell into the worksheet. 
        // If the cell already exists, returns it. 
        private static Cell InsertCellInWorksheet(string columnName, uint rowIndex, WorksheetPart worksheetPart)
        {
            Worksheet worksheet = worksheetPart.Worksheet;
            SheetData sheetData = worksheet.GetFirstChild<SheetData>();
            string cellReference = columnName + rowIndex;

            // If the worksheet does not contain a row with the specified row index, insert one.
            Row row;
            if (sheetData.Elements<Row>().Where(r => r.RowIndex == rowIndex).Count() != 0)
            {
                row = sheetData.Elements<Row>().Where(r => r.RowIndex == rowIndex).First();
            }
            else
            {
                row = new Row() { RowIndex = rowIndex };
                sheetData.Append(row);
            }

            // If there is not a cell with the specified column name, insert one.  
            if (row.Elements<Cell>().Where(c => c.CellReference.Value == columnName + rowIndex).Count() > 0)
            {
                return row.Elements<Cell>().Where(c => c.CellReference.Value == cellReference).First();
            }
            else
            {
                // Cells must be in sequential order according to CellReference. Determine where to insert the new cell.
                Cell refCell = null;
                foreach (Cell cell in row.Elements<Cell>())
                {
                    if (string.Compare(cell.CellReference.Value, cellReference, true) > 0)
                    {
                        refCell = cell;
                        break;
                    }
                }

                Cell newCell = new Cell() { CellReference = cellReference };
                row.InsertBefore(newCell, refCell);

                worksheet.Save();
                return newCell;
            }
        }




    }
}
