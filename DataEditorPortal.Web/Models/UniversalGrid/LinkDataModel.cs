using System.Collections.Generic;

namespace DataEditorPortal.Web.Models.UniversalGrid
{
    /// <summary>
    /// This model is used for passing value to Link Data Editor
    /// </summary>
    public class LinkDataModel
    {
        /// <summary>
        /// Send ids to front end, using this field.
        /// </summary>
        public List<RelationDataModel> RelationData { get; set; } = new List<RelationDataModel>();
        /// <summary>
        /// If user unlink any data, put the id in this field and send to backend
        /// </summary>
        public List<string> IdsOfRelationTableForRemove { get; set; } = new List<string>();
        /// <summary>
        /// If user link any new data, put the id in this field and send to backend
        /// </summary>
        public List<string> IdsOfTable2ForAdd { get; set; } = new List<string>();
    }

    public class RelationDataModel
    {
        public string Id { get; set; }
        public string Table1Id { get; set; }
        public string Table2Id { get; set; }
    }
}
