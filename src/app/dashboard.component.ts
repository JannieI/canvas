// Dashboard Builder
import { AfterViewInit }              from '@angular/core';
import { Component }                  from '@angular/core';
import { Directive }                  from '@angular/core';
import { ElementRef }                 from '@angular/core';
import { HostListener }               from '@angular/core';
import { OnInit }                     from '@angular/core';
import { QueryList }                  from '@angular/core';
import { Renderer }                   from '@angular/core';
import { ViewEncapsulation }          from '@angular/core';
import { ViewChild }                  from '@angular/core';
import { ViewChildren }               from '@angular/core';

import { Inject } from "@angular/core";
import { DOCUMENT } from '@angular/platform-browser';


//  PrimeNG stuffies
import { ConfirmationService }        from 'primeng/primeng';
import { MenuItem }                   from 'primeng/primeng';  
import { SelectItem }                 from 'primeng/primeng';

// Our Components
import { DashboardEditorComponent }   from './dashboard.editor.component';

// Our Services
import { EazlService }                from './eazl.service';
import { GlobalFunctionService }      from './global.function.service';
import { GlobalVariableService }      from './global.variable.service';

// Our models
import { CanvasColors }               from './data.chartcolors';
import { Dashboard }                  from './model.dashboards';
import { DashboardTab }               from './model.dashboardTabs';
import { Filter }                     from './model.filter';
import { Widget }                     from './model.widget';

// Vega stuffies
let vg = require('vega/index.js');

@Component({
    moduleId: module.id,
    selector: 'dashboard-component',
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.css'],
})

export class DashboardComponent implements OnInit, AfterViewInit {
    @ViewChildren('widgetContainter') childrenWidgetContainers: QueryList<ElementRef>;   // Attaches to # in DOM
    @ViewChildren('widgetText') childrenWidgetText: QueryList<ElementRef>;      // Attaches to # in DOM
    @ViewChildren('widget') childrenWidgets: QueryList<ElementRef>;             // Attaches to # in DOM
    @ViewChildren('widgetImage') childrenWidgetImage: QueryList<ElementRef>;    // Attaches to # in DOM

    @ViewChild(DashboardEditorComponent) dashboardEditor;                       // To run methods in it


// @HostListener('document:keyup', ['$event'])
// handleKeyboardEvent(event) { 
//     // Determines raw (x,y) change, and calls routine that does movement

//     if (event.code == 'ArrowUp') {
//         let offsetLeft = 0;
//         let offsetTop  = this.gridSize * -1;
//         this.moveWidgets(offsetLeft, offsetTop);
//     }
//     if (event.code == 'ArrowDown') {
//         let offsetLeft = 0;
//         let offsetTop  = this.gridSize;
//         this.moveWidgets(offsetLeft, offsetTop);
//     }
//     if (event.code == 'ArrowLeft') {
//         let offsetLeft = this.gridSize * -1;
//         let offsetTop  = 0;
//         this.moveWidgets(offsetLeft, offsetTop);
//     }
//     if (event.code == 'ArrowRight') {
//         let offsetLeft = this.gridSize;
//         let offsetTop  = 0;
//         this.moveWidgets(offsetLeft, offsetTop);
//     }
    
// }

    // Current status of Dashboard
    chartWidth: number;
    checkedScale: number;
    displayAdvancedDashboardFilter: boolean = false;
    hasAdvancedFilter: boolean = false;
    radioLabelval1: number;
    refreshDashboard: boolean = false;

    // Currently selected stuffies
    currentFilter: Filter;
    numberUntitledDashboards: number = 0;   // Suffix in naming new dashboards, Untitled + n
    numberUntitledTabs: number = 0;         // Suffix in naming new tabs, Untitled + n
    selectedCommentWidgetID: number;        // Current WidgetID for Comment
    selectedDashboardID: number;            // Currely Dashboard
    selectedDashboardName: any;             // Select Dashboard name in DropDown
    selectedDashboardTabName: any;          // Current DashboardTab
    selectedTabName: any;                   // Tab Name selected in DropDown
    selectedWidget: Widget = null;          // Selected widget during dragging
    selectedWidgetIDs: number[] = [];       // Array of WidgetIDs selected with mouse

    // Currently selected properties for a Widget, in the Palette
    selectedBackgroundColor: any;           // Selected bg color
    selectedBackgroundColorDashboard: any;  // Bg Color for the Dashboard body
    selectedBackgroundImageDashboard: any;  // Bg Image for the Dashboard body

    selectedBorder: string;
    selectedBoxShadow: string;
    selectedColor: any;
    selectedContainerFontSize: number;      // In em
    selectedContainerGridSize: number;      // In px
    showContainerHeader: boolean = true;

    // List of Dashboards read from DB
    dashboardDropDown: SelectItem[];
    dashboards: Dashboard[];

    // Tab stuffies, per Dashboard
    dashboardTabs: DashboardTab[];
    dashboardTabsDropDown:  SelectItem[];

    // Widget stuffies, per Dashboard
    containerStartX: number;                    // X of widget at drag start
    containerStartY: number;                    // Y of widget at drag start
    widgets: Widget[];                          // List of Widgets for a selected Dashboard
    widgetEndDragX: number;                     // End coordinates during dragging
    widgetEndDragY: number;                     // End coordinates during dragging
    widgetStartDragX: number;                   // Start coordinates during dragging
    widgetStartDragY: number;                   // Start coordinates during dragging
 
    // Variables for Startup properties of a Widget
    borderOptions: SelectItem[];                // Options for Border DropDown
    boxShadowOptions: SelectItem[];             // Options for Box-Shadow DropDown
    chartColor: SelectItem[];                   // Options for Backgroun-dColor DropDown
    fontSizeOptions: SelectItem[];              // Options for Font Size
    gridSizeOptions: SelectItem[];              // Options for Grid Size
    isDark: boolean = false;                    // Widget Header icons black if true
    gridSize: number;                           // Size of grid blocks, ie 3px x 3px
    snapToGrid: boolean = true;                 // If true, snap widgets to gridSize
    sampleColorWidgetBackgroundColor: string;   // Sample color of that selected from DropDown
    backgroundImageOptions: SelectItem[];       // Dashboard background images

    // Popup forms stuffies
    addEditModeWidgetEditor: string = '';       // Add or Edit was called
    deleteMode: boolean = false;                // True while busy deleting
    displayCommentsPopup:boolean = false;       // T/F to show Comments Popup form
    displayDashboardDetails: boolean = false;   // T/F to show Dashboard Details form
    displayTabDetails: boolean = false;         // T/F to show Tab Details form
    displayDashboardSettings: boolean = false;  // T/F to show the Dashboard Settings form
    widgetIDtoEdit: number;                     // ID of Widget being Editted (need to in *ngFor)
    displayEditWidget: boolean = false;         // T/F to show Widget Builder Popup form
    widgetDraggingEnabled: boolean = false;     // T/F to tell when we are in dragging mode
    widgetToEdit: Widget;                       // Widget to edit
    widgetToEditX: number;                      // X coordinate where new widget belongs
    widgetToEditY: number;                      // Y coordinate where new widget belongs
    
    // Expansion Areas when Widget buttons are clicked
    displayExpandBackgroundArea: boolean = false; 
    displayExpandBorder: boolean = false; 
    displayExpandBoxShadow: boolean = false; 
    displayExpandColor: boolean = false; 
    displayExpandFontSize: boolean = false; 
    displayExpandGridSize: boolean = false; 

    constructor(
        private canvasColors: CanvasColors,
        private confirmationService: ConfirmationService,
        private eazlService: EazlService,
        private element : ElementRef,
        private globalFunctionService: GlobalFunctionService,
        private globalVariableService: GlobalVariableService,
        private renderer : Renderer,
        @Inject(DOCUMENT) private document: Document
    ) {
     }

    ngOnInit() {
        // Initialise:  Initialize the directive/component after Angular first displays
        // the data-bound properties and sets the directive/component's input properties.
        // Called once, after the first ngOnChanges().
        this.globalFunctionService.printToConsole(this.constructor.name,'ngOnInit', '@Start');

        // Permanent settings and options for form

        // Background Colors Options
        this.chartColor = [];
        this.chartColor = this.canvasColors.getColors();

        // Border Options
        this.borderOptions = [];
        this.borderOptions.push({label:'None',          value:{id:1, name: 'transparent',           code: ''}});
        this.borderOptions.push({label:'Thick Black',   value:{id:1, name: '3px solid black',       code: '3px solid black'}});
        this.borderOptions.push({label:'Thin Black',    value:{id:1, name: '1px solid black',       code: '1px solid black'}});
        this.borderOptions.push({label:'Thin White',    value:{id:1, name: '1px solid white',       code: '1px solid white'}});

        // BoxShadow Options
        this.boxShadowOptions = [];
        this.boxShadowOptions.push({label:'None',       value:{id:1, name: '',                      code: ''}});
        this.boxShadowOptions.push({label:'Black',      value:{id:1, name: '2px 2px 12px black',    code: '2px 2px 12px black'}});
        this.boxShadowOptions.push({label:'Gray',       value:{id:1, name: '2px 2px 12px gray',     code: '2px 2px 12px gray'}});
        this.boxShadowOptions.push({label:'White',      value:{id:1, name: '2px 2px 12px white',    code: '2px 2px 12px white'}});

        // Font Size Options
        this.fontSizeOptions = [];
        this.fontSizeOptions.push({label:'1',   value:{id:1, name: '1em'}});
        this.fontSizeOptions.push({label:'2',   value:{id:1, name: '2em'}});

        // Grid Size Options - the name must be a NUMBER, in px
        this.gridSizeOptions = [];       
        this.gridSizeOptions.push({label:'1px',   value:{id:1, name: '1'}});
        this.gridSizeOptions.push({label:'2px',   value:{id:2, name: '2'}});
        this.gridSizeOptions.push({label:'3px',   value:{id:3, name: '3'}});
        this.gridSizeOptions.push({label:'6px',   value:{id:4, name: '6'}});
        this.gridSizeOptions.push({label:'9px',   value:{id:5, name: '9'}});
        this.gridSizeOptions.push({label:'12px',  value:{id:6, name: '12'}});
        this.gridSizeOptions.push({label:'30px',  value:{id:7, name: '30'}});

        // Background Images
        this.backgroundImageOptions = [];       
        this.backgroundImageOptions.push({label:'Dolphin',         value:{id:1, name: "url('../assets/CanvasBackgroundImages/dolphin-1078319_1280.jpg')"}});
        this.backgroundImageOptions.push({label:'River Sunset',    value:{id:2, name: "url('../assets/CanvasBackgroundImages/River Sunset.png')"}});
        this.backgroundImageOptions.push({label:'Snow Landscape',  value:{id:3, name: "url('../assets/CanvasBackgroundImages/snow landscape.jpg')"}});

        // Set startup stuffies
        this.snapToGrid = this.globalVariableService.snapToGrid.getValue();
        this.gridSize = this.globalVariableService.gridSize.getValue();

        // Get the list of dashboards from the DB
        this.getDashboards()
    }

    ngAfterViewInit() {
        // View initialised, after changes
        // Respond after Angular initializes the component's views and child views.
        // Called once after the first ngAfterContentChecked().
        // The DOM is now initialised, so the ViewChildren are available
   
        // This thing is called many, many times !!!  Basically whenever the mouse moves, etc
        // So, I dont think we should log it.  
        // this.globalFunctionService.printToConsole(this.constructor.name,'ngAfterViewInit', '@Start');
        // TODO - delete this makker as its empty ?
    }

    ngAfterViewChecked() {
        //  Respond after Angular checks the component's views and child views.
        // Called after the ngAfterViewInit and every subsequent ngAfterContentChecked().

        // TODO - this thing fires ALL the time.  Should we have it ?
        // this.globalFunctionService.printToConsole(this.constructor.name,'ngAfterViewChecked', '@Start');

        // Refresh the Dashboard; once
        if (this.refreshDashboard) {
            this.dashboardRefresh();
            this.refreshDashboard = false;
        }
    }

    public handleFormSubmit(returnedFilter: Filter): void {
        // Is triggered after the Advanced Filter form is submitted
        this.globalFunctionService.printToConsole(this.constructor.name,'handleFormSubmit', '@Start');

        // Nothing filters, had filter before: reset Dashboard Dropdown
        if (!returnedFilter.hasAtLeastOneFilter) {

            this.currentFilter = null;

            if (this.hasAdvancedFilter) {
                this.hasAdvancedFilter = false;
                let emptyFilter: Filter = null;
                this.resetDashboardDropDowns(emptyFilter);
            }
        }
        else {
            this.currentFilter = returnedFilter;

            this.hasAdvancedFilter = true;
            this.resetDashboardDropDowns(returnedFilter);
        }

        // Close the popup
        this.displayAdvancedDashboardFilter = false;
    }

    public handleWidgetBuilderFormSubmit(returnCode: string): void {
        // Is triggered after the Advanced Filter form is submitted
        // TODO - due to the *ngFor, this thing runs 3 times. So, it is essential
        // to ensure we only update the correct and proper one
        this.globalFunctionService.printToConsole(this.constructor.name,'handleWidgetBuilderFormSubmit', '@Start');

        // Bail if Popup was Cancelled
        if (returnCode == "Cancel") {

            // Close the popup form for the Widget Builder
            this.displayEditWidget = false;

            return;
        }

        // Add new Widget to Array
        if (this.addEditModeWidgetEditor == "Add") {
            // Add the new guy to the Array

            // Only render our own
            if (this.widgetToEdit.properties.widgetTabName['name'] == 
                this.selectedDashboardTabName.toString()) {

                // TODO - this is crude & error prone: do it properly in DB
                let lastWidgetID = 
                    this.widgets[this.widgets.length - 1].properties.widgetID;

                // Set the Widget ID & Add to Array
                // TODO - do via Eazl into DB
                this.widgetToEdit.properties.widgetID = lastWidgetID + 1;
                this.widgets.push(this.widgetToEdit);

                // Refresh the Dashboard
                this.refreshDashboard = true;
            }
        
            // Inform the user
            this.globalVariableService.growlGlobalMessage.next({
                severity: 'info',
                summary:  'Success',
                detail:   'Widget added'
            });

            // // Close the popup form for the Widget Builder
            // this.displayEditWidget = false;
        }

        // Save the editted Widget back to the Array
        if (this.addEditModeWidgetEditor == "Edit") {

            // Loop on the Array, find the editted one and update
            for (var i = 0; i < this.widgets.length; i++) {

                if (this.widgets[i].properties.widgetID === 
                    this.widgetToEdit.properties.widgetID) {

                        // Update individual fields: if you replace the whole Array
                        // entry, everything dies.  Including position, svg rendered, etc
                        this.widgets[i].container.widgetTitle = 
                            this.widgetToEdit.container.widgetTitle;
                        this.widgets[i].properties.widgetTabName = 
                            this.widgetToEdit.properties.widgetTabName;
                        this.widgets[i].properties.widgetCode = 
                            this.widgetToEdit.properties.widgetCode;
                        this.widgets[i].properties.widgetName = 
                            this.widgetToEdit.properties.widgetName;
                        this.widgets[i].properties.widgetDescription = 
                            this.widgetToEdit.properties.widgetDescription;
                        this.widgets[i].properties.widgetHyperLinkTabNr = 
                            this.widgetToEdit.properties.widgetHyperLinkTabNr;
                        this.widgets[i].properties.widgetHyperLinkWidgetID = 
                            this.widgetToEdit.properties.widgetHyperLinkWidgetID;
                        this.widgets[i].properties.widgetRefreshMode = 
                            this.widgetToEdit.properties.widgetRefreshMode;
                        this.widgets[i].properties.widgetRefreshFrequency = 
                            this.widgetToEdit.properties.widgetRefreshFrequency;
                        this.widgets[i].properties.widgetDefaultExportFileType = 
                            this.widgetToEdit.properties.widgetDefaultExportFileType;
                        this.widgets[i].properties.widgetPassword = 
                            this.widgetToEdit.properties.widgetPassword;
                        this.widgets[i].properties.widgetReportName = 
                            this.widgetToEdit.properties.widgetReportName;
                        this.widgets[i].properties.widgetReportParameters = 
                            this.widgetToEdit.properties.widgetReportParameters;
                        this.widgets[i].properties.widgetShowLimitedRows = 
                            this.widgetToEdit.properties.widgetShowLimitedRows;
                        this.widgets[i].properties.widgetAddRestRow = 
                            this.widgetToEdit.properties.widgetAddRestRow;
                        this.widgets[i].properties.widgetType = 
                            this.widgetToEdit.properties.widgetType;
                        this.widgets[i].properties.widgetUpdatedDateTime = 
                            '2017/11/11 11:11';
                        this.widgets[i].properties.widgetUpdatedUserID = 
                            'JustinX;'
                }
            }

            // Refresh the Dashboard
            this.refreshDashboard = true;
        }

        // Close the popup form for the Widget Builder
        this.displayEditWidget = false;

    }

    clickContainerApply(){
        // Apply the new values on the Palette -> Container tab to the selected Widget
        this.globalFunctionService.printToConsole(this.constructor.name,'clickContainerApply', '@Start');

        // First, global stuffies like grid size
        // Grid Size
        if (this.selectedContainerGridSize != undefined) {
            // Update the data (for next time only, not moving anything now)
            this.globalVariableService.gridSize.next(
                +this.selectedContainerGridSize['name']
            );
        }


        // Loop on the Array of selected IDs, and do things to it
        for (var i = 0; i < this.selectedWidgetIDs.length; i++) {

            // Loop on the ViewChildren, and act for the Selected One
            let selectedElement = this.childrenWidgetContainers.filter(
                child  => child.nativeElement.id ==  this.selectedWidgetIDs[i].toString())[0] 

            if (selectedElement != undefined) {

                // Background Color
                if (this.selectedBackgroundColor) {
                    this.renderer.setElementStyle(selectedElement.nativeElement,
                        'background-color', this.selectedBackgroundColor['name']
                    );

                    // Update the data
                    this.widgets.filter(
                        widget => widget.properties.widgetID === 
                            this.selectedWidgetIDs[i])[0].
                                    container.backgroundColor = 
                                this.selectedBackgroundColor['name'];
                }

                // Border
                if (this.selectedBorder) {
                    this.renderer.setElementStyle(selectedElement.nativeElement,
                        'border', this.selectedBorder['name']
                    );

                    // Update the data
                    this.widgets.filter(
                        widget => widget.properties.widgetID === 
                            this.selectedWidgetIDs[i])[0].
                                    container.border = 
                                this.selectedBorder['name'];
                }

                // BoxShadow
                if (this.selectedBoxShadow) {
                    this.renderer.setElementStyle(selectedElement.nativeElement,
                        'box-shadow', this.selectedBoxShadow['name']
                    );

                    // Update the data
                    this.widgets.filter(
                        widget => widget.properties.widgetID === 
                            this.selectedWidgetIDs[i])[0].
                                    container.boxShadow = 
                                this.selectedBoxShadow['name'];
                }

                // Color
                if (this.selectedColor) {
                    this.renderer.setElementStyle(selectedElement.nativeElement,
                        'color', this.selectedColor['name']
                    );

                    // Update the data
                    this.widgets.filter(
                        widget => widget.properties.widgetID === 
                            this.selectedWidgetIDs[i])[0].
                                    container.color = 
                                this.selectedColor['name'];
                }

                // Font Size
                if (this.selectedContainerFontSize) {
                    this.renderer.setElementStyle(selectedElement.nativeElement,
                        'font-size', this.selectedContainerFontSize.toString() + 'em'
                    );

                    // Update the data
                    this.widgets.filter(
                        widget => widget.properties.widgetID === 
                            this.selectedWidgetIDs[i])[0].
                                    container.fontSize = 
                                this.selectedContainerFontSize['name'];
                }
            }
        }
    }

    dashboardAdvanceFilter() {
        // Pops up Advance Dashboard Filter
        this.globalFunctionService.printToConsole(this.constructor.name,'dashboardAdvanceFilter', '@Start');

        // Show popup
        this.displayAdvancedDashboardFilter = true
    }

    widgetShiftSelected(idWidget: number): boolean {
        // Return true / false if widget has been shift selected
        // TOD - this thing fires ALL the !@#$%#^%^ time - is that nice?  Better solution?
        // this.globalFunctionService.printToConsole(this.constructor.name,'widgetShiftSelected', '@Start');

        if (this.selectedWidgetIDs.indexOf(idWidget) >= 0) {
            return true
        } else {
            return false;
        }
    }

    changeElementRefProperty(
        elementRef: ElementRef,
        attributeToChange: string,
        newValue:string) {
        // Update the property of a given ElementRef BOTH in the array and in the DOM
        this.globalFunctionService.printToConsole(this.constructor.name,'changeElementRefProperty', '@Start');

        // Update DOM
        if (attributeToChange == 'left') {
            this.renderer.setElementStyle(elementRef.nativeElement,
                'left', newValue + "px"
            );
        }
        if (attributeToChange == 'top') {
            this.renderer.setElementStyle(elementRef.nativeElement,
                'top', newValue + "px"
            );
        }
        if (attributeToChange == 'width') {
            this.renderer.setElementStyle(elementRef.nativeElement,
                'width', newValue + "px"
            );
        }
        if (attributeToChange == 'height') {
            this.renderer.setElementStyle(elementRef.nativeElement,
                'height', newValue + "px"
            );
        }

    }

    clickDeleteWidget (idWidget: number) {
        // Delete the Widget, with confirmation of kors
        this.globalFunctionService.printToConsole(this.constructor.name,'clickDeleteWidget', '@Start');

        // See earlier note on deleteMode; its a whole story ...
        this.deleteMode = true;
        if (this.deleteMode) {
            this.confirmationService.confirm({
                message: 'Are you sure that you want to delete this Widget?',
                accept: () => {
                    this.widgetDeleteIt(idWidget);
                    this.deleteMode = false;
                },
                reject: () => {
                    this.deleteMode = false;
                }
            });
        }
    }

    widgetDeleteIt(idWidget: number) {
        // Delete Widget
        this.globalFunctionService.printToConsole(this.constructor.name,'widgetDeleteIt', '@Start');

        // Bring back the value field of the selected item.
        // TODO: could not get it via .value  Although this makes sense, see PrimeNG site,
        //       I had to make a workaround
        // Note: deleteMode is important to switch the loop off since we are in an *ngFor
        //       So, switch on when Delete Button is clicked, and switch off after 
        //       delete routine is invoked.  Also, the popup is *ngIf-ed to it
        if (this.deleteMode) {
            for (var i = 0; i < this.widgets.length; i++ ) {
                if (this.widgets[i].properties.widgetID == idWidget) {
                    this.globalFunctionService.printToConsole(
                        this.constructor.name,'widgetDeleteIt', 'Deleting Widget ID ' + idWidget + ' ...')
                    this.widgets.splice(i, 1);
            this.deleteMode = false;
                }
            }
        }
    }

    editWidget (idWidget: number) {
        // Show the Widget Editor
        this.globalFunctionService.printToConsole(this.constructor.name,'editWidget', '@Start');

        // Respect the Lock
        if (this.widgets.filter(
            widget => widget.properties.widgetID === 
                idWidget)[0].properties.widgetIsLocked) {
                this.globalVariableService.growlGlobalMessage.next({
                    severity: 'info', 
                    summary:  'Locked', 
                    detail:   'First unlock the Widget by clicking on lock, then edit'
                });
                return;
            }

        // Set the environment for Edit: current widget + mode
        this.displayEditWidget = true;
        this.widgetToEdit = this.widgets.filter(
            widget => widget.properties.widgetID === idWidget)[0] ;

        this.widgetIDtoEdit = idWidget;
        this.addEditModeWidgetEditor = 'Edit';
    }

    clickWidgetLockToggle(idWidget: number) {
        // Toggle widgetIsLocked on a Widget
        // TODO - when to DB, update on DB (of kors)
        this.globalFunctionService.printToConsole(this.constructor.name,'clickWidgetLockToggle', '@Start');

        for (var i = 0, len = this.widgets.length; i < len; i++) {
            if (this.widgets[i].properties.widgetID == idWidget) {
                this.widgets[i].properties.widgetIsLocked = 
                    !this.widgets[i].properties.widgetIsLocked;
            }
        }
    }

    clickWidgetIsLiked(idWidget: number) {
        // Toggle IsLiked on a Widget
        // TODO - when to DB, update properties.widgetLiked[j].widgetLikedUserID
        //        by adding user, or removing depending on likedness
        this.globalFunctionService.printToConsole(this.constructor.name,'clickWidgetIsLiked', '@Start');

        for (var i = 0, len = this.widgets.length; i < len; i++) {
            if (this.widgets[i].properties.widgetID == idWidget) {
                this.widgets[i].properties.widgetIsLiked = 
                    !this.widgets[i].properties.widgetIsLiked;
            }
        }
    }

    showWidgetComment (idWidget: number) {
        // Show the Comment popup window
        this.globalFunctionService.printToConsole(this.constructor.name,'showWidgetComment', '@Start');

        let widgetComment: string = this.widgets.filter(
                    widget => widget.properties.widgetID === idWidget)[0].properties.widgetComments;
        this.selectedCommentWidgetID = idWidget;
        this.displayCommentsPopup = true;
    }

    onWidgetDistanceChange(property: string) {
        // Changes the distance between shift-selected widgets (horisontally and vertically)
        this.globalFunctionService.printToConsole(this.constructor.name,'onWidgetDistanceChange', '@Start');

        // Get n, number of distances.  If only 1, bail since we need multiple widgets to play
        let numberDistances = this.selectedWidgetIDs.length - 1;
        if (numberDistances <= 1) {
            return
        }

        if (property == 'horisontalEquiDistant'         ||
            property == 'horisontalDecreaseDistance'    ||
            property == 'horisontalIncreaseDistance') {

            let selectedWidgetIDsWithLeft: {
                widgetID: number; 
                widgetLeft: number;
            } [];

            // We use an Array sorted on .left, so that things move in one direction
            selectedWidgetIDsWithLeft = [];
            for (var i = 0; i < this.selectedWidgetIDs.length; i++) {
                
                let thisWidget: Widget = this.widgets.filter(
                    widget => widget.properties.widgetID === this.selectedWidgetIDs[i]
                )[0]

                selectedWidgetIDsWithLeft.push( 
                    {
                        widgetID: thisWidget.properties.widgetID, 
                        widgetLeft: thisWidget.container.left
                    }
                );
            }

            let selectedWidgetIDsLeftSorted = selectedWidgetIDsWithLeft.sort(
                function (a, b) {
                    return a.widgetLeft - b.widgetLeft;
            })

            // Calc total between distance between first and last horisontal center in px
            let firstWidgetID: number = selectedWidgetIDsLeftSorted[0].widgetID
            let lastWidgetID: number = selectedWidgetIDsLeftSorted[numberDistances].widgetID

            let firstWidget: Widget = this.widgets.filter(
                    widget => widget.properties.widgetID === firstWidgetID
                )[0];
            let lastWidget: Widget =  this.widgets.filter(
                    widget => widget.properties.widgetID === lastWidgetID
                )[0];

            let firstCenter: number = firstWidget.container.left +
                (firstWidget.container.width / 2);
            let lastCenter: number =  lastWidget.container.left +
                (lastWidget.container.width / 2);

            if (property == 'horisontalEquiDistant') {
            
                // Adjust centers of middle lot, not first or last ones
                for (var i = 1; i < numberDistances; i++) {

                    let thisWidgetID: number = selectedWidgetIDsLeftSorted[i].widgetID
                    let currentLeft: number = this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.left;

                    let currentWidth: number = this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.width;

                    // T = Total distance between first and last Centers
                    // S = Single distance between 2 centers = T / numberDistances 
                    // C = new Center of internal Widget (first and last stays static)
                    //   = firstCenter + (i * S)
                    // L = new Left = C - ( currentWidth / 2)
                    let newLeft = firstCenter + 
                        i * ( (lastCenter - firstCenter) / numberDistances ) -
                        (currentWidth / 2);

                    this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.left = newLeft;

                    // Move the Container
                    this.childrenWidgetContainers.forEach((child) => {
                        if (child.nativeElement.id ==
                            thisWidgetID) {
                                this.renderer.setElementStyle(child.nativeElement,
                                    'left', newLeft.toString() + "px"
                                );
                        }
                    });
                }
            } 
     
            if (property == 'horisontalDecreaseDistance') {
            
                // Subtract 3px to all lefts, except the first one
                for (var i = 1; i < (numberDistances + 1); i++) {

                    let thisWidgetID: number = selectedWidgetIDsLeftSorted[i].widgetID
                    let currentLeft: number = this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.left;

                    // L = currentLeft + 3i (move 3px at a time)
                    let newLeft = currentLeft - (i * 3);

                    this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.left = newLeft;

                    // Move the Container
                    this.childrenWidgetContainers.forEach((child) => {
                        if (child.nativeElement.id ==
                            thisWidgetID) {
                                this.renderer.setElementStyle(child.nativeElement,
                                    'left', newLeft.toString() + "px"
                                );
                        }
                    });
                }
            }

            if (property == 'horisontalIncreaseDistance') {
            
                // Add 3px to all lefts, except the first one
                for (var i = 1; i < (numberDistances + 1); i++) {

                    let thisWidgetID: number = selectedWidgetIDsLeftSorted[i].widgetID
                    let currentLeft: number = this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.left;

                    // L = currentLeft + 3i (move 3px at a time)
                    let newLeft = currentLeft + (i * 3);

                    this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.left = newLeft;

                    // Move the Container
                    this.childrenWidgetContainers.forEach((child) => {
                        if (child.nativeElement.id ==
                            thisWidgetID) {
                                this.renderer.setElementStyle(child.nativeElement,
                                    'left', newLeft.toString() + "px"
                                );
                        }
                    });
                }
            }
        }

        if (property == 'verticalEquiDistant'           || 
           property == 'verticalIncreaseDistance'       ||   
           property == 'verticalDecreaseDistance') {
            let selectedWidgetIDsWithTop: {
                widgetID: number; 
                widgetTop: number;
            } [];

            // We use an Array sorted on .top, so that things move in one direction
            selectedWidgetIDsWithTop = [];
            for (var i = 0; i < this.selectedWidgetIDs.length; i++) {
                
                let thisWidget: Widget = this.widgets.filter(
                    widget => widget.properties.widgetID === this.selectedWidgetIDs[i]
                )[0]

                selectedWidgetIDsWithTop.push( 
                    {
                        widgetID: thisWidget.properties.widgetID, 
                        widgetTop: thisWidget.container.top
                    }
                );
            }

            let selectedWidgetIDsTopSorted = selectedWidgetIDsWithTop.sort(
                function (a, b) {
                    return a.widgetTop - b.widgetTop;
            })

            // Calc total between distance between first and last vertical middle in px
            let firstWidgetID: number = selectedWidgetIDsTopSorted[0].widgetID
            let lastWidgetID: number = selectedWidgetIDsTopSorted[numberDistances].widgetID

            let firstWidget: Widget = this.widgets.filter(
                    widget => widget.properties.widgetID === firstWidgetID
                )[0];
            let lastWidget: Widget =  this.widgets.filter(
                    widget => widget.properties.widgetID === lastWidgetID
                )[0];

            let firstMiddle: number = firstWidget.container.top +
                (firstWidget.container.height / 2)
            let lastMiddle: number =  lastWidget.container.top +
                (lastWidget.container.height / 2)

            if (property == 'verticalEquiDistant') { 
            
                // Adjust middles of middle lot, not first or last ones
                for (var i = 1; i < numberDistances; i++) {

                    let thisWidgetID: number = selectedWidgetIDsTopSorted[i].widgetID
                    let currentTop: number = this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.top;

                    let currentHeight: number = this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.height;

                    // T = Total distance between first and last Middles
                    // S = Single distance between 2 Middles = T / numberDistances 
                    // C = new Middle of internal Widget (first and last stays static)
                    //   = firstMiddle + (i * S)
                    // L = new Top = C - ( currentHeight / 2)
                    let newTop = firstMiddle + 
                        i * ( (lastMiddle - firstMiddle) / numberDistances ) -
                        (currentHeight / 2);

                    this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.top = newTop;

                    // Move the Container
                    // Loop on the ViewChildren, and act for the Selected One
                    this.childrenWidgetContainers.forEach((child) => {
                        if (child.nativeElement.id ==
                            thisWidgetID) {
                                this.renderer.setElementStyle(child.nativeElement,
                                    'top', newTop.toString() + "px"
                                );
                        }
                    });
                }
            }
            if (property == 'verticalDecreaseDistance') {
                // Subtract 3px from middles except the first one
                for (var i = 1; i < (numberDistances + 1); i++) {

                    let thisWidgetID: number = selectedWidgetIDsTopSorted[i].widgetID
                    let currentTop: number = this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.top;

                    // T = Top is moved with 3i (i times 3px)
                    let newTop = currentTop - (i * 3);

                    this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.top = newTop;

                    // Move the Container
                    // Loop on the ViewChildren, and act for the Selected One
                    this.childrenWidgetContainers.forEach((child) => {
                        if (child.nativeElement.id ==
                            thisWidgetID) {
                                this.renderer.setElementStyle(child.nativeElement,
                                    'top', newTop.toString() + "px"
                                );
                        }
                    });
                }
            }
            if (property == 'verticalIncreaseDistance') {
                // Add 3px from middles except the first one
                for (var i = 1; i < (numberDistances + 1); i++) {

                    let thisWidgetID: number = selectedWidgetIDsTopSorted[i].widgetID
                    let currentTop: number = this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.top;

                    // T = Top is moved with 3i (i times 3px)
                    let newTop = currentTop + (i * 3);

                    this.widgets.filter(
                        widget => widget.properties.widgetID === thisWidgetID
                    )[0].container.top = newTop;

                    // Move the Container
                    // Loop on the ViewChildren, and act for the Selected One
                    this.childrenWidgetContainers.forEach((child) => {
                        if (child.nativeElement.id ==
                            thisWidgetID) {
                                this.renderer.setElementStyle(child.nativeElement,
                                    'top', newTop.toString() + "px"
                                );
                        }
                    });
                }

            }
        }
    } 

    onWidgetAlign(property: string) {
        // Aligns the shift-selected widgets to the left, according to the last one
        this.globalFunctionService.printToConsole(this.constructor.name,'onWidgetAlign', '@Start');

        // Nothing was selected
        if (this.selectedWidgetIDs.length == 0) {
            return;
        }

        // Get the 'property' of the last one
        let newValue: number = 0;
        let lastLeft: number = this.widgets.filter(
                widget => widget.properties.widgetID === 
                this.selectedWidgetIDs[this.selectedWidgetIDs.length - 1])[0].
                container.left;
        let lastWidth: number = this.widgets.filter(
            widget => widget.properties.widgetID === 
            this.selectedWidgetIDs[this.selectedWidgetIDs.length - 1])[0].
            container.width;
        let lastTop: number = this.widgets.filter(
            widget => widget.properties.widgetID === 
            this.selectedWidgetIDs[this.selectedWidgetIDs.length - 1])[0].
            container.top;
        let lastHeight: number = this.widgets.filter(
            widget => widget.properties.widgetID === 
            this.selectedWidgetIDs[this.selectedWidgetIDs.length - 1])[0].
            container.height;

        // Update spec, looping on the ViewChildren to find the shift-selected ones
        this.childrenWidgetContainers.toArray().forEach ((child) => {

            if (this.selectedWidgetIDs.indexOf(+child.nativeElement.id) >= 0) {

                // Get the properties of the current one, to do calcs
                let currentLeft: number = this.widgets.filter(
                        widget => widget.properties.widgetID === 
                            +child.nativeElement.id)[0].container.left;
                let currentWidth: number = this.widgets.filter(
                    widget => widget.properties.widgetID === 
                        +child.nativeElement.id)[0].container.width;
                let currentTop: number = this.widgets.filter(
                    widget => widget.properties.widgetID === 
                        +child.nativeElement.id)[0].container.top;
                let currentHeight: number = this.widgets.filter(
                    widget => widget.properties.widgetID === 
                        +child.nativeElement.id)[0].container.height;

                let attributeToChange: string = 'left';
                if (property == 'left') { 
                    attributeToChange = 'left';
                    newValue = lastLeft;
                };
                if (property == 'center') { 
                    attributeToChange = 'left';
                    newValue = lastLeft + (lastWidth / 2) - (currentWidth / 2);
                };
                if (property == 'right') { 
                    attributeToChange = 'left';
                    newValue = lastLeft + lastWidth - currentWidth;
                };
                if (property == 'top') { 
                    attributeToChange = 'top';
                    newValue = lastTop ;
                };
                if (property == 'middle') { 
                    attributeToChange = 'top';
                    newValue = lastTop + (lastHeight / 2) - (currentHeight / 2);
                };
                if (property == 'bottom') { 
                    attributeToChange = 'top';
                    newValue = lastTop + lastHeight - currentHeight;
                };
                
                if (property == 'sameWidth') { 
                    attributeToChange = 'width';
                    newValue = lastWidth;
                };
                if (property == 'incrementWidth') { 
                    attributeToChange = 'width';
                    newValue = currentWidth + this.gridSize;
                };
                if (property == 'decrementWidth') { 
                    if (currentWidth > this.gridSize) {
                        attributeToChange = 'width';
                        newValue = currentWidth - this.gridSize;
                    }
                };
                if (property == 'sameHeight') { 
                    attributeToChange = 'height';
                    newValue = lastHeight;
                };
                if (property == 'incrementHeight') { 
                    attributeToChange = 'height';
                    newValue = currentHeight + this.gridSize;
                };
                if (property == 'decrementHeight') { 
                    if (currentHeight > this.gridSize) {
                        attributeToChange = 'height';
                        newValue = currentHeight - this.gridSize;
                    }
                };

                // Update widget - we only set left or top
                if (attributeToChange == 'left') {
                    this.widgets.filter(
                        widget => widget.properties.widgetID === 
                            +child.nativeElement.id)[0].container.left = newValue;
                    }
                if (attributeToChange == 'top') {
                    this.widgets.filter(
                        widget => widget.properties.widgetID === 
                            +child.nativeElement.id)[0].container.top = newValue;
                    }

                if (attributeToChange == 'width') {
                    this.widgets.filter(
                        widget => widget.properties.widgetID === 
                            +child.nativeElement.id)[0].container.width = newValue;
                    }
                if (attributeToChange == 'height') {
                    this.widgets.filter(
                        widget => widget.properties.widgetID === 
                            +child.nativeElement.id)[0].container.height = newValue;
                    }

                // Change DOM
                this.changeElementRefProperty(
                    child, 
                    attributeToChange, 
                    newValue.toString()
                );

            }
        });
    }

    onWidgetMouseDown(event: MouseEvent,idWidget: number) {
        // When mouse (with or without shift) is pressed on a Widget
        this.globalFunctionService.printToConsole(this.constructor.name,'onWidgetMouseDown', '@Start');

        // Kill dragging
        this.widgetDraggingEnabled = false;

        // If Shift was hold down, add to Array of Widgets selected
        if (event.shiftKey) {

            // Add if new, remove if old
            if (this.selectedWidgetIDs.indexOf(idWidget) >= 0) {
                this.selectedWidgetIDs.splice(
                    this.selectedWidgetIDs.indexOf(idWidget),1
                );
            } else {
                this.selectedWidgetIDs.push(idWidget);
            }

            //  Just adding the shift-clicked once, and then we gone again
            return;
        }

        // Previously many shift-clicks -> now only this guy
        if (this.selectedWidgetIDs.length > 1) {
            this.selectedWidgetIDs = [];
            this.selectedWidgetIDs.push(idWidget);
            return;
        }

        if (this.selectedWidgetIDs.indexOf(idWidget) >= 0) {
            // This guys was only one selected -> now nothing
            this.selectedWidgetIDs = [];
        } else { 
            // Only he is selected now
            this.selectedWidgetIDs = [];
            this.selectedWidgetIDs.push(idWidget);
        }
    }
 
    onWidgetKeyUp(event: MouseEvent,idWidget: number) {
        // TODO - the idea is to move the Widgets with the keyboard.  But I dont know 
        // how to catch it on a Widget as it does not have focus ...
        // Works if click delete, and then move arrows (its above a widget then methinks)
        // KeyboardEvent {isTrusted: true, key: "ArrowRight", code: "ArrowRight", location: 0, ctrlKey: false, …}
        console.log(event)
        
    }

    addNewTab() {
        // Add a new tab to this Dashboard
        // TODO - set IDs properly when going to DB - this is error prone
        this.globalFunctionService.printToConsole(this.constructor.name,'addNewTab', '@Start');

        // Bail if nothing selected
        if (this.selectedDashboardName == undefined) {
            this.globalVariableService.growlGlobalMessage.next({
                severity: 'warn', 
                summary:  'No Dashboard selected', 
                detail:   'First select a Dashboard'
            });

            return;
        }

        // Set Name
        this.numberUntitledTabs = this.numberUntitledDashboards + 1;
        let newWidgetTabName: string = 'Untitled - ' + this.numberUntitledTabs.toString();
        let maxID = this.dashboardTabs.length + 1;
        // Add
        // TODO - do via DB RESTi
        // TODO - do ID properly
        this.dashboardTabs.push (
            {
                dashboardID: this.selectedDashboardName.id,
                widgetTabID: maxID,
                widgetTabName: newWidgetTabName,
                widgetTabDescription: ''
            }
        );

        // Refresh the Array of Dashboards IF no current filter
        this.dashboardTabsDropDown.push({
            label: newWidgetTabName,
            value: {
                id: this.selectedDashboardName.id,
                name: newWidgetTabName
            }
        });

        // Tell the user
        this.globalVariableService.growlGlobalMessage.next({
            severity: 'info', 
            summary:  'Tab added', 
            detail:   'A new, empty Tab has been added: ' + 'Untitled - ' + 
                this.numberUntitledDashboards.toLocaleString()
        });
    }

    deleteTab() {
        // Delete selected Tab, provided its empty

        // Confirm if user really wants to delete
        // TODO - this guy needs Two clicks to close dialogue, but then deletes twice!!
        this.globalFunctionService.printToConsole(this.constructor.name,'deleteTab', '@Start');

        this.deleteMode = true;
        
        this.confirmationService.confirm({
            message: 'Are you sure that you want to delete this Tab?',
            accept: () => {
                this.TabDeleteIt();
                this.deleteMode = false;
            },
            reject: () => {
                this.deleteMode = false;
            }
        });
    }

    TabDeleteIt() {
        // Delete Dashboard button
        this.globalFunctionService.printToConsole(this.constructor.name,'TabDeleteIt', '@Start');

        // Bring back the value field of the selected item.
        // TODO: could not get it via .value  Although this makes sense, see PrimeNG site,
        //       I had to make a workaround
        // TODO: for now I dont have a Tab-ID field, as I thought the name must be unique 
        //       anyway.  Is this a really, really good idea?
        let TM: any = this.selectedTabName;

        // If something was selected, loop and find the right one
        if (TM != undefined) {

            // Can only delete Widgetless Tabs
            if (this.widgets.filter( w => w.properties.widgetTabName == TM.name).length >0) {
                this.globalVariableService.growlGlobalMessage.next({
                    severity: 'warn', 
                    summary:  'Tab NOT empty', 
                    detail:   'A Tab can only be deleted if it has no Widgets: ' + TM.name
                });

            // Bail
            return;
                
            }
            // Travers
            for (var i = 0; i < this.dashboardTabs.length; i++ ) {
                if (this.dashboardTabs[i].widgetTabName == TM.name) {
                    this.globalFunctionService.printToConsole(this.constructor.name,'TabDeleteIt', 'Deleting ' + TM.name + ' ...');
                    this.dashboardTabs.splice(i, 1);

                    // Tell the user
                    this.globalVariableService.growlGlobalMessage.next({
                        severity: 'info', 
                        summary:  'Tab deleted', 
                        detail:   'The Tab has been deleted: ' + TM.name
                    });

                    break;
                }
            }

            for (var i = 0; i < this.dashboardTabsDropDown.length; i++ ) {
                if (this.dashboardTabsDropDown[i].value.name == TM.name) {
                    this.dashboardTabsDropDown.splice(i, 1);

                    break;
                }
            }
        }

        // Reset Delete Mode
        this.deleteMode = false;
        
    }

    detailTab() {
        // Show form with properties for the selected Tab

        // TODO - design in detail, no duplications ...
        this.globalFunctionService.printToConsole(this.constructor.name,'detailTab', '@Start');

        if (this.selectedTabName != undefined) {
            this.displayTabDetails = true;
        } else {
            this.globalVariableService.growlGlobalMessage.next({
                severity: 'warn', 
                summary:  'No Tab', 
                detail:   'Please select a Tab from the dropdown, then click to see its detail'
            });
            
        }
    }

    onDashboardDetail (event) {
        // Show detail about the selected Dashboard
        // TODO - design in detail, no duplications ...
        this.globalFunctionService.printToConsole(this.constructor.name,'onDashboardDetail', '@Start');

        if (this.selectedDashboardName['name'] != undefined) {

            // Refresh the data on the form, and then show it
            this.displayDashboardDetails = true;
            // this.dashboardEditor.refreshForm();
        } else {
            this.globalVariableService.growlGlobalMessage.next({
                severity: 'warn', 
                summary:  'No Dashboard', 
                detail:   'Please select a Dashboard from the dropdown, then click to see its detail'
            });
            
        }
    }

    onDashboardDelete() {
        // Confirm if user really wants to delete
        // TODO - this guy needs Two clicks to close dialogue, but then deletes twice!!
        this.globalFunctionService.printToConsole(this.constructor.name,'onDashboardDelete', '@Start');

        this.deleteMode = true;
        
        this.confirmationService.confirm({
            message: 'Are you sure that you want to delete this Dashboard?',
            accept: () => {
                this.DashboardDeleteIt();
                this.deleteMode = false;
            },
            reject: () => {
                this.deleteMode = false;
            }
        });
    }

    DashboardDeleteIt() {
        // Delete Dashboard button
        this.globalFunctionService.printToConsole(this.constructor.name,'DashboardDeleteIt', '@Start');

        // Bring back the value field of the selected item.
        // TODO: could not get it via .value  Although this makes sense, see PrimeNG site,
        //       I had to make a workaround
        let TM: any = this.selectedDashboardName;

        // If something was selected, loop and find the right one
        if (TM != undefined) {

            // Travers
            for (var i = 0; i < this.dashboards.length; i++ ) {
                if (this.dashboards[i].dashboardID - TM.id == 0) {
                    this.globalFunctionService.printToConsole(this.constructor.name,'DashboardDeleteIt', 'Deleting ' + TM.name + ' ...');
                    this.dashboards.splice(i, 1);
                    this.resetDashboardDropDowns(this.currentFilter);

                    // Tell the user
                    this.globalVariableService.growlGlobalMessage.next({
                        severity: 'info', 
                        summary:  'Dashboard deleted', 
                        detail:   'The Dashboard has been deleted: ' + TM.name
                    });

                    break;
                }
            }
        }

        // Reset Delete Mode
        this.deleteMode = false;
        
    }

    onDashboardAdd() {
        // Add Dashboard button
        // TODO - set IDs properly when going to DB - this is error prone
        this.globalFunctionService.printToConsole(this.constructor.name,'onDashboardAdd', '@Start');

        // Get Max ID
        let maxID: number = -1;
        if (this.dashboards.length > 0) {
            maxID = this.dashboards[this.dashboards.length - 1].dashboardID;
        }

        // Add
        // TODO - do via DB RESTi
        this.numberUntitledDashboards = this.numberUntitledDashboards + 1;
        this.dashboards.push (
            {
                dashboardID: maxID + 1,
                dashboardCode: 'Untitled - ' + this.numberUntitledDashboards.toLocaleString(),
                dashboardName: '',

                dashboardBackgroundPicturePath: '',
                dashboardComments: 'Comments for ' + this.numberUntitledDashboards.toString(),
                dashboardCreatedDateTime: '2017/07/08',
                dashboardCreatedUserID: 'BenVdMark',
                dashboardDefaultExportFileType: 'PowerPoint',
                dashboardDescription: 'This is a unique and special dashboard, like all others',
                dashboardGroups: [
                    { dashboardGroupName: 'Favourites' },
                    { dashboardGroupName: 'Everyone'}
                ],
                dashboardIsLocked: false,
                dashboardLiked: [
                    { dashboardLikedUserID: 'AnnieA' },
                    { dashboardLikedUserID: 'BennieB' },
                    { dashboardLikedUserID: 'CharlesC' }
                ],
                dashboardOpenTabNr: 1,
                dashboardOwnerUserID: 'JohnH',
                dashboardPassword: 'StudeBaker',
                dashboardRefreshedDateTime: '',
                dashboardRefreshMode: 'Manual',
                dashboardSharedWith: [
                    {
                        dashboardSharedWithUserID: 'PeterP',
                        dashboardSharedWithType: 'Full'
                    }
                ],
                dashboardSystemMessage: '',
                dashboardUpdatedDateTime: '2017/07/08',
                dashboardUpdatedUserID: 'GordenJ'
            }
        );

        // Refresh the Array of Dashboards IF no current filter
        if (!this.hasAdvancedFilter) {
            let emptyFilter: Filter = null;
            this.resetDashboardDropDowns(emptyFilter);
        }

        // Tell the user
        this.globalVariableService.growlGlobalMessage.next({
            severity: 'info', 
            summary:  'Dashboard added', 
            detail:   'A new, empty Dashboard has been added: ' + 'Untitled - ' + 
                this.numberUntitledDashboards.toLocaleString()
        });
    }

    onWidgetResizeMouseDown(event, idWidget: number) {
        // Registers mouse position at mouse Dropdown
        // Just a note:  When the mouse is clicked, the sequence is:
        // 1. DragWidgetMouseDown
        // 2. ResizeMouseDown
        // Then 3 or 4
        // 3a. Drag Start
        // 3b. Drag End
        // 4.ResizeMouseUp

        this.globalFunctionService.printToConsole(this.constructor.name,'onWidgetResizeMouseDown', '@Start');

        // Leave if on move handle
        if (this.widgetDraggingEnabled) {
            return
        }

        this.containerStartX = event.x;
        this.containerStartY = event.y;
    }

    onWidgetResizeMouseUp(event, idWidget: number) {
        // After resizing, set width and height of widget
        this.globalFunctionService.printToConsole(this.constructor.name,'onWidgetResizeMouseUp', '@Start');

        // Leave if on move handle, or something bad
        if (this.widgetDraggingEnabled) {
            return
        }

        this.selectedWidget = this.widgets.filter(
            widget => widget.properties.widgetID === idWidget)[0] ;
        
        if (this.containerStartX != event.x  ||  this.containerStartY != event.y) {
            let endWith: number = this.selectedWidget.container.width + event.x - 
                this.containerStartX;
            let endHeight: number = this.selectedWidget.container.height + event.y - 
                this.containerStartY;

            // Left if bad stuff
            if (endWith == NaN  ||  endHeight == NaN) {
                return;
            }

            // Update the source data:
            //   There is no resize event, so it is difficult to know when the user
            //   was really, really resizing.  As a result, we cheat:
            //   - take the real Width & Height (from the DOM) and apply to the data.
            let realWidth = this.childrenWidgetContainers.filter(
                child  => child.nativeElement.id ==  idWidget)[0].
                    nativeElement.clientWidth;
            let realHeight = this.childrenWidgetContainers.filter(
                child  => child.nativeElement.id ==  idWidget)[0].
                    nativeElement.clientHeight;

            // TODO - consider if this should snap to the grid.  If so, remember to
            // render the Widget to the new dimensions
            this.widgets.filter(
                widget => widget.properties.widgetID === idWidget)[0].
                container.width = realWidth;        
            this.widgets.filter(
                widget => widget.properties.widgetID === idWidget)[0].
                container.height = realHeight;
        }
    }

    onDragEndNewWidget(event) {
        // Create new widget - End of dragging BarChart
        this.globalFunctionService.printToConsole(this.constructor.name,'onDragEndNewWidget', '@Start');

        // Get the X,Y from the mouse, and adjust for snapping to grid IF applied
        this.widgetToEditX = event.x;
        this.widgetToEditY = event.y;

        this.widgetToEditX = this.globalFunctionService.alignToGripPoint(this.widgetToEditX);
        this.widgetToEditY = this.globalFunctionService.alignToGripPoint(this.widgetToEditY);

        this.widgetToEdit = this.eazlService.getDefaultWidgetConfig();
        this.addEditModeWidgetEditor = 'Add';
        this.displayEditWidget = true;
    }

    onWidgetDragHandleMouseDown(idWidget: number) {
        // Enables dragging
        this.globalFunctionService.printToConsole(this.constructor.name,'onWidgetDragHandleMouseDown', '@Start');

        // If nothing is selected, make this makker selected
        if (this.selectedWidgetIDs.length == 0) {
            this.selectedWidgetIDs.push(idWidget);
        }

        // If this Widget is not in the selection, bail
        if (this.selectedWidgetIDs.indexOf(idWidget) < 0) {
            return;
        }

        this.widgetDraggingEnabled = true;
    }

    onWidgetDragHandleMouseUp() {
        // Disables dragging
        this.globalFunctionService.printToConsole(this.constructor.name,'onWidgetDragHandleMouseUp', '@Start');

        this.widgetDraggingEnabled = false;
    }

    onWidgetDragStart(event: DragEvent, idWidget: number) {
        // Starting of Widget dragging - IF dragging is enabled
        this.globalFunctionService.printToConsole(this.constructor.name,'onWidgetDragStart', '@Start');

        // Store the Start X, Y
        this.widgetStartDragX = event.x;
        this.widgetStartDragY = event.y;
    }

    onWidgetDragEnd(event: DragEvent) {
        // Dragging of Widget has ended - IF enabled !!
        this.globalFunctionService.printToConsole(this.constructor.name,'onWidgetDragEnd', '@Start');

        // On allow dragging while on the handle
        if (!this.widgetDraggingEnabled) {
            return;
        }

        // Store the End X, Y
        this.widgetEndDragX = event.x;
        this.widgetEndDragY = event.y;

        // Calc raw (x,y) offset, and new new X, Y
        let offsetLeft = this.widgetEndDragX - this.widgetStartDragX;
        let offsetTop  = this.widgetEndDragY - this.widgetStartDragY;

        // Do the real moving
        this.moveWidgets(offsetLeft, offsetTop);
    }

    moveWidgets(offsetLeft: number, offsetTop: number) {
        // Actual movement of the selected Widgets - this is split off to make it easy
        // to implement movement via arrow keys
        this.globalFunctionService.printToConsole(this.constructor.name,'moveWidgets', '@Start');

        // Snap to grid
        offsetLeft = this.globalFunctionService.alignToGripPoint(offsetLeft);
        offsetTop = this.globalFunctionService.alignToGripPoint(offsetTop);

        let newLeft = 0;
        let newTop = 0;

        // Loop on the Array of selected IDs, and do things to it
        for (var i = 0; i < this.selectedWidgetIDs.length; i++) {
            // Get the Selected One
            this.selectedWidget = this.widgets.filter(
                widget => widget.properties.widgetID === this.selectedWidgetIDs[i])[0] ;
            let selectedElement = this.childrenWidgetContainers.filter(
                child  => child.nativeElement.id ==  this.selectedWidgetIDs[i].toString())[0] 

            // Loop on the ViewChildren, and act for the Selected One
            if (selectedElement != undefined) {

                // Get new left + top, adjusted for grid-snapping if so desired
                newLeft = this.selectedWidget.container.left + offsetLeft;
                newTop = this.selectedWidget.container.top + offsetTop;

                newLeft = this.globalFunctionService.alignToGripPoint(newLeft);
                newTop = this.globalFunctionService.alignToGripPoint(newTop);

                // Move Widget Left 
                this.renderer.setElementStyle(selectedElement.nativeElement,
                    'left', newLeft.toString() + "px"
                );

                // Update the Left data
                this.widgets.filter(
                    widget => widget.properties.widgetID === 
                        this.selectedWidgetIDs[i])[0].
                            container.left = newLeft;

                // Move Widget Top
                this.renderer.setElementStyle(selectedElement.nativeElement,
                    'top', newTop.toString() + "px"
                );


                // Update the Top data
                this.widgets.filter(
                    widget => widget.properties.widgetID === 
                        this.selectedWidgetIDs[i])[0].
                            container.top = newTop;
            }
        }

        // Dont do it again
        this.widgetDraggingEnabled = false;

    }
    
    bringWidgetToFront()  {
        // Bring the selected Widgets to the front via z-index
        this.globalFunctionService.printToConsole(this.constructor.name, 'bringWidgetToFront', '@Start');

        // Get Max z-Index
        let maxZindex: number = 0;
        for (var i = 0; i < this.widgets.length; i++) {
            maxZindex = Math.max(maxZindex, this.widgets[i].properties.widgetIndex);
        }
        maxZindex = maxZindex + 1;

        // Loop on selected ones
        for (var i = 0; i < this.selectedWidgetIDs.length; i++) {

            // Loop on the ViewChildren, and act for the Selected One
            let selectedElement = this.childrenWidgetContainers.filter(
                child  => child.nativeElement.id ==  this.selectedWidgetIDs[i].toString())[0] 

            if (selectedElement != undefined) {
                this.renderer.setElementStyle(selectedElement.nativeElement,
                    'z-index', maxZindex.toString()
                );

                // Update the data
                this.widgets.filter(
                    widget => widget.properties.widgetID === 
                        this.selectedWidgetIDs[i])[0].properties.widgetIndex = maxZindex; 
            }

            // Refresh the Dashboard
            this.refreshDashboard = true;
        }
    }

    changeDashboardSettings() {
        // Change the Dashboard Settings as selected on the form
        // TODO: this must be done via DB
        // TODO: there could be many more settings.  Decide.
        this.globalFunctionService.printToConsole(this.constructor.name, 'changeDashboardSettings', '@Start');

        // // For one day
        // let number = this.document.body.scrollTop;
        // console.log(number);
        // this.document.body.style.zoom='0.5';

        // Set the document / body background color
        if (this.selectedBackgroundColorDashboard) {
            this.document.body.style.backgroundColor =  
                this.selectedBackgroundColorDashboard['name'];
        }

        if (this.selectedBackgroundImageDashboard) {
            this.document.body.style.backgroundImage = 
                this.selectedBackgroundImageDashboard['name'];
        }

        // Hide popup form
        this.displayDashboardSettings = false;
    }

    copyWidget() {
        // Copy (duplicate) selected Widgets
        this.globalFunctionService.printToConsole(this.constructor.name, 'copyWidget', '@Start');

        // Exit if nothing to do
        if (this.selectedWidgetIDs.length == 0) {
            return
        }
        
        // Loop on selected ones
        for (var i = 0; i < this.selectedWidgetIDs.length; i++) {

            // Make  a copy
            let widgetOriginal: Widget[] = this.widgets.filter(
                w => w.properties.widgetID == this.selectedWidgetIDs[i]);
            let widgetToCopy: Widget = JSON.parse(JSON.stringify(widgetOriginal[0]));

            // Minor adjustments
            widgetToCopy.properties.widgetName = 
                widgetToCopy.properties.widgetName + ' (Copy)'
            widgetToCopy.container.widgetTitle = 
                widgetToCopy.container.widgetTitle + ' (Copy)'
            widgetToCopy.container.left = 
                widgetToCopy.container.left + (this.gridSize * 2);
            widgetToCopy.container.top = 
                widgetToCopy.container.top + (this.gridSize * 2);

            // TODO - this is crude & error prone: do it properly in DB
            let lastWidgetID = 
                this.widgets[this.widgets.length - 1].properties.widgetID;

            // Set the Widget ID & Add to Array
            // TODO - do via Eazl into DB
            widgetToCopy.properties.widgetID = lastWidgetID + 1;
            this.widgets.push(widgetToCopy);

            // Refresh the Dashboard
            this.refreshDashboard = true;
        }

        // Inform the user
        this.globalVariableService.growlGlobalMessage.next({
            severity: 'info',
            summary:  'Success',
            detail:   'Widgets copied'
        });
    }

    onSelectBackgroundColor() {
        // Set the sample background color
        this.globalFunctionService.printToConsole(this.constructor.name, 'onSelectBackgroundColor', '@Start');

        if (this.selectedBackgroundColor != undefined) {
            this.sampleColorWidgetBackgroundColor = this.selectedBackgroundColor.name;
        }
        if (this.selectedColor != undefined) {
            this.sampleColorWidgetBackgroundColor = this.selectedColor.name;
        }
       
    }

    onClickExpandArea(areaToExpand: string) {
        // Expand the selected area in the widget palette, and close the rest
        this.globalFunctionService.printToConsole(this.constructor.name, 'onClickExpandArea', '@Start');
        this.displayExpandBackgroundArea = false; 
        this.displayExpandBorder = false; 
        this.displayExpandBoxShadow = false; 
        this.displayExpandColor = false; 
        this.displayExpandFontSize = false; 
        this.displayExpandGridSize = false;

        if (areaToExpand == 'displayExpandBackgroundArea') {
            this.displayExpandBackgroundArea = true;
        }
        if (areaToExpand == 'displayExpandBorder') {
            this.displayExpandBorder = true;
        }        
        if (areaToExpand == 'displayExpandBoxShadow') {
            this.displayExpandBoxShadow = true;
        }        
        if (areaToExpand == 'displayExpandColor') {
            this.displayExpandColor = true;
        }        
        if (areaToExpand == 'displayExpandFontSize') {
            this.displayExpandFontSize = true;
        }     
        if (areaToExpand == 'displayExpandGridSize') {
            this.displayExpandGridSize = true;
        }     

    }

    onWidgetSelectAll() {
        // Select all the widgets
        this.globalFunctionService.printToConsole(this.constructor.name, 'onWidgetSelectAll', '@Start');
        
        // Kill and rebuild.  This destroys select-order, but for now I think it is okay ...
        this.selectedWidgetIDs = [];

        // Loop and build
        for (var i = 0; i < this.widgets.length; i++) {
                this.selectedWidgetIDs.push(this.widgets[i].properties.widgetID);
        }
    }

    loadDashboardTabs(event) {
        // Load the Tabs for the selected Dashboard
        this.globalFunctionService.printToConsole(this.constructor.name, 'loadDashboardTabs', '@Start');

        // Get its Tabs in this Dashboard
        this.dashboardTabsDropDown = [];
        this.selectedDashboardID = event.value.id;
        this.dashboardTabs = this.eazlService.getDashboardTabs(this.selectedDashboardID);

        // Fill the dropdown on the form
        for (var i = 0; i < this.dashboardTabs.length; i++) {
            this.dashboardTabsDropDown.push({
                label: this.dashboardTabs[i].widgetTabName,
                value: {
                    id: this.dashboardTabs[i].widgetTabID,
                    name: this.dashboardTabs[i].widgetTabName
                }
            });
        }

        // Reset the list of selected Widgets, Widgets and refresh Dashboard area
        this.selectedWidgetIDs = [];
        this.widgets= [];
        this.refreshDashboard = true;
    }

    loadDashboard(event) {
        // Load the selected Dashboard for a given DashboardID & TabName
        // - get Dashboard info from DB
        // - get Widgets for this Dashboard from DB
        // - show all the Widgets as per their properties
        this.globalFunctionService.printToConsole(this.constructor.name, 'loadDashboard', '@Start');

        // Reset the list of selected Widgets
        this.selectedWidgetIDs = [];

        // Set the Selected One
        this.selectedDashboardTabName = event.value.name;

        // Get its Widgets
        this.widgets = this.eazlService.getWidgetsForDashboard(
            this.selectedDashboardID, 
            this.selectedDashboardTabName
        );

        // Set to review in ngAfterViewChecked
        this.refreshDashboard = true;
    }

    dashboardRefresh() {
        // Render the widgets according to their properties
        this.globalFunctionService.printToConsole(this.constructor.name,'dashboardRefresh', '@Start');

        // Loop on the container ElementRefs, and set properties ala widget[].properties
        if (this.childrenWidgetContainers.toArray().length > 0) {
            for (var i = 0; i < this.widgets.length; i++) {

                // Style attributes
                this.renderer.setElementStyle(this.childrenWidgetContainers.toArray()
                    [i].nativeElement,
                    'background-color', this.widgets[i].container.backgroundColor
                );

                if (this.widgets[i].container.border != '') {
                    this.renderer.setElementStyle(this.childrenWidgetContainers.toArray()
                        [i].nativeElement,
                        'border', this.widgets[i].container.border
                    );
                }
                if (this.widgets[i].container.boxShadow != '') {
                    this.renderer.setElementStyle(this.childrenWidgetContainers.toArray()
                        [i].nativeElement,
                        'box-shadow', this.widgets[i].container.boxShadow
                    );
                }
                this.renderer.setElementStyle(this.childrenWidgetContainers.toArray()
                    [i].nativeElement,
                    'color', this.widgets[i].container.color
                );
                this.renderer.setElementStyle(this.childrenWidgetContainers.toArray()
                    [i].nativeElement,
                    'font-size', this.widgets[i].container.fontSize.toString() + 'em'
                );

                this.renderer.setElementStyle(this.childrenWidgetContainers.toArray()
                    [i].nativeElement,
                    'height', this.widgets[i].container.height.toString() + 'px'
                );
                this.renderer.setElementStyle(this.childrenWidgetContainers.toArray()
                    [i].nativeElement,
                    'left', this.widgets[i].container.left.toString() + 'px'
                );
                this.renderer.setElementStyle(this.childrenWidgetContainers.toArray()
                    [i].nativeElement,
                    'top', this.widgets[i].container.top.toString() + 'px'
                );
                this.renderer.setElementStyle(this.childrenWidgetContainers.toArray()
                    [i].nativeElement,
                    'width', this.widgets[i].container.width.toString() + 'px'
                );

                // Other Attributes, like ID
                this.renderer.setElementAttribute(
                    this.childrenWidgetContainers.toArray()[i].nativeElement,
                    'id',
                    this.widgets[i].properties.widgetID.toString()
                );
            }
        }

        // Loop on the container ElementRefs, and set properties ala widget[].properties
        if (this.childrenWidgetText.toArray().length > 0) {
            for (var i = 0; i < this.widgets.length; i++) {

                // Style attributes IF it has text (else *ngIf is buggered)
                if (this.widgets[i].areas.showWidgetText) {
                    this.renderer.setElementStyle(
                        this.childrenWidgetText.toArray()[i].nativeElement,
                        'background-color', this.widgets[i].textual.textBackgroundColor
                    );
                    this.renderer.setElementStyle(
                        this.childrenWidgetText.toArray()[i].nativeElement,
                        'border', this.widgets[i].textual.textBorder
                    );
                    this.renderer.setElementStyle(
                        this.childrenWidgetText.toArray()[i].nativeElement,
                        'color', this.widgets[i].textual.textColor
                    );
                    this.renderer.setElementStyle(
                        this.childrenWidgetText.toArray()[i].nativeElement,
                        'font-size', this.widgets[i].textual.textFontSize.toString() + 'px'
                    );
                    this.renderer.setElementStyle(
                        this.childrenWidgetText.toArray()[i].nativeElement,
                        'font-weight', this.widgets[i].textual.textFontWeight
                    );
                    this.renderer.setElementStyle(
                        this.childrenWidgetText.toArray()[i].nativeElement,
                        'height', this.widgets[i].textual.textHeight.toString() + 'px'
                    );
                    this.renderer.setElementStyle(
                        this.childrenWidgetText.toArray()[i].nativeElement,
                        'left', this.widgets[i].textual.textLeft.toString() + 'px'
                    );
                    this.renderer.setElementStyle(
                        this.childrenWidgetText.toArray()[i].nativeElement,
                        'margin', this.widgets[i].textual.textMargin
                    );
                    this.renderer.setElementStyle(
                        this.childrenWidgetText.toArray()[i].nativeElement,
                        'padding', this.widgets[i].textual.textPadding
                    );
                    this.renderer.setElementStyle(
                        this.childrenWidgetText.toArray()[i].nativeElement,
                        'position', this.widgets[i].textual.textPosition
                    );
                    this.renderer.setElementStyle(
                        this.childrenWidgetText.toArray()[i].nativeElement,
                        'text-align', this.widgets[i].textual.textTextAlign
                    );
                    this.renderer.setElementStyle(
                        this.childrenWidgetText.toArray()[i].nativeElement,
                        'top', this.widgets[i].textual.textTop.toString() + 'px'
                    );
                    if (this.widgets[i].textual.textWidth == 0) {
                        this.renderer.setElementStyle(
                            this.childrenWidgetText.toArray()[i].nativeElement,
                            'width',  Math.max(5, this.widgets[i].container.width - 10).toString() + 'px'
                        );
                    } else {
                        this.renderer.setElementStyle(
                            this.childrenWidgetText.toArray()[i].nativeElement,
                            'width',  this.widgets[i].textual.textWidth.toString() + 'px'
                        );
                    }
                }
            }
        }

        // Loop on the children ElementRefs, and set properties ala widget[].properties
        if (this.childrenWidgets.toArray().length > 0) {
            for (var i = 0; i < this.widgets.length; i++) {
                if (this.widgets[i].areas.showWidgetGraph) {
                    // Other Attributes, like ID
                    this.renderer.setElementAttribute(
                        this.childrenWidgets.toArray()[i].nativeElement,
                        'id',
                        this.widgets[i].properties.widgetID.toString()
                    );

                    // Set top depending on text line or not
                    if (this.widgets[i].areas.showWidgetText) {
                        this.renderer.setElementStyle(
                            this.childrenWidgets.toArray()[i].nativeElement,
                            'top', '40px'
                        );
                    } else {
                        this.renderer.setElementStyle(
                            this.childrenWidgets.toArray()[i].nativeElement,
                            'top', '20px'
                        );
                    }

                    // Show the Graphs
                    var view = new vg.View(vg.parse( this.widgets[i].graph.spec ));
                    view.renderer('svg')
                        .initialize( this.childrenWidgets.toArray()[i].nativeElement)
                        .hover()
                        .run();
                }
            }
        }
    }

    getDashboards() {
        // Get the dashboards from the DB
        this.globalFunctionService.printToConsole(this.constructor.name,'getDashboards', '@Start');

        // Set the list of Dashboards
        // TODO - get from RESTI
        this.dashboards = this.eazlService.getDashboards();

        // Make Dashboard Dropdown the same set
        let emptyFilter: Filter = null;
        this.resetDashboardDropDowns(emptyFilter);
     }

     resetDashboardDropDowns(inputFilter: Filter) {
        // Reset the Dashboard Dropdown list = Array of Dashboards
        this.globalFunctionService.printToConsole(this.constructor.name,'getDashboardDropDowns', '@Start');

        // Reset
        let recordPassesFilter: boolean;
        this.dashboardDropDown = [];
        for (var i = 0; i < this.dashboards.length; i++) {

            // Filter, IF we have specified something
            recordPassesFilter = true;
            if (inputFilter != null) {
                if (inputFilter.owner != '') {
                    if (this.dashboards[i].dashboardOwnerUserID.toLocaleLowerCase().indexOf(inputFilter.owner.toLocaleLowerCase())
                        == -1) {
                            recordPassesFilter = false
                    }
                }
                if (inputFilter.description != '') {
                    if (this.dashboards[i].dashboardDescription.toLocaleLowerCase().indexOf(inputFilter.description.toLocaleLowerCase())
                        == -1) {
                            recordPassesFilter = false
                    }
                }
            }

            // Fill the select items if it qualifies
            if (recordPassesFilter) {
                this.dashboardDropDown.push({
                    label: this.dashboards[i].dashboardCode,
                    value: {
                        id: this.dashboards[i].dashboardID,
                        code: this.dashboards[i].dashboardCode,
                        name: this.dashboards[i].dashboardName
                    }
                });
            }
        }
    }

    resetTabsDropDown () {
        // Reset the tabs for the selected Dashboard
        // TODO - fix content, layout + when / where to call
        this.globalFunctionService.printToConsole(this.constructor.name,'resetTabsDropDown', '@Start');
        alert ('refresh tabs for sel. Dashboard');
    }

}

// Grid Layout Notes
// Just notes if we every decide to make a Grid layout (remember, think it through first,
// particularly how it will be editted afterwards) ....
// 1. get nr of cols as input, set to C
// 2. call function to Select All widgets
// 3. call function to sameWidth and sameHeight all widgets
// 4. set L, T of first widget - tricky as which one is best.  User decides?
// 5. calc r = number of rows: adjust for extras, so 15 widgets give 4 rows (r=0,1,2,3)
//         n = number of widgets, k = n // C (integer divide, so 15 // 4 = 3)
//         k: if n % C = 0 then r = r +1
// 6. Loop on r:
//         Loop on Wi (all widgets in row = r)
//                 i = [ (r + k) * ci)] + ci
//                 r = 0, 1 ... k (k = number of rows)
//                 ci = 0, 1 ... (C-1) (C is number of cols)
//                 say n=15, C = 4.  Then k = 4, r = 0,1,2,3
//                 First rows: [ (0 * 4) * 0] + 0 = 0,   [(0 * 4) * 0] + 1 = 1, etc
//             left = L * i (adjust horisontally in equal increments )
//             top = T * i  (all the same) 
