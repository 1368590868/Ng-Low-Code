# Microsoft.SqlServer.Types
a .NET Standard implementation of the spatial types in `Microsoft.SqlServer.Types`

# Fixes
a. The lastest version(160.1000.6) on nuget is not supported Net 6. It is not based on Microsoft.Data.Client. https://www.nuget.org/packages/Microsoft.SqlServer.Types
b. Morten has develop a version to support Net 6. This code is forked from https://github.com/dotMorten/Microsoft.SqlServer.Types version: 2.5.0
c. Base on Morten's version, just sign the assembly and update the assembly version to 10.0.0.0 to make sure the aseembly loaded.
d. The official Microsoft.SqlServer.Types NuGet package is starting to add .NET 6 support, and bring cross-platform support online. 
e. Once new version released, we can remove this project and use the offical version.

