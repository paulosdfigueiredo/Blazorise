#region Using directives
using System;
using System.Collections.Generic;
using Blazorise.Modules;
using Microsoft.Extensions.DependencyInjection;
#endregion

namespace Blazorise.Material3;

public static class Config
{
    /// <summary>
    /// Adds a Material3 providers and component mappings.
    /// </summary>
    /// <param name="serviceCollection"></param>
    /// <returns></returns>
    public static IServiceCollection AddMaterial3Providers( this IServiceCollection serviceCollection, Action<IClassProvider> configureClassProvider = null )
    {
        var classProvider = new Material3ClassProvider();

        configureClassProvider?.Invoke( classProvider );

        serviceCollection.AddSingleton<IClassProvider>( classProvider );
        serviceCollection.AddSingleton<IStyleProvider, Material3StyleProvider>();
        serviceCollection.AddSingleton<IBehaviourProvider, Material3BehaviourProvider>();
        serviceCollection.AddScoped<IThemeGenerator, Material3ThemeGenerator>();

        serviceCollection.AddBootstrapComponents();

        serviceCollection.AddScoped<IJSModalModule, Modules.Material3JSModalModule>();
        serviceCollection.AddScoped<IJSTooltipModule, Modules.Material3JSTooltipModule>();

        return serviceCollection;
    }

    public static IServiceCollection AddBootstrapComponents( this IServiceCollection serviceCollection )
    {
        foreach ( var mapping in ComponentMap )
        {
            serviceCollection.AddTransient( mapping.Key, mapping.Value );
        }

        return serviceCollection;
    }

    public static IDictionary<Type, Type> ComponentMap => new Dictionary<Type, Type>
    {
    };
}