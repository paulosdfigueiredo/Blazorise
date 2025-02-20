#region Using directives
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Components;
#endregion

namespace Blazorise.Scheduler.Components;

public partial class _SchedulerCell
{
    #region Members

    #endregion

    #region Methods

    #endregion

    #region Properties

    IEnumerable<SchedulerAppointment> Appointments => Scheduler?.Appointments
        ?.Where( x => x.Start.Year == SelectedDate?.Year && x.Start.Month == SelectedDate?.Month && x.Start.Day == SelectedDate?.Day && x.Start.Hour == Hour );

    /// <summary>
    /// Gets or sets the scheduler component that the views belong to.
    /// </summary>
    [CascadingParameter] public Scheduler Scheduler { get; set; }

    [Parameter] public DateTime? SelectedDate { get; set; }

    [Parameter] public int Hour { get; set; }

    #endregion
}
