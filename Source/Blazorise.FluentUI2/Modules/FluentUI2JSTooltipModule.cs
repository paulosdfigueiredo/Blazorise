﻿using Blazorise.Modules;
using Microsoft.JSInterop;

namespace Blazorise.FluentUI2.Modules;

internal class FluentUI2JSTooltipModule : JSTooltipModule
{
    public FluentUI2JSTooltipModule( IJSRuntime jsRuntime, IVersionProvider versionProvider, BlazoriseOptions options )
        : base( jsRuntime, versionProvider, options )
    {
    }

    public override string ModuleFileName => $"./_content/Blazorise.FluentUI2/tooltip.js?v={VersionProvider.Version}";
}