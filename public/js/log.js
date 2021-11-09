opeLog = []
startlog = 0;
opeId = 0;
routeLog = [];
routeOpeId = 0;
textLog = [];
/*
fields:
table1: opeID, opeType, startTime, endTime
table2: logID, belongOpe, objectKey, objectType, objectText, logTime, propertyOld, propertyNew, eventID
table3: eventID, eventType, eventTime, eventOld, eventNew, objectType, objectKey
 */
table1 = []
table2 = []
table3 = []
function makeLog(logID,belongOpe,objectKey,objectType,objectText,logTime,propertyOld,propertyNew){
    return {
        "logID":logID,
        "belongOpe":belongOpe,
        "objectKey":objectKey,
        "objectType":objectType,
        "objectText":objectText,
        "logTime":logTime,
        "propertyOld":propertyOld,
        "propertyNew":propertyNew
    }
}
function makeOpe(opeID, opeType, startTime, endTime){
    return {
        'opeID':opeID,
        'opeType':opeType, 
        'startTime':startTime, 
        'endTime':endTime
    }
}
function addLog(evt, changes){
    console.log("addLog");
    console.log(evt);
    console.log(evt.propertyName);
    console.log(evt.toString());
    console.log(evt.oldValue);
    var opeType = evt.oldValue;
    // console.log(opeLog);
    switch(opeType){
        case "ExternalCopy":
            addOpe(table1.length, opeType, changes[0].logTime, changes[changes.length - 1].logTime)
    //         // console.log(routeLog);
            break;
        case "new node":
            addOpe(table1.length, "AddingNode", changes[0].logTime, changes[changes.length - 1].logTime)
            break;
        case "Shifted Label":
            addOpe(table1.length, "LabelShifting", changes[0].logTime, changes[changes.length - 1].logTime)
            break;
        case "start to edit text":
            break;
        case "input text":
            addOpe(table1.length, "input text", changes[0].logTime, changes[changes.length - 1].logTime)
            break;
        case "TextEditing":
            addOpe(table1.length, "TextEditing", changes[0].logTime, changes[changes.length - 1].logTime)
            break;
        default:
            addOpe(table1.length, opeType, changes[0].logTime, changes[changes.length - 1].logTime)
            break;
    }
    for (var i = 0 ; i < changes.length; i++){
        // if (changes[i].objectKey)
        console.log(changes[i]);
        table2.push(makeLog(table2.length, table1.length-1, changes[i].objectKey, changes[i].objectType,changes[i].objectText,changes[i].logTime,changes[i].propertyOld,changes[i].propertyNew))
    }
}
function addOpe(ID, Type, starttime, endtime){
    table1.push({"opeId":startlog + table1.length, "opeType":Type, "startTime":starttime, "endTime":endtime})
}
function addEvent(){
}

function addRolledBack(logs){
    console.log("rolledBackLog:");
    console.log(logs);
    table3.push({"eventID":table3.length, "eventType":"Rolledback", "eventTime":logs[logs.length-1].time, "eventOld":null, "eventNew":null, "objectType":logs[0].objectType, "objectKey":logs[0].objectKey})
    
    for (var i = 0; i < logs.length; i++){
        table2.push({"logID":table2.length, "belongOpe":0, "objectKey":logs[i].objectKey, "objectType":logs[i].objectType, 
        "objectText":logs[i].objectText, "logTime":logs[i].logTime, "propertyOld":logs[i].propertyOld, 
        "propertyNew":logs[i].propertyNew, "eventID":table3.length-1});
    }
}
function makeLogData(event){
    // Use opeLog to store all the logs. Call different function to write in different tables. 
    if (event.object){
        // console.log("object.key", event.object.key);
        // console.log("object.category", event.object.category);
        // console.log("object.text", event.object.text);
        opeLog.push({
            "logId":startlog+opeLog.length, 
            "belongOpe":opeId, 
            "logPropertyName":event.propertyName, 
            "logOld":event.oldValue, 
            "logNew":event.newValue, 
            "time":new Date().getTime(), 
            "objectKey": event.object.key, 
            "objectText": event.object.text, 
            "objectCategory": event.object.category
        });
    }else{
        console.log(event);
    }
    // console.log(event.Transaction);
    // console.log(opeLog);
    // if (event.isTransactionFinished){
    //     console.log("opeLog:");
    //     console.log(opeLog);
    //     if (routeLog.length != 0 && (event.oldValue == "ExternalCopy")){
    //         console.log("AddLog!!!");
    //         // addOpe();
    //         addLog();
    //         routeLog = [];
    //         opeLog = [];
    //     }else if (routeLog.length != 0){
    //         console.log("AddRolledBack!!!!");
    //         addRolledBack(routeLog);
    //         routeLog = [];
    //     }else if (event.oldValue == "input text"){
    //         console.log("inputText");
    //         textLog += opeLog;
    //     }else if (event.oldValue == "TextEditing"){
    //         if (textLog.length != 0){
    //             addLog();
    //         }else{
    //             addEvent();
    //         }
    //     }
    //     else {
    //         addLog();
    //     }
    //     opeLog = [];
    //     opeId += 1;
    // }else if (event.propertyName == "nodeDataArray" && event.newValue == null && opeLog[0].logPropertyName != "StartedTransaction"){
    //     routeLog = opeLog;
    //     routeOpeId = opeId;
    //     opeLog = [];
    // }
}