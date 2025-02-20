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

    private SchedulerView schedulerView;

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

    internal void NotifySchedulerView( SchedulerView schedulerView )
    {
        this.schedulerView = schedulerView;
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

    #endregion

    #region Properties

    /// <summary>
    /// Gets or sets the collection of appointments to be displayed in the scheduler.
    /// </summary>
    [Parameter] public IEnumerable<SchedulerAppointment> Appointments { get; set; }

    /// <summary>
    /// Gets or sets the selected date.
    /// </summary>
    [Parameter] public DateTime SelectedDate { get; set; } = DateTime.Today;

    /// <summary>
    /// Occurs when the selected date changes.
    /// </summary>
    [Parameter] public EventCallback<DateTime> SelectedDateChanged { get; set; }

    /// <summary>
    /// Gets or sets the content to be rendered inside the component.
    /// </summary>
    /// <remarks>
    /// This property allows developers to define custom content within the <see cref="Scheduler"/> component.
    /// </remarks>
    [Parameter] public RenderFragment ChildContent { get; set; }

    #endregion
}
