using DataEditorPortal.Data.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataEditorPortal.Data.Models
{
    [Table("UPLOADED_FILE")]
    public class UploadedFile
    {
        [Key]
        [Column("ID")]
        public string Id { get; set; }
        [Column("DATA_ID")]
        public string DataId { get; set; }
        [Column("FILE_NAME")]
        public string FileName { get; set; }
        [Column("CONTENT_TYPE")]
        public string ContentType { get; set; }
        [Column("STORAGE_TYPE")]
        public FileStorageType StorageType { get; set; }
        [Column("COMMENTS")]
        public string Comments { get; set; }
        [Column("STATUS")]
        public UploadedFileStatus Status { get; set; }
        [Column("FILE_PATH")]
        public string FilePath { get; set; }
        [Column("FILE_BYTES")]
        public byte[] FileBytes { get; set; }
    }
}
