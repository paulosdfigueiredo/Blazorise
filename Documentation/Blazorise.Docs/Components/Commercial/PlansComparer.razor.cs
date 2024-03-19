using Blazorise.Docs.Services;
using Microsoft.AspNetCore.Components;

namespace Blazorise.Docs.Components.Commercial
{
    public partial class PlansComparer
    {
        [Inject] PricingService PricingService { get; set; }

        [Parameter] public int Quantity { get; set; }

        [Parameter] public string Plan { get; set; }
    }
}
