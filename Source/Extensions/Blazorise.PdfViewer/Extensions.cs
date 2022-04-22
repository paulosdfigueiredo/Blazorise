namespace Blazorise.PdfViewer
{
    internal static class Extensions
    {
        public static string ToPdfPageTransitionString( this PdfPageTransition pdfPageTransition )
        {
            return pdfPageTransition switch
            {
                PdfPageTransition.PageByPage => "page-by-page",
                PdfPageTransition.Continuous => "continuous",
                _ => "continuous",
            };
        }
    }
}
