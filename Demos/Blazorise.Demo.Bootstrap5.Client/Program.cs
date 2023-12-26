using System.Threading.Tasks;
using Blazorise.Bootstrap5;
using Blazorise.Icons.FontAwesome;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

namespace Blazorise.Demo.Bootstrap5.Client;

public class Program
{
    public static async Task Main( string[] args )
    {
        var builder = WebAssemblyHostBuilder.CreateDefault( args );

        builder.Services
            .SetupDemoServices( builder.Configuration["Licensing:ProductToken"] )
            .AddBootstrap5Providers()
            .AddFontAwesomeIcons();

        await builder.Build().RunAsync();
    }
}
