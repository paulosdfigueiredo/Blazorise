#region Using directives
using System;
using Microsoft.AspNetCore.Components;
#endregion

namespace Blazorise.Scheduler.Components;

public partial class _SchedulerWeekView<TItem>
{
    #region Members

    #endregion

    #region Methods

    #endregion

    #region Properties

    /// <summary>
    /// Gets or sets the scheduler component that the view belongs to.
    /// </summary>
    [CascadingParameter] public Scheduler<TItem> Scheduler { get; set; }

    [Parameter] public DateOnly? SelectedDate { get; set; }

    [Parameter] public TimeOnly? StartTime { get; set; }

    [Parameter] public TimeOnly? EndTime { get; set; }

    #endregion
}
