#region Using directives
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Blazorise.Docs.Models;
#endregion

namespace Blazorise.Docs.Services;

public class PricingService
{
    #region Members

    private List<Product> prices = new List<Product>()
    {
        new Product { Type = "Professional", Plan = "annually", Unit = "year", Name = "Blazorise Professional - Developer - Monthly", Price = 599, FullPrice = 708, ProductId = PaddlePrices.ProfessionalYearlySubscriptionPerDeveloper },
        new Product { Type = "Professional", Plan = "monthly", Unit = "month", Name = "Blazorise Professional - Developer", Price = 59, ProductId = PaddlePrices.ProfessionalMonthlySubscriptionPerDeveloper },
        new Product { Type = "Enterprise", Plan = "annually", Unit = "year", Name = "Blazorise Enterprise - Developer - Monthly", Price = 999, FullPrice = 1188, ProductId = PaddlePrices.EnterpriseYearlySubscriptionPerDeveloper },
        new Product { Type = "Enterprise", Plan = "monthly", Unit = "month", Name = "Blazorise Enterprise - Developer", Price = 99, ProductId = PaddlePrices.EnterpriseMonthlySubscriptionPerDeveloper },
    };

    #endregion

    #region Methods

    public Product GetProduct( int productId )
    {
        return prices.FirstOrDefault( x => x.ProductId == productId );
    }

    public int GetProductId( string plan, string type )
    {
        return prices.FirstOrDefault( x => x.Plan == plan && x.Type == type )?.ProductId ?? 0;
    }

    public int? GetPrice( string plan, string type )
    {
        return prices.FirstOrDefault( x => x.Plan == plan && x.Type == type )?.Price;
    }

    public string GetUnit( string plan, string type )
    {
        return prices.FirstOrDefault( x => x.Plan == plan && x.Type == type )?.Unit;
    }

    public string GetTotal( string plan, string type, int quantity )
    {
        var product = prices.FirstOrDefault( x => x.Plan == plan && x.Type == type );

        return ( product?.Price * quantity )?.ToString( CultureInfo.InvariantCulture );
    }

    public string GetTotalFull( string plan, string type, int quantity )
    {
        var product = prices.FirstOrDefault( x => x.Plan == plan && x.Type == type );

        return ( product?.FullPrice * quantity )?.ToString( CultureInfo.InvariantCulture );
    }

    #endregion
}
