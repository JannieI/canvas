// Layout of each Widget object

export class Widget {
    // Widget layout - all dimensions in px EXCEPT font-size in em
    container: {
        backgroundColor: string;
        border: string;
        boxShadow: string;
        color: string;
        fontSize: number;
        height: number;
        left: number;
        title: string;
        top: number;
        width: number;
    };
    graph: {
        graphID: number;
        spec: any; 
    };
    properties: {
        widgetID: number;                       // Unique ID from DB
        dashboardID: number;                    // FK to DashboardID to which widget belongs
        widgetTabName: string;                  // FK to Tab Name where widget lives
        widgetCode: string;                     // Short Code ~ ShortName
        widgetName: string;                     // Descriptive Name

        widgetAddRestRow: boolean;              // True means add a row to data = SUM(rest)
        widgetCreatedDateTime: string;          // Created on
        widgetCreatedUserID: string;            // Created by
        widgetComments: string;                 // Optional comments
        widgetDataSourceName: string;           // DS Name in Eazl
        widgetDataSourceParameters: string;     // Optional DS parameters
        widgetDefaultExportFileType: string;    // User can select others at export time
        widgetDescription: string;              // User description
        widgetIndex: number;                    // Sequence number on dashboard
        widgetIsLocked: boolean;                // Protected against changes
        widgetHyperLinkTabNr: string;           // Optional Tab Nr to jump to
        widgetHyperLinkWidgetID: string;        // Optional Widget ID to jump to
        widgetLiked: [                          // Array of UserIDs that likes this
            {
                widgetLikedUserID: string; 
            }
        ];
        widgetPassword: string;                 // Optional password
        widgetRefreshedDateTime: string;        // Data Refreshed on
        widgetRefreshedUserID: string;          // Date Refreshed by
        widgetRefreshFrequency: number;         // Nr of seconds if RefreshMode = Repeatedly
        widgetRefreshMode: string;              // Manual, OnOpen, Repeatedly
        widgetReportName: string;               // Report (query) name in Eazl
        widgetReportParameters: string;         // Optional Report parameters
        widgetShowLimitedRows: number;          // 0 = show all, 5 = TOP 5, -3 = BOTTOM 3
        widgetSize: string;                     // Small, Medium, Large
        widgetSystemMessage: string;            // Optional for Canvas to say something to user
        widgetTitle: string;                    // Displayed at top of widget
        widgetType: string;                     // Bar, Pie, Text, etc
        widgetUpdatedDateTime: string;          // Updated on
        widgetUpdatedUserID: string;            // Updated by
    };
}
