using System.Threading.Tasks;
using Blazorise.Docs.Services;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Blazorise.Docs.Components.Commercial;

public partial class Pricing
{
    protected async Task OnProfessionalClicked()
    {
        await JSRuntime.InvokeVoidAsync( "blazorisePRO.paddle.openCheckout", PricingService.GetProductId( Plan, "Professional" ), Quantity );
    }

    protected async Task OnEnterpriseClicked()
    {
        await JSRuntime.InvokeVoidAsync( "blazorisePRO.paddle.openCheckout", PricingService.GetProductId( Plan, "Enterprise" ), Quantity );
    }

    Task OnProductOrderClicked()
    {
        NavigationManager.NavigateTo( $"purchase-order" );

        return Task.CompletedTask;
    }

    [Inject] IJSRuntime JSRuntime { get; set; }

    [Inject] NavigationManager NavigationManager { get; set; }

    [Inject] PricingService PricingService { get; set; }

    [Parameter] public int Quantity { get; set; }

    [Parameter] public EventCallback<int> QuantityChanged { get; set; }

    [Parameter] public string Plan { get; set; }

    [Parameter] public EventCallback<string> PlanChanged { get; set; }
}
