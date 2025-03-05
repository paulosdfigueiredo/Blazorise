#region Using directives
using System;
#endregion

namespace Blazorise.Scheduler.Extensions;

/// <summary>
/// Extension methods for the <see cref="DateTime"/> class.
/// </summary>
public static class DateTimeExtensions
{
    /// <summary>
    /// Returns the first day of the week for the given date.
    /// </summary>
    /// <param name="dt">The date to get the first day of the week for.</param>
    /// <param name="startOfWeek">The day of the week that should be considered the first day of the week.</param>
    /// <returns>The first day of the week for the given date.</returns>
    public static DateTime StartOfWeek( this DateTime dt, DayOfWeek startOfWeek )
    {
        int diff = ( 7 + ( dt.DayOfWeek - startOfWeek ) ) % 7;
        return dt.AddDays( -1 * diff ).Date;
    }

    /// <summary>
    /// Returns the first day of the week for the given date.
    /// </summary>
    /// <param name="dt">The date to get the first day of the week for.</param>
    /// <param name="startOfWeek">The day of the week that should be considered the first day of the week.</param>
    /// <returns>The first day of the week for the given date.</returns>
    public static DateOnly StartOfWeek( this DateOnly dt, DayOfWeek startOfWeek )
    {
        int diff = ( 7 + ( dt.DayOfWeek - startOfWeek ) ) % 7;
        return dt.AddDays( -1 * diff );
    }

    /// <summary>
    /// Returns the first day of the previous week for the given date.
    /// </summary>
    /// <param name="dt">The date to get the first day of the week for.</param>
    /// <param name="startOfWeek">The day of the week that should be considered the first day of the week.</param>
    /// <returns>The first day of the previous week for the given date.</returns>
    public static DateOnly StartOfPreviousWeek( this DateOnly dt, DayOfWeek startOfWeek )
    {
        int diff = ( 7 + ( dt.DayOfWeek - startOfWeek ) ) % 7;
        return dt.AddDays( diff == 0 ? -7 : -diff );
    }

    /// <summary>
    /// Returns the first day of the next week for the given date.
    /// </summary>
    /// <param name="dt">The date to get the first day of the week for.</param>
    /// <param name="startOfWeek">The day of the week that should be considered the first day of the week.</param>
    /// <returns>The first day of the week for the given date.</returns>
    public static DateOnly StartOfNextWeek( this DateOnly dt, DayOfWeek startOfWeek )
    {
        int diff = ( 7 + ( startOfWeek - dt.DayOfWeek ) ) % 7;
        return dt.AddDays( diff == 0 ? 7 : diff );
    }
}