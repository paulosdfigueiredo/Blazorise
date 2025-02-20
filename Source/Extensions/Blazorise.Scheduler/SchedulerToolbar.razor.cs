#region Using directives
using Microsoft.AspNetCore.Components;
#endregion

namespace Blazorise.Scheduler;

public partial class SchedulerToolbar
{
    #region Methods

    protected override void OnInitialized()
    {
        Scheduler?.NotifySchedulerToolbar( this );

        base.OnInitialized();
    }
    #endregion

    #region Properties

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
