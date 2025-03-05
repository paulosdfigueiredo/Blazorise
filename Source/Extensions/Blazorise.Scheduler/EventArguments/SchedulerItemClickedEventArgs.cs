#region Using directives
using System;
#endregion

namespace Blazorise.Scheduler;

/// <summary>
/// Event arguments for the <see cref="Scheduler{TItem}.ItemClicked"/> event.
/// </summary>
/// <typeparam name="TItem"></typeparam>
public class SchedulerItemClickedEventArgs<TItem> : EventArgs
{
    /// <summary>
    /// A default constructor for the <see cref="SchedulerItemClickedEventArgs{TItem}"/>.
    /// </summary>
    /// <param name="item"></param>
    /// <param name="date"></param>
    /// <param name="time"></param>
    public SchedulerItemClickedEventArgs( TItem item, DateOnly date, TimeSpan time )
    {
        Item = item;
        Date = date;
        Time = time;
    }

    /// <summary>
    /// Gets the item that was clicked.
    /// </summary>
    public TItem Item { get; }

    /// <summary>
    /// Gets the date that was clicked.
    /// </summary>
    public DateOnly Date { get; }

    /// <summary>
    /// Gets the time that was clicked.
    /// </summary>
    public TimeSpan Time { get; }
}