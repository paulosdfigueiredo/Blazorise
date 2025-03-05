#region Using directives
using System.Threading.Tasks;
using Blazorise.Utilities;
using Microsoft.AspNetCore.Components;
#endregion

namespace Blazorise.Scheduler.Components;

public partial class _SchedulerToolbar<TItem> : BaseComponent
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
        if ( SchedulerState?.PrevDayRequested is not null )
            await SchedulerState.PrevDayRequested.InvokeCallbackAsync();
    }

    protected async Task OnNextClick()
    {
        if ( SchedulerState?.NextDayRequested is not null )
            await SchedulerState.NextDayRequested.InvokeCallbackAsync();
    }

    protected async Task OnTodayClick()
    {
        if ( SchedulerState?.TodayRequested is not null )
            await SchedulerState.TodayRequested.InvokeCallbackAsync();
    }

    protected async Task OnDayViewClick()
    {
        if ( SchedulerState?.DayViewRequested is not null )
            await SchedulerState.DayViewRequested.InvokeCallbackAsync();
    }

    protected async Task OnWeekViewClick()
    {
        if ( SchedulerState?.WeekViewRequested is not null )
            await SchedulerState.WeekViewRequested.InvokeCallbackAsync();
    }

    #endregion

    #region Properties

    protected bool DayViewSelected => Scheduler?.SelectedView == SchedulerView.Day;

    protected bool WeekViewSelected => Scheduler?.SelectedView == SchedulerView.Week;

    /// <summary>
    /// Gets or sets the scheduler component that the toolbar belongs to.
    /// </summary>
    [CascadingParameter] public Scheduler<TItem> Scheduler { get; set; }

    /// <summary>
    /// Gets or sets the scheduler state.
    /// </summary>
    [CascadingParameter] public SchedulerState SchedulerState { get; set; }

    /// <summary>
    /// Gets or sets the content to be rendered inside the component.
    /// </summary>
    /// <remarks>
    /// This property allows developers to define custom content within the <see cref="SchedulerToolbar{TItem}"/> component.
    /// </remarks>
    [Parameter] public RenderFragment ChildContent { get; set; }

    #endregion
}
