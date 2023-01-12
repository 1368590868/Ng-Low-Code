using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Drawing;
using DocumentFormat.OpenXml.Drawing.Charts;
using DocumentFormat.OpenXml.Drawing.Spreadsheet;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DataEditorPortal.ExcelExport
{
    public class InsertChart
    {
        public void InsertChartInSpreadsheet(string filePath, string sheetName, int startX, int startY, int endX, int endY)
        {
            WorksheetPart wsp;
            using (SpreadsheetDocument document = SpreadsheetDocument.Open(filePath, true))
            {
                IEnumerable<Sheet> sheets = document.WorkbookPart.Workbook.Descendants<Sheet>().Where(s => s.Name == sheetName);
                if (sheets.Count() == 0)
                {
                    // The specified worksheet does not exist.
                    return;
                }
                wsp = (WorksheetPart)document.WorkbookPart.GetPartById(sheets.First().Id);


                DrawingsPart drawingsPart;

                if (wsp.DrawingsPart == null)
                {
                    //----- no drawing part exists, add a new one
                    drawingsPart = wsp.AddNewPart<DrawingsPart>();
                }
                else
                {
                    //use existing drawingpart;
                    drawingsPart = wsp.DrawingsPart;
                }

                Drawing drawing;
                IEnumerable<Drawing> drawings = wsp.Worksheet.Descendants<Drawing>().Where(r => r.Id == wsp.GetIdOfPart(drawingsPart));
                if (drawings.Count() > 0)
                {
                    drawing = drawings.First();
                }
                else
                {
                    drawing = new DocumentFormat.OpenXml.Spreadsheet.Drawing() { Id = wsp.GetIdOfPart(drawingsPart) };
                    wsp.Worksheet.Append(drawing);
                }

                //wsp.Worksheet.Append(new DocumentFormat.OpenXml.Spreadsheet.Drawing() { Id = wsp.GetIdOfPart(drawingsPart) });
                wsp.Worksheet.Save();

                //Add new chart and set the chart language to English
                ChartPart chartPart = drawingsPart.AddNewPart<ChartPart>();
                chartPart.ChartSpace = new DocumentFormat.OpenXml.Drawing.Charts.ChartSpace();
                chartPart.ChartSpace.Append(new DocumentFormat.OpenXml.Drawing.Charts.EditingLanguage() { Val = new StringValue("en-US") });
                DocumentFormat.OpenXml.Drawing.Charts.Chart chart = chartPart.ChartSpace.AppendChild<DocumentFormat.OpenXml.Drawing.Charts.Chart>(new DocumentFormat.OpenXml.Drawing.Charts.Chart());

                // Create a new clustered column chart.
                DocumentFormat.OpenXml.Drawing.Charts.PlotArea plotArea = chart.AppendChild<DocumentFormat.OpenXml.Drawing.Charts.PlotArea>(new DocumentFormat.OpenXml.Drawing.Charts.PlotArea());
                DocumentFormat.OpenXml.Drawing.Charts.Layout layout = plotArea.AppendChild<DocumentFormat.OpenXml.Drawing.Charts.Layout>(new DocumentFormat.OpenXml.Drawing.Charts.Layout());

                //barchartdirection values determine the horizontal or vertical of the bar;
                DocumentFormat.OpenXml.Drawing.Charts.BarChart barChart = plotArea.AppendChild<DocumentFormat.OpenXml.Drawing.Charts.BarChart>(new DocumentFormat.OpenXml.Drawing.Charts.BarChart(new DocumentFormat.OpenXml.Drawing.Charts.BarDirection() { Val = new EnumValue<DocumentFormat.OpenXml.Drawing.Charts.BarDirectionValues>(DocumentFormat.OpenXml.Drawing.Charts.BarDirectionValues.Column) },
                    new DocumentFormat.OpenXml.Drawing.Charts.BarGrouping() { Val = new EnumValue<DocumentFormat.OpenXml.Drawing.Charts.BarGroupingValues>(DocumentFormat.OpenXml.Drawing.Charts.BarGroupingValues.Clustered) }));

                //Create the X data;
                string columnName = GetExcelColumnName(startY);
                string formulaString = string.Format("{0}!${1}${2}:${3}${4}", sheetName, columnName, startX + 1, columnName, endX);
                CategoryAxisData cad = new CategoryAxisData();
                cad.StringReference = new StringReference() { Formula = new DocumentFormat.OpenXml.Drawing.Charts.Formula(formulaString) };

                uint i = 0;
                for (int sIndex = 1; sIndex < (endY - startY) + 1; sIndex++)
                {
                    BarChartSeries barchartSeries = new BarChartSeries();
                    columnName = GetExcelColumnName(startY + sIndex);
                    formulaString = string.Format("{0}!${1}${2}", sheetName, columnName, startX);
                    SeriesText st = new SeriesText();
                    st.StringReference = new StringReference() { Formula = new DocumentFormat.OpenXml.Drawing.Charts.Formula(formulaString) };
                    formulaString = string.Format("{0}!${1}${2}:${3}${4}", sheetName, columnName, startX + 1, columnName, endX);
                    DocumentFormat.OpenXml.Drawing.Charts.Values value = new DocumentFormat.OpenXml.Drawing.Charts.Values();
                    value.NumberReference = new NumberReference() { Formula = new DocumentFormat.OpenXml.Drawing.Charts.Formula(formulaString) };
                    barchartSeries = barChart.AppendChild<BarChartSeries>(new BarChartSeries(new DocumentFormat.OpenXml.Drawing.Charts.Index() { Val = new UInt32Value(i) }, new Order() { Val = new UInt32Value(i) }, st, value));
                    if (sIndex == 1)
                        barchartSeries.AppendChild(cad);
                    i++;
                }

                barChart.Append(new AxisId() { Val = new UInt32Value(48650112u) });
                barChart.Append(new AxisId() { Val = new UInt32Value(48672768u) });

                // Add the Category Axis.
                CategoryAxis catAx = plotArea.AppendChild<CategoryAxis>(new CategoryAxis(new AxisId() { Val = new UInt32Value(48650112u) }, new Scaling(new Orientation()
                {
                    Val = new EnumValue<DocumentFormat.
                        OpenXml.Drawing.Charts.OrientationValues>(DocumentFormat.OpenXml.Drawing.Charts.OrientationValues.MinMax)
                }),
                    new AxisPosition() { Val = new EnumValue<AxisPositionValues>(AxisPositionValues.Bottom) },
                    new TickLabelPosition() { Val = new EnumValue<TickLabelPositionValues>(TickLabelPositionValues.NextTo) },
                    new CrossingAxis() { Val = new UInt32Value(48672768U) },
                    new Crosses() { Val = new EnumValue<CrossesValues>(CrossesValues.AutoZero) },
                    new AutoLabeled() { Val = new BooleanValue(true) },
                    new LabelAlignment() { Val = new EnumValue<LabelAlignmentValues>(LabelAlignmentValues.Center) },
                    new LabelOffset() { Val = new UInt16Value((ushort)100) }));

                // Add the Value Axis.
                ValueAxis valAx = plotArea.AppendChild<ValueAxis>(new ValueAxis(new AxisId() { Val = new UInt32Value(48672768u) },
                    new Scaling(new Orientation()
                    {
                        Val = new EnumValue<DocumentFormat.OpenXml.Drawing.Charts.OrientationValues>(
                            DocumentFormat.OpenXml.Drawing.Charts.OrientationValues.MinMax)
                    }),
                    new AxisPosition() { Val = new EnumValue<AxisPositionValues>(AxisPositionValues.Left) },
                    new MajorGridlines(),
                    new DocumentFormat.OpenXml.Drawing.Charts.NumberingFormat()
                    {
                        FormatCode = new StringValue("General"),
                        SourceLinked = new BooleanValue(true)
                    }, new TickLabelPosition()
                    {
                        Val = new EnumValue<TickLabelPositionValues>
                            (TickLabelPositionValues.NextTo)
                    }, new CrossingAxis() { Val = new UInt32Value(48650112U) },
                    new Crosses() { Val = new EnumValue<CrossesValues>(CrossesValues.AutoZero) },
                    new CrossBetween() { Val = new EnumValue<CrossBetweenValues>(CrossBetweenValues.Between) }));

                // Add the chart Legend.
                Legend legend = chart.AppendChild<Legend>(new Legend(new LegendPosition() { Val = new EnumValue<LegendPositionValues>(LegendPositionValues.Right) },
                    new Layout()));

                chart.Append(new PlotVisibleOnly() { Val = new BooleanValue(true) });

                // Save the chart part.
                chartPart.ChartSpace.Save();

                // Position the chart on the worksheet using a TwoCellAnchor object, rowId and ColumnId can be specified
                drawingsPart.WorksheetDrawing = new WorksheetDrawing();
                TwoCellAnchor twoCellAnchor = drawingsPart.WorksheetDrawing.AppendChild<TwoCellAnchor>(new TwoCellAnchor());
                twoCellAnchor.Append(new DocumentFormat.OpenXml.Drawing.Spreadsheet.FromMarker(new ColumnId("9"),
                    new ColumnOffset("581025"),
                    new RowId("17"),
                    new RowOffset("114300")));
                twoCellAnchor.Append(new DocumentFormat.OpenXml.Drawing.Spreadsheet.ToMarker(new ColumnId("17"),
                    new ColumnOffset("276225"),
                    new RowId("32"),
                    new RowOffset("0")));

                // Append a GraphicFrame to the TwoCellAnchor object.
                DocumentFormat.OpenXml.Drawing.Spreadsheet.GraphicFrame graphicFrame =
                    twoCellAnchor.AppendChild<DocumentFormat.OpenXml.
        Drawing.Spreadsheet.GraphicFrame>(new DocumentFormat.OpenXml.Drawing.
        Spreadsheet.GraphicFrame());
                graphicFrame.Macro = "";

                graphicFrame.Append(new DocumentFormat.OpenXml.Drawing.Spreadsheet.NonVisualGraphicFrameProperties(
                    new DocumentFormat.OpenXml.Drawing.Spreadsheet.NonVisualDrawingProperties() { Id = new UInt32Value(2u), Name = "Chart 1" },
                    new DocumentFormat.OpenXml.Drawing.Spreadsheet.NonVisualGraphicFrameDrawingProperties()));

                graphicFrame.Append(new Transform(new Offset() { X = 0L, Y = 0L },
                                                                        new Extents() { Cx = 0L, Cy = 0L }));

                graphicFrame.Append(new Graphic(new GraphicData(new ChartReference() { Id = drawingsPart.GetIdOfPart(chartPart) }) { Uri = "http://schemas.openxmlformats.org/drawingml/2006/chart" }));

                twoCellAnchor.Append(new ClientData());

                // Save the WorksheetDrawing object.
                drawingsPart.WorksheetDrawing.Save();

            }
        }


        private static string GetExcelColumnName(int colNum)
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

    }
}
