using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace DataEditorPortal.ExcelExport
{
    public class Exporters
    {
        public void Addsheet(SheetParam sheetParam, IList<DataParam> dataParam, Stream stream)
        {
            using (var p = new ExcelPackage(stream))
            {
                //A workbook must have at least on cell, so lets add one... 
                var ws = p.Workbook.Worksheets.Add(sheetParam.Name);

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
                                //Error? 
                            }
                        }
                    }
                    else if (item.Type == "date")
                    {
                        DateTime d;
                        if (DateTime.TryParse(item.Text, out d))
                        {

                            ws.Cells[item.R2, item.C2].Value = d.ToOADate();
                            ws.Cells[item.R2, item.C2].Style.Numberformat.Format = "mm-dd-yy";//or m/d/yy h:mm
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
                            ws.Cells[item.R2, item.C2].Style.Numberformat.Format = "#,##0.00";
                            ws.Cells[item.R2, item.C2].Value = double.Parse(item.Text);

                        }
                    }
                    else if (item.Type == "Formula")
                    {
                        ws.Cells[item.R2, item.C2].Formula = item.Text;
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
                ws.View.ShowGridLines = true;
                //Freeze Pane
                ws.View.FreezePanes(2, 1);

                p.Save();
                p.Dispose();
            }
        }
    }
}
