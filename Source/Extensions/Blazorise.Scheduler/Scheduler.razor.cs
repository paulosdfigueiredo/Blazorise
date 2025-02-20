#region Using directives
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Blazorise.Utilities;
using Microsoft.AspNetCore.Components;
#endregion

namespace Blazorise.Scheduler;

public partial class Scheduler : BaseComponent
{
    #region Members

    private SchedulerToolbar schedulerToolbar;

    private SchedulerDayView schedulerDayView;

    private SchedulerWeekView schedulerWeekView;

    #endregion

    #region Methods

    override protected void BuildClasses( ClassBuilder builder )
    {
        builder.Append( "b-scheduler" );

        base.BuildClasses( builder );
    }

    internal void NotifySchedulerToolbar( SchedulerToolbar schedulerToolbar )
    {
        this.schedulerToolbar = schedulerToolbar;
    }

    internal void NotifySchedulerDayView( SchedulerDayView schedulerDayView )
    {
        this.schedulerDayView = schedulerDayView;
    }

    internal void NotifySchedulerWeekView( SchedulerWeekView schedulerWeekView )
    {
        this.schedulerWeekView = schedulerWeekView;
    }

    public async Task NavigatePrevious()
    {
        SelectedDate = SelectedDate.AddDays( -1 );
        await SelectedDateChanged.InvokeAsync( SelectedDate );
        await InvokeAsync( StateHasChanged );
    }

    public async Task NavigateNext()
    {
        SelectedDate = SelectedDate.AddDays( 1 );
        await SelectedDateChanged.InvokeAsync( SelectedDate );
        await InvokeAsync( StateHasChanged );
    }

    public async Task NavigateToday()
    {
        SelectedDate = DateTime.Today;
        await SelectedDateChanged.InvokeAsync( SelectedDate );
        await InvokeAsync( StateHasChanged );
    }

    public async Task NavigateDayView()
    {
        SelectedView = SchedulerView.Day;
        await SelectedViewChanged.InvokeAsync( SelectedView );
        await InvokeAsync( StateHasChanged );
    }

    public async Task NavigateWeekView()
    {
        SelectedView = SchedulerView.Week;
        await SelectedViewChanged.InvokeAsync( SelectedView );
        await InvokeAsync( StateHasChanged );
    }

    #endregion

    #region Properties

    /// <summary>
    /// Indicates if the day view should be displayed.
    /// </summary>
    protected bool ShowDayView => schedulerDayView is not null && SelectedView == SchedulerView.Day;

    /// <summary>
    /// Indicates if the week view should be displayed.
    /// </summary>
    protected bool ShowWeekView => schedulerDayView is not null && SelectedView == SchedulerView.Week;

    /// <summary>
    /// Gets or sets the collection of appointments to be displayed in the scheduler.
    /// </summary>
    [Parameter] public IEnumerable<SchedulerAppointment> Appointments { get; set; }

    /// <summary>
    /// The currently selected date. Determines the date that is displayed in the scheduler.
    /// </summary>
    [Parameter] public DateTime SelectedDate { get; set; } = DateTime.Today;

    /// <summary>
    /// Occurs when the selected date changes.
    /// </summary>
    [Parameter] public EventCallback<DateTime> SelectedDateChanged { get; set; }

    /// <summary>
    /// The currently selected view. Determines the view that is displayed in the scheduler.
    /// </summary>
    [Parameter] public SchedulerView SelectedView { get; set; }

    /// <summary>
    /// Occurs when the selected view changes.
    /// </summary>
    [Parameter] public EventCallback<SchedulerView> SelectedViewChanged { get; set; }

    /// <summary>
    /// Gets or sets the content to be rendered inside the component.
    /// </summary>
    /// <remarks>
    /// This property allows developers to define custom content within the <see cref="Scheduler"/> component.
    /// </remarks>
    [Parameter] public RenderFragment ChildContent { get; set; }

    #endregion
}
