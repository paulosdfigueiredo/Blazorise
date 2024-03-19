#region Using directives
using System.Threading.Tasks;
using Blazorise.Docs.Services;
using Microsoft.AspNetCore.Components;
#endregion

namespace Blazorise.Docs.Components.Commercial;

public partial class PurchaseButton
{
    #region Methods

    async Task OnPurchaseClicked()
    {
        await CheckoutService.SetProductId( ProductId );
        await CheckoutService.SetQuantity( Quantity );

        NavigationManager.NavigateTo( "checkout/product-details" );
    }

    #endregion

    #region Properties

    [Inject] CheckoutService CheckoutService { get; set; }

    [Inject] NavigationManager NavigationManager { get; set; }

    [Parameter] public Color Color { get; set; }

    [Parameter] public int ProductId { get; set; }

    [Parameter] public int Quantity { get; set; }

    [Parameter] public object Upsell { get; set; }

    [Parameter] public string ProductName { get; set; }

    [Parameter] public RenderFragment ChildContent { get; set; }

    #endregion
}
