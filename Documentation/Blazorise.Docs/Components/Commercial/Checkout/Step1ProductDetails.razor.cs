using System.Threading.Tasks;
using Blazorise.Docs.Services;
using Microsoft.AspNetCore.Components;

namespace Blazorise.Docs.Components.Commercial.Checkout;

public partial class Step1ProductDetails
{
    protected override async Task OnAfterRenderAsync( bool firstRender )
    {
        if ( firstRender )
        {
            ProductId = await CheckoutService.GetProductId();
            Quantity = await CheckoutService.GetQuantity();

            if ( Quantity < 1 )
                Quantity = 1;

            await InvokeAsync( StateHasChanged );
        }

        await base.OnAfterRenderAsync( firstRender );
    }

    int ProductId { get; set; }

    int Quantity { get; set; }

    [Inject] PricingService PricingService { get; set; }

    [Inject] CheckoutService CheckoutService { get; set; }

    [Inject] NavigationManager NavigationManager { get; set; }
}
