﻿using System;

namespace DataEditorPortal.Web.Models
{
    public class LookupItem
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string QueryText { get; set; }
        public string ConnectionName { get; set; }
        public Guid? PortalItemId { get; set; }
    }
}