#region Using directives
using Blazorise.Utilities;
using Microsoft.AspNetCore.Components;
#endregion

namespace Blazorise.Scheduler;

public partial class SchedulerToolbar : BaseComponent
{
    #region Members

    #endregion

    #region Methods

    override protected void BuildClasses( ClassBuilder builder )
    {
        builder.Append( "b-scheduler-toolbar" );

        base.BuildClasses( builder );
    }

    #endregion

    #region Properties

    /// <summary>
    /// Gets or sets the content to be rendered inside the component.
    /// </summary>
    /// <remarks>
    /// This property allows developers to define custom content within the <see cref="SchedulerToolbar"/> component.
    /// </remarks>
    [Parameter] public RenderFragment ChildContent { get; set; }

    #endregion
}
