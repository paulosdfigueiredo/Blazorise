#region Using directives
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
#endregion

namespace Blazorise.Scheduler.Components;

public partial class _SchedulerWeekView
{
    #region Members

    #endregion

    #region Methods

    #endregion

    #region Properties

    /// <summary>
    /// Gets or sets the scheduler component that the view belongs to.
    /// </summary>
    [CascadingParameter] public Scheduler Scheduler { get; set; }

    [Parameter] public DateTime? SelectedDate { get; set; }

    [Parameter] public TimeOnly? StartTime { get; set; }

    [Parameter] public TimeOnly? EndTime { get; set; }

    #endregion
}
