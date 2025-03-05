#region Using directives
using System;
#endregion

namespace Blazorise.Scheduler;

/// <summary>
/// Event arguments for the <see cref="Scheduler{TItem}.SlotClicked"/> event.
/// </summary>
public class SchedulerSlotClickedEventArgs : EventArgs
{
    /// <summary>
    /// A default constructor for the <see cref="SchedulerSlotClickedEventArgs"/>.
    /// </summary>
    /// <param name="date"></param>
    /// <param name="time"></param>
    public SchedulerSlotClickedEventArgs( DateOnly date, TimeOnly time )
    {
        Date = date;
        Time = time;
    }

    /// <summary>
    /// Gets the date that was clicked.
    /// </summary>
    public DateOnly Date { get; }

    /// <summary>
    /// Gets the time that was clicked.
    /// </summary>
    public TimeOnly Time { get; }
}