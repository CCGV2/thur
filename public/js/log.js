
opeLog = []
function makeLogData(event){
    console.log("makeLogData");
    console.log(event);
    console.log(event.propertyName);
    console.log(event.Transaction);
    console.log(event.oldValue);
    console.log(event.newValue);
    if (event.isTransactionFinished){
        console.log(opeLog);
        opeLog = [];
    }
}