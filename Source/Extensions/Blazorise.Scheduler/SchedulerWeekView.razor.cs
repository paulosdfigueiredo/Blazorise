#region Using directives
using System;
using Microsoft.AspNetCore.Components;
#endregion

namespace Blazorise.Scheduler;

public partial class SchedulerWeekView<TItem>
{
    #region Methods

    protected override void OnInitialized()
    {
        Scheduler?.NotifySchedulerWeekView( this );

        base.OnInitialized();
    }

    #endregion

    #region Properties

    /// <summary>
    /// Gets or sets the scheduler component that the view belongs to.
    /// </summary>
    [CascadingParameter] public Scheduler<TItem> Scheduler { get; set; }

    [Parameter] public TimeOnly? StartTime { get; set; }

    [Parameter] public TimeOnly? EndTime { get; set; }

    #endregion
}
