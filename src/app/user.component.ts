// User form
import { Component }                  from '@angular/core';
import { OnInit }                     from '@angular/core';
import { ViewEncapsulation }          from '@angular/core';

// PrimeNG
import { ConfirmationService }        from 'primeng/primeng';  
import { MenuItem }                   from 'primeng/primeng';  
import { Message }                    from 'primeng/primeng';  

// Our Components

// Our Services
import { EazlService }                from './eazl.service';
import { GlobalFunctionService }      from './global-function.service';
import { GlobalVariableService }      from './global-variable.service';

// Our models
import { EazlUser }                   from './model.user';
import { Group }                      from './model.group';
import { User }                       from './model.user';
import { UserGroupMembership }        from './model.userGroupMembership';

@Component({
    selector:    'user',
    templateUrl: 'user.component.html',
    styleUrls:  ['user.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class UserComponent implements OnInit {
    
    // Local properties
    addEditMode: string;                                // Add/Edit to indicate mode
    availableUserGroupMembership: Group[] = [];         // List of Groups user does NOT belongs to
    belongstoUserGroupMembership: Group[] = [];         // List of Groups user already belongs to   
    deleteMode: boolean = false;                        // True while busy deleting
    displayGroupMembership: boolean = false;            // True to display popup for GrpMbrship
    displayUserPopup: boolean = false;                  // True to display single User
    groups: Group[] = [];                               // List of Groups
    popupHeader: string = 'User Maintenance';           // Popup header
    popuMenuItems: MenuItem[];                          // Items in popup
    selectedUser: User;                                 // User that was clicked on
    users: User[];
    usergroupMembership: UserGroupMembership[] = [];    // List of User-Group   

    constructor(
        private confirmationService: ConfirmationService,
        private eazlService: EazlService,
        private globalFunctionService: GlobalFunctionService,
        private globalVariableService: GlobalVariableService,
        ) {
    }
    
    ngOnInit() {
        this.globalFunctionService.printToConsole(this.constructor.name,'ngOnInit', '@Start');
 
        // Initialise variables
        this.eazlService.getUsers()
            .then(users => {this.users = users
                
            })
            .catch( err => {console.log(err)} );
        this.popuMenuItems = [
            {
                label: 'Add', 
                icon: 'fa-plus', 
                command: (event) => this.userMenuAdd(this.selectedUser)
            },
            {
                label: '______________________________', 
                icon: '',
                disabled: true 
            },
            {
                label: 'Edit', 
                icon: 'fa-pencil', 
                command: (event) => this.userMenuEdit(this.selectedUser)
            },
            {
                label: 'Delete', 
                icon: 'fa-minus', 
                command: (event) => this.userMenuDelete(this.selectedUser)
            },
            {
                label: 'Group Membership', 
                icon: 'fa-users', 
                command: (event) => this.userMenuGroupMembership(this.selectedUser)
            },
            {
                label: 'Access', 
                icon: 'fa-database', 
                command: (event) => this.userMenuAccess(this.selectedUser)
            },
            {
                label: 'Related Data Sources', 
                icon: 'fa-list', 
                command: (event) => this.userMenuRelatedDataSources(this.selectedUser)
            },
            {
                label: 'Message History', 
                icon: 'fa-comments', 
                command: (event) => this.userMenuMessageHistory(this.selectedUser)
            },
            {
                label: 'Report History', 
                icon: 'fa-table', 
                command: (event) => this.userMenuReportHistory(this.selectedUser)
            },
            {
                label: 'Reset Password', 
                icon: 'fa-unlock', 
                command: (event) => this.userMenuResetPassword(this.selectedUser)
            },
            
        ];

    }

    userMenuAdd(user: User) {
        // Popup form to add a new user
        // - User: currently selected row
        this.globalFunctionService.printToConsole(this.constructor.name,'userMenuAdd', '@Start');
        this.addEditMode = 'Add';
        this.displayUserPopup = true;
    }
    
    userMenuEdit(user: User) {
        // Edit selected user on a popup form
        // - User: currently selected row
        this.globalFunctionService.printToConsole(this.constructor.name,'userMenuEdit', '@Start');

        this.globalVariableService.growlGlobalMessage.next({
            severity: 'info', 
            summary:  'Selected user', 
            detail:   user.firstName + ' - ' + user.lastName
        });

        this.addEditMode = 'Edit';
        this.displayUserPopup = true;    
    }

    userMenuDelete(user: User) {
        // Delete the selected user, but first confirm

        this.deleteMode = true;
        this.confirmationService.confirm({
            message: 'Are you sure that you want to delete this record?',
            reject: () => { 
                this.deleteMode = false;
                return;
            },
            accept: () => {

                // - User: currently selected row
                this.globalFunctionService.printToConsole(this.constructor.name,'onSubmit', '@Start');
                let index = -1;
                for(let i = 0; i < this.users.length; i++) {
                    if(this.users[i].userName == user.firstName) {
                        index = i;
                        break;
                    }
                }
                this.users.splice(index, 1);
                this.deleteMode = false;

                this.globalVariableService.growlGlobalMessage.next({
                    severity: 'info', 
                    summary:  'User deleted', 
                    detail:   user.firstName + ' - ' + user.lastName
                });
            }
        })
    }

    userMenuGroupMembership(user: User) {
        // Manage group membership for the selected user
        // - User: currently selected row
        this.globalFunctionService.printToConsole(this.constructor.name,'userMenuGroupMembership', '@Start');

        // Get the username
        if (this.globalVariableService.canvasUser.getValue() == null) {
            this.globalVariableService.growlGlobalMessage.next({
                severity: 'warn', 
                summary:  'User not logged in!', 
                detail:   user.firstName + ' - ' + user.lastName
            });
            return;
        }
        let username: string = this.globalVariableService.canvasUser.getValue().username;

        // Get the current and available groups
        this.eazlService.getUserGroupMembership(username, true)
            .then(inclgrp => {
                this.belongstoUserGroupMembership = inclgrp;
                this.eazlService.getUserGroupMembership(username, false)
                    .then (exclgrp => {
                            this.availableUserGroupMembership  = exclgrp;
                            this.displayGroupMembership = true; 
                    })
                    .catch(error => console.log (error))
            })
            .catch(error => console.log (error) )
console.log('belongstoUserGroupMembership',this.belongstoUserGroupMembership)
console.log('availableUserGroupMembership',this.availableUserGroupMembership)

// this.eazlService.getUsersResti()
//     .then(eazlUser => {
//         this.globalFunctionService.printToConsole(this.constructor.name,'ngOnInit', '  Setted fake username janniei & preferences for Testing');

//         // Show
// console.log('gotit')    
//     })
//     .catch(err => {
//         this.globalFunctionService.printToConsole(this.constructor.name,'ngOnInit', '  Fake login failed!!');
//         }
    // ) 




        // Tell user ...
        // this.globalVariableService.growlGlobalMessage.next({
        //     severity: 'info', 
        //     summary:  'User group membership', 
        //     detail:   user.firstName + ' - ' + user.lastName
        // });
    }

    onMoveToTargetUserGroupMembership() {
        // User clicked onMoveToTarget on Group Membership: add grp membership
        this.globalFunctionService.printToConsole(this.constructor.name,'onMoveToTargetUserGroupMembership', '@Start');

        // Add this makker
        this.eazlService.addUserGroupMembership('janniei',6)
console.log(this.selectedUser)
    }

    onMoveToSourceUserGroupMembership() {
        // User clicked onMoveToSource on Group Membership - remove grp membership
        this.globalFunctionService.printToConsole(this.constructor.name,'onMoveToSourceUserGroupMembership', '@Start');

        // Remove this makker
        this.eazlService.deleteUserGroupMembership('janniei',0)
    }

    onSourceReorderUserGroupMembership() {
        // User clicked onSourceReorder on Group Membership
        this.globalFunctionService.printToConsole(this.constructor.name,'onSourceReorderUserGroupMembership', '@Start');
    }

    onTargetReorderUserGroupMembership() {
        // User clicked onTargetReorder on Group Membership
        this.globalFunctionService.printToConsole(this.constructor.name,'onTargetReorderUserGroupMembership', '@Start');
    }

    userMenuAccess(user: User) {
        // Access to Data Sources for the selected user
        // - User: currently selected row
        this.globalFunctionService.printToConsole(this.constructor.name,'userMenuAccess', '@Start');

        this.globalVariableService.growlGlobalMessage.next({
            severity: 'info', 
            summary:  'User Access', 
            detail:   user.firstName + ' - ' + user.lastName
        });
    }

    userMenuRelatedDataSources(user: User) {
        // Manage related Data Sources (owned, given rights and received rights)
        // - User: currently selected row
        this.globalFunctionService.printToConsole(this.constructor.name,'userMenuRelatedDataSources', '@Start');

        this.globalVariableService.growlGlobalMessage.next({
            severity: 'info', 
            summary:  'Related Data Sources', 
            detail:   user.firstName + ' - ' + user.lastName
        });
    }

    userMenuMessageHistory(user: User) {
        // Show history of messages for the selected user
        // - User: currently selected row
        this.globalFunctionService.printToConsole(this.constructor.name,'userMenuMessageHistory', '@Start');

        this.globalVariableService.growlGlobalMessage.next({
            severity: 'info', 
            summary:  'User Message History', 
            detail:   user.firstName + ' - ' + user.lastName
        });
    }

    userMenuReportHistory(user: User) {
        // Show history of reports ran for the selected user
        // - User: currently selected row
        this.globalFunctionService.printToConsole(this.constructor.name,'userMenuReportHistory', '@Start');

        this.globalVariableService.growlGlobalMessage.next({
            severity: 'info', 
            summary:  'User Report History', 
            detail:   user.firstName + ' - ' + user.lastName
        });
    }
    
    userMenuResetPassword(user: User) {
        this.globalFunctionService.printToConsole(this.constructor.name,'userMenuResetPassword', '@Start');

        this.globalVariableService.growlGlobalMessage.next({
            severity: 'info', 
            summary:  'User Password Reset', 
            detail:   user.firstName + ' - ' + user.lastName
        });
    }

    handleUserPopupFormClosed(howClosed: string) {
        // Handle the event: howClosed = Cancel / Submit
        this.globalFunctionService.printToConsole(this.constructor.name,'handleUserPopupFormClosed', '@Start');

        this.displayUserPopup = false;
  }
}

// Notes for newbees:
//  Filtering is enabled by setting the filter property as true in column object. 
//  Default match mode is "startsWith" and this can be configured
//  using filterMatchMode property of column object that also accepts "contains", "endsWith", 
//  "equals" and "in". An optional global filter feature is available to search all fields with a keyword.
//  By default input fields are generated as filter elements and using templating any component 
//  can be used as a filter.