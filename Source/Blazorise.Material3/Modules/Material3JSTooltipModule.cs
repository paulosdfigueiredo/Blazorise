using Blazorise.Modules;
using Microsoft.JSInterop;

namespace Blazorise.Material3.Modules;

public class Material3JSTooltipModule : JSTooltipModule
{
    public Material3JSTooltipModule( IJSRuntime jsRuntime, IVersionProvider versionProvider )
        : base( jsRuntime, versionProvider )
    {
    }

    public override string ModuleFileName => $"./_content/Blazorise.Material3/tooltip.js?v={VersionProvider.Version}";
}