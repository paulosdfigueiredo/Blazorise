using Blazorise.Modules;
using Microsoft.JSInterop;

namespace Blazorise.Material3.Modules;

public class Material3JSModalModule : JSModalModule
{
    public Material3JSModalModule( IJSRuntime jsRuntime, IVersionProvider versionProvider )
        : base( jsRuntime, versionProvider )
    {
    }

    public override string ModuleFileName => $"./_content/Blazorise.Material3/modal.js?v={VersionProvider.Version}";
}