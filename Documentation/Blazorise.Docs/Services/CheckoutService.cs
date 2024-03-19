#region Using directives
using System.Globalization;
using System.Threading.Tasks;
using Blazored.LocalStorage;
using Blazorise.Docs.Models;
#endregion

namespace Blazorise.Docs.Services;

public class CheckoutService
{
    #region Members

    private readonly PricingService pricingService;

    private readonly ILocalStorageService localStorageService;

    private Product product;

    private int quantity = 1;

    #endregion

    #region Constructors

    public CheckoutService( PricingService pricingService, ILocalStorageService localStorageService )
    {
        this.pricingService = pricingService;
        this.localStorageService = localStorageService;
    }

    #endregion

    #region Methods

    public async Task<int> GetProductId()
    {
        return await localStorageService.GetItemAsync<int>( "productId" );
    }

    public async Task<int> GetQuantity()
    {
        return await localStorageService.GetItemAsync<int>( "quantity" );
    }

    public async Task SetProductId( int productId )
    {
        product = pricingService.GetProduct( productId );

        await localStorageService.SetItemAsync( "productId", productId );
    }

    public async Task SetQuantity( int quantity )
    {
        this.quantity = quantity;

        await localStorageService.SetItemAsync( "quantity", quantity );
    }

    #endregion

    #region Properties

    public string Total => ( product.Price * quantity ).ToString( CultureInfo.InvariantCulture );

    #endregion
}
