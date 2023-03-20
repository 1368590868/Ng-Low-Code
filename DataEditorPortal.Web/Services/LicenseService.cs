using DataEditorPortal.Data.Contexts;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace DataEditorPortal.Web.Common
{
    public interface ILicenseService
    {
        string GetLicense();
        void SetLicense(string license);
        bool IsValid(string license);
        bool IsExpired(string license);
    }

    public class LicenseService : ILicenseService
    {
        /// <summary>
        /// Public key (Base64 string) to validate the license signature.
        /// See LicenseGenerator Project for more detail.
        /// </summary>
        private readonly string _publicKey = "PFJTQUtleVZhbHVlPjxNb2R1bHVzPnRZbWRDOU5jRGhtQTBWSlE4QWpjcllRVWp1bU54WXZFNVRzOU84VENBMEdYaEhqeEFuZ0RxdkY5SUxobUg3U3ErZEQvSUgraVlBQitJZ0UvTmxMOS83OWxEcjljN3d4SS9PZXAyc3BHTExYelVwN1pxWElwMjZmS3dYWEpmVGJhdHFwUldkYUp1ZGNIc0lCMHZFREV3cUNEZ3NVYVFGUVppdU1yOTBNMlVDVT08L01vZHVsdXM+PEV4cG9uZW50PkFRQUI8L0V4cG9uZW50PjwvUlNBS2V5VmFsdWU+";
        private string _license;
        private readonly IServiceProvider _serviceProvider;

        public LicenseService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public bool IsValid(string license)
        {
            RSACryptoServiceProvider rsa = new RSACryptoServiceProvider();
            rsa.FromXmlString(Encoding.ASCII.GetString(Convert.FromBase64String(_publicKey)));

            var RegExLineEnd = new Regex("\\r?\\n");
            license = RegExLineEnd.Replace(license, "\r\n");

            var signatureStartIndex = license.IndexOf("\r\n", license.IndexOf("EXPIRATION:")) + 2;
            var data = license.Substring(0, signatureStartIndex - 2);

            var signature = license.Substring(signatureStartIndex);

            return rsa.VerifyData(Encoding.ASCII.GetBytes(data), new SHA1CryptoServiceProvider(), Convert.FromBase64String(signature));
        }

        public bool IsExpired(string license)
        {
            if (!IsValid(license)) return true;

            var RegExLineEnd = new Regex("\\r?\\n");
            license = RegExLineEnd.Replace(license, "\r\n");

            var expirationStartIndex = license.IndexOf("\r\n", license.IndexOf("EMAIL:")) + 2;

            var date = license.Substring(expirationStartIndex + 11, 10);

            return Convert.ToDateTime(date) < DateTime.Now.Date.AddDays(1);
        }

        public string GetLicense()
        {
            if (string.IsNullOrEmpty(_license))
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var depDbContext = scope.ServiceProvider.GetRequiredService<DepDbContext>();
                    var siteSetting = depDbContext.SiteSettings.FirstOrDefault();
                    _license = siteSetting.License;
                    depDbContext.SaveChanges();
                    depDbContext.DisposeAsync();
                }
            }
            return _license;
        }

        public void SetLicense(string license)
        {
            if (!IsValid(license))
                throw new DepException("The license provided is not valid.");

            var depDbContext = _serviceProvider.GetRequiredService<DepDbContext>();
            var siteSetting = depDbContext.SiteSettings.FirstOrDefault();
            siteSetting.License = license;
            depDbContext.SaveChanges();
            depDbContext.DisposeAsync();

            _license = license;
        }

    }
}
