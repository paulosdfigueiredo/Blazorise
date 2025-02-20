#region Using directives
using System.Threading.Tasks;
using Blazorise.Utilities;
using Microsoft.AspNetCore.Components;
#endregion

namespace Blazorise.Scheduler.Components;

public partial class _SchedulerToolbar : BaseComponent
{
    #region Members

    #endregion

    #region Methods

    /// <inheritdoc/>
    override protected void BuildClasses( ClassBuilder builder )
    {
        builder.Append( "b-scheduler-toolbar" );

        base.BuildClasses( builder );
    }

    protected async Task OnPreviousClick()
    {
        if ( Scheduler is not null )
            await Scheduler.NavigatePrevious();
    }

    protected async Task OnNextClick()
    {
        if ( Scheduler is not null )
            await Scheduler.NavigateNext();
    }

    protected async Task OnTodayClick()
    {
        if ( Scheduler is not null )
            await Scheduler.NavigateToday();
    }

    protected async Task OnDayViewClick()
    {
        if ( Scheduler is not null )
            await Scheduler.NavigateDayView();
    }

    protected async Task OnWeekViewClick()
    {
        if ( Scheduler is not null )
            await Scheduler.NavigateWeekView();
    }

    #endregion

    #region Properties

    protected bool DayViewSelected => Scheduler?.SelectedView == SchedulerView.Day;

    protected bool WeekViewSelected => Scheduler?.SelectedView == SchedulerView.Week;

    /// <summary>
    /// Gets or sets the scheduler component that the toolbar belongs to.
    /// </summary>
    [CascadingParameter] public Scheduler Scheduler { get; set; }

    /// <summary>
    /// Gets or sets the content to be rendered inside the component.
    /// </summary>
    /// <remarks>
    /// This property allows developers to define custom content within the <see cref="SchedulerToolbar"/> component.
    /// </remarks>
    [Parameter] public RenderFragment ChildContent { get; set; }

    #endregion
}
