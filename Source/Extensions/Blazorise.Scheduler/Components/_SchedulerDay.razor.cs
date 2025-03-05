#region Using directives
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
#endregion

namespace Blazorise.Scheduler.Components;

public partial class _SchedulerDay<TItem>
{
    #region Members

    #endregion

    #region Methods

    protected Task OnSlotClick( TimeSpan time )
    {
        Console.WriteLine( $"Slot clicked: {time}" );

        return Task.CompletedTask;
    }

    protected TimeSpan GetTime( int slotIndex )
    {
        if ( Slots <= 0 )
            return TimeSpan.Zero;

        var slotDuration = TimeSpan.FromHours( 1.0 / Slots );
        var time = slotDuration * ( slotIndex - 1 );

        return time;
    }

    #endregion

    #region Properties

    [Parameter] public DateOnly Date { get; set; }

    [Parameter] public int Hour { get; set; }

    [Parameter] public int Slots { get; set; } = 2;

    #endregion
}
