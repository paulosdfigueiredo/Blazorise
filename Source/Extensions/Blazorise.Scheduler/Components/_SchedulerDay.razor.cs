#region Using directives
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
#endregion

namespace Blazorise.Scheduler.Components;

public partial class _SchedulerDay
{
    #region Members

    #endregion

    #region Methods

    protected Task OnMouseEnter( MouseEventArgs eventArgs )
    {
        MouseHovering = true;

        return Task.CompletedTask;
    }

    protected Task OnMouseLeave( MouseEventArgs eventArgs )
    {
        MouseHovering = false;

        return Task.CompletedTask;
    }

    protected Task OnSlotClick( int slotIndex )
    {
        if ( Slots <= 0 )
            return Task.CompletedTask;

        var slotDuration = TimeSpan.FromHours( 1.0 / Slots );
        var time = slotDuration * ( slotIndex - 1 );

        Console.WriteLine( $"Slot {slotIndex} clicked: {time}" );

        return Task.CompletedTask;
    }

    #endregion

    #region Properties

    private bool MouseHovering { get; set; }

    private Blazorise.Background DayBackgroundColor => MouseHovering
        ? Blazorise.Background.Light
        : Blazorise.Background.Default;

    IEnumerable<SchedulerAppointment> Appointments => Scheduler?.Appointments
        ?.Where( x => x.Start.Year == Date?.Year && x.Start.Month == Date?.Month && x.Start.Day == Date?.Day && x.Start.Hour == Hour );

    /// <summary>
    /// Gets or sets the scheduler component that the views belong to.
    /// </summary>
    [CascadingParameter] public Scheduler Scheduler { get; set; }

    [Parameter] public DateTime? Date { get; set; }

    [Parameter] public int Hour { get; set; }

    [Parameter] public int Slots { get; set; } = 2;

    #endregion
}
