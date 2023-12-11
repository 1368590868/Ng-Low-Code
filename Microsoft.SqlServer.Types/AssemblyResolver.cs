namespace Microsoft.SqlServer.Types
{
    public class MicrosoftSqlServerTypesAssemblyResolver
    {
        public static void Resolve()
        {
            AppDomain.CurrentDomain.AssemblyResolve += CurrentDomain_AssemblyResolve;
        }

        private static System.Reflection.Assembly? CurrentDomain_AssemblyResolve(object? sender, ResolveEventArgs args)
        {
            if (args.Name == "Microsoft.SqlServer.Types, Version=10.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91" ||
               args.Name == "Microsoft.SqlServer.Types, Version=11.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91" ||
               args.Name == "Microsoft.SqlServer.Types, Version=12.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91")
            {
                return typeof(SqlGeography).Assembly;
            }
            return null;
        }
    }

}
