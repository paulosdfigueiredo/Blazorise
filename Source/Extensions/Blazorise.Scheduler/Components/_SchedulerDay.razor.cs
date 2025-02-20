#region Using directives
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Components;
#endregion

namespace Blazorise.Scheduler.Components;

public partial class _SchedulerDay
{
    #region Members

    #endregion

    #region Methods

    #endregion

    #region Properties

    IEnumerable<SchedulerAppointment> Appointments => Scheduler?.Appointments
        ?.Where( x => x.Start.Year == Date?.Year && x.Start.Month == Date?.Month && x.Start.Day == Date?.Day && x.Start.Hour == Hour );

    /// <summary>
    /// Gets or sets the scheduler component that the views belong to.
    /// </summary>
    [CascadingParameter] public Scheduler Scheduler { get; set; }

    [Parameter] public DateTime? Date { get; set; }

    [Parameter] public int Hour { get; set; }

    #endregion
}
