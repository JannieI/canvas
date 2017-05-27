// Schema for the Group classes

// Users registered to use the system
export class Group {
    groupID: number;
    groupName: string;
    groupDescription: string;
    groupCreatedDateTime: string;          // Created on
    groupCreatedUserID: string;            // Created by
    groupUpdatedDateTime: string;          // Updated on
    groupUpdatedUserID: string;            // Updated by
}