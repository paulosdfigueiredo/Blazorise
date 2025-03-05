#region Using directives
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;
using Blazorise.Extensions;
using Blazorise.Infrastructure;
using Blazorise.Utilities;
using Microsoft.AspNetCore.Components;
using static System.Formats.Asn1.AsnWriter;
#endregion

namespace Blazorise.Scheduler;

/// <summary>
/// A scheduler component that allows users to view and manage appointments.
/// </summary>
public partial class Scheduler : BaseComponent, IAsyncDisposable
{
    #region Members

    /// <summary>
    /// Provides the state of the <see cref="Scheduler"/> component.
    /// </summary>
    private SchedulerState state = new();

    private SchedulerToolbar schedulerToolbar;
    private SchedulerDayView schedulerDayView;
    private SchedulerWeekView schedulerWeekView;

    private readonly EventCallbackSubscriber prevDaySubscriber;
    private readonly EventCallbackSubscriber nextDaySubscriber;
    private readonly EventCallbackSubscriber todaySubscriber;
    private readonly EventCallbackSubscriber dayViewSubscriber;
    private readonly EventCallbackSubscriber weekViewSubscriber;

    #endregion

    #region Constructors

    /// <summary>
    /// Default <see cref="Scheduler"/> constructor.
    /// </summary>
    public Scheduler()
    {
        prevDaySubscriber = new EventCallbackSubscriber( EventCallback.Factory.Create( this, NavigatePrevious ) );
        nextDaySubscriber = new EventCallbackSubscriber( EventCallback.Factory.Create( this, NavigateNext ) );
        todaySubscriber = new EventCallbackSubscriber( EventCallback.Factory.Create( this, NavigateToday ) );
        dayViewSubscriber = new EventCallbackSubscriber( EventCallback.Factory.Create( this, NavigateDayView ) );
        weekViewSubscriber = new EventCallbackSubscriber( EventCallback.Factory.Create( this, NavigateWeekView ) );
    }

    #endregion

    #region Methods

    /// <inheritdoc/>
    protected override Task OnParametersSetAsync()
    {
        prevDaySubscriber.SubscribeOrReplace( State?.PrevDayRequested );
        nextDaySubscriber.SubscribeOrReplace( State?.NextDayRequested );
        todaySubscriber.SubscribeOrReplace( State?.TodayRequested );
        dayViewSubscriber.SubscribeOrReplace( State?.DayViewRequested );
        weekViewSubscriber.SubscribeOrReplace( State?.WeekViewRequested );

        return base.OnParametersSetAsync();
    }

    /// <inheritdoc/>
    public override async Task SetParametersAsync( ParameterView parameters )
    {
        var dateChanged = parameters.TryGetValue<DateOnly>( nameof( Date ), out var paramDate ) && !state.SelectedDate.IsEqual( paramDate );

        if ( dateChanged )
        {
            state.SelectedDate = paramDate;
        }

        await base.SetParametersAsync( parameters );
    }

    /// <inheritdoc/>
    override protected void BuildClasses( ClassBuilder builder )
    {
        builder.Append( "b-scheduler" );

        base.BuildClasses( builder );
    }

    /// <inheritdoc/>
    protected override async ValueTask DisposeAsync( bool disposing )
    {
        if ( disposing && Rendered )
        {
            prevDaySubscriber?.Dispose();
            nextDaySubscriber?.Dispose();
            todaySubscriber?.Dispose();
            dayViewSubscriber?.Dispose();
            weekViewSubscriber?.Dispose();
        }

        await base.DisposeAsync( disposing );
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

    /// <summary>
    /// Navigates to the previous date.
    /// </summary>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
    public async Task NavigatePrevious()
    {
        state.SelectedDate = state.SelectedDate.AddDays( SelectedView == SchedulerView.Week ? -7 : -1 );
        await DateChanged.InvokeAsync( state.SelectedDate );
        await InvokeAsync( StateHasChanged );
    }

    /// <summary>
    /// Navigates to the next date.
    /// </summary>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
    public async Task NavigateNext()
    {
        state.SelectedDate = state.SelectedDate.AddDays( SelectedView == SchedulerView.Week ? 7 : 1 );
        await DateChanged.InvokeAsync( state.SelectedDate );
        await InvokeAsync( StateHasChanged );
    }

    /// <summary>
    /// Navigates to the current date.
    /// </summary>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
    public async Task NavigateToday()
    {
        state.SelectedDate = DateOnly.FromDateTime( DateTime.Today );
        await DateChanged.InvokeAsync( state.SelectedDate );
        await InvokeAsync( StateHasChanged );
    }

    /// <summary>
    /// Navigates to the day view.
    /// </summary>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
    public async Task NavigateDayView()
    {
        SelectedView = SchedulerView.Day;
        await SelectedViewChanged.InvokeAsync( SelectedView );
        await InvokeAsync( StateHasChanged );
    }

    /// <summary>
    /// Navigates to the week view.
    /// </summary>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
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
    /// Gets the scheduler state.
    /// </summary>
    protected SchedulerState State => state;

    /// <summary>
    /// Gets or sets the collection of appointments to be displayed in the scheduler.
    /// </summary>
    [Parameter] public IEnumerable<SchedulerAppointment> Appointments { get; set; }

    /// <summary>
    /// The currently selected date. Determines the date that is displayed in the scheduler. Defaults to the current date.
    /// </summary>
    [Parameter] public DateOnly Date { get; set; }

    /// <summary>
    /// Occurs when the selected date changes.
    /// </summary>
    [Parameter] public EventCallback<DateOnly> DateChanged { get; set; }

    /// <summary>
    /// The first day of the week. Determines the first day of the week that is displayed in the scheduler.
    /// </summary>
    [Parameter] public DayOfWeek FirstDayOfWeek { get; set; } = DayOfWeek.Sunday;

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
